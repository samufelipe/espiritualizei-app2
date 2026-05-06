import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + (4 - s.length % 4) % 4, '=');
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

function b64urlEncode(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function concat(...arrs: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(arrs.reduce((s, a) => s + a.length, 0));
  let off = 0;
  for (const a of arrs) { out.set(a, off); off += a.length; }
  return out;
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, len * 8));
}

// ─── VAPID JWT (RFC 8292) ─────────────────────────────────────────────────────

async function makeVapidToken(audience: string, pubKeyB64: string, privKeyB64: string): Promise<string> {
  const pub = b64urlDecode(pubKeyB64);
  // Build JWK from uncompressed EC point (0x04 || x || y) + raw private scalar
  const jwk = {
    kty: 'EC', crv: 'P-256',
    x: b64urlEncode(pub.slice(1, 33)),
    y: b64urlEncode(pub.slice(33, 65)),
    d: privKeyB64,
  };
  const privateKey = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  );
  const enc = (o: object) => b64urlEncode(new TextEncoder().encode(JSON.stringify(o)));
  const header = enc({ typ: 'JWT', alg: 'ES256' });
  const payload = enc({ aud: audience, exp: Math.floor(Date.now() / 1000) + 43200, sub: 'mailto:admin@espiritualizei.com' });
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(`${header}.${payload}`)
  );
  return `${header}.${payload}.${b64urlEncode(new Uint8Array(sig))}`;
}

// ─── Content Encryption (RFC 8291 — aes128gcm) ───────────────────────────────

async function encryptPayload(plaintext: Uint8Array, p256dh: string, authB64: string): Promise<Uint8Array> {
  const receiverPub = b64urlDecode(p256dh);   // 65 bytes, uncompressed EC point
  const authSecret = b64urlDecode(authB64);   // 16 bytes

  // Ephemeral sender key pair
  const senderKP = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const senderPub = new Uint8Array(await crypto.subtle.exportKey('raw', senderKP.publicKey)); // 65 bytes

  // ECDH shared secret
  const receiverKey = await crypto.subtle.importKey('raw', receiverPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: receiverKey }, senderKP.privateKey, 256));

  // Step 1: derive IKM — HKDF(salt=auth, ikm=sharedSecret, info="WebPush: info\0" + ua_pub + as_pub, L=32)
  const keyInfo = concat(new TextEncoder().encode('WebPush: info\x00'), receiverPub, senderPub);
  const ikm = await hkdf(authSecret, sharedSecret, keyInfo, 32);

  // Random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Step 2: CEK and NONCE — HKDF(salt=random, ikm=IKM, info=..., L)
  const cek = await hkdf(salt, ikm, new TextEncoder().encode('Content-Encoding: aes128gcm\x00'), 16);
  const nonce = await hkdf(salt, ikm, new TextEncoder().encode('Content-Encoding: nonce\x00'), 12);

  // AES-128-GCM encrypt: plaintext || 0x02 (delimiter, no padding)
  const cekKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cekKey, concat(plaintext, new Uint8Array([0x02])))
  );

  // Body: salt[16] || rs[4 big-endian] || keylen[1] || senderPub[65] || ciphertext
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  return concat(salt, rs, new Uint8Array([senderPub.length]), senderPub, ciphertext);
}

// ─── Send a single push ───────────────────────────────────────────────────────

async function sendWebPush(
  endpoint: string, p256dh: string, auth: string, payload: string,
  vapidPub: string, vapidPriv: string
): Promise<void> {
  const { protocol, host } = new URL(endpoint);
  const audience = `${protocol}//${host}`;
  const [jwt, body] = await Promise.all([
    makeVapidToken(audience, vapidPub, vapidPriv),
    encryptPayload(new TextEncoder().encode(payload), p256dh, auth),
  ]);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt},k=${vapidPub}`,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
    },
    body,
  });

  if (!res.ok && res.status !== 201) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
}

// ─── Edge Function handler ────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return new Response(
        JSON.stringify({ error: 'VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY são obrigatórios' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { user_id, title, body: msgBody, icon, data, send_to_all } = await req.json();
    if (!title || !msgBody) {
      return new Response(
        JSON.stringify({ error: 'title e body são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let query = supabase.from('push_subscriptions').select('*');
    if (user_id && !send_to_all) query = query.eq('user_id', user_id);

    const { data: subs, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;
    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhuma subscription encontrada', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notificationJson = JSON.stringify({
      title,
      body: msgBody,
      icon: icon || '/icon-192.png',
      badge: '/icon-64.png',
      data: data || {},
    });

    const results = await Promise.allSettled(
      subs.map(async (sub: any) => {
        try {
          await sendWebPush(sub.endpoint, sub.p256dh, sub.auth, notificationJson, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
          return { user_id: sub.user_id, success: true };
        } catch (e: any) {
          console.error(`Push falhou para ${sub.user_id}:`, e.message);
          // Subscription expirada → remover
          if (e.message?.includes('410') || e.message?.includes('404')) {
            await supabase.from('push_subscriptions').delete().eq('user_id', sub.user_id);
          }
          return { user_id: sub.user_id, success: false, error: e.message };
        }
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.length - sent;

    await supabase.from('notification_queue').insert({
      user_id: user_id || 'broadcast',
      title, body: msgBody,
      type: data?.type || 'general',
      status: 'sent', sent_count: sent, failed_count: failed,
      created_at: new Date().toISOString(),
    }).catch(() => {}); // log failure is non-critical

    return new Response(
      JSON.stringify({ message: 'Notificações enviadas', sent, failed, total: subs.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});