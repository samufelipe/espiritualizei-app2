/**
 * ESPIRITUALIZEI - SERVICE WORKER
 * Sistema completo de notificações push e cache otimizado para PWA
 * Versão 2.2.0 — HTML nunca é cacheado (sempre fresco da rede)
 */

const CACHE_NAME = 'espiritualizei-v2.2.0';
const APP_ICON = '/icon-192.png';
const BADGE_ICON = '/icon-64.png';

// Recursos para pré-cache (somente assets críticos, NUNCA HTML)
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalação do Service Worker com pré-cache
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker v2.2.0 instalado');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Pré-cacheando assets críticos');
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('⚠️ Alguns recursos não puderam ser cacheados:', err);
      });
    })
  );
  // Assume controle imediatamente sem esperar abas fecharem
  self.skipWaiting();
});

// Ativação: deleta caches antigos
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker v2.2.0 ativado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Cache antigo removido:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') return;

  // Supabase → sempre rede direta (dados em tempo real)
  if (url.hostname.includes('supabase')) return;

  // Outros domínios externos (exceto Google Fonts) → rede direta
  if (url.origin !== self.location.origin &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // ── REGRA CRÍTICA: HTML NUNCA É CACHEADO ─────────────────────────────────
  // Páginas HTML (index, quiz, resultado) devem sempre vir da rede para
  // garantir que deploys cheguem imediatamente ao usuário.
  if (request.destination === 'document' ||
      url.pathname.endsWith('.html') ||
      url.pathname === '/' ||
      url.pathname.startsWith('/quiz') ||
      url.pathname.startsWith('/diagnostico') ||
      url.pathname === '/resultado') {
    return; // Deixa o browser buscar normalmente — sem interceptar
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Assets estáticos (JS, CSS, imagens, fontes) → cache-first com update em background
  const isStaticAsset =
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Retorna cache e atualiza em background (stale-while-revalidate)
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }

        // Sem cache: busca da rede e armazena
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // Tudo mais → rede direta, sem cache
});

/**
 * RECEBIMENTO DE NOTIFICAÇÕES PUSH
 */
self.addEventListener('push', (event) => {
  console.log('🔔 Push recebido:', event);

  let notificationData = {
    title: 'Espiritualizei',
    body: 'Você tem uma nova mensagem!',
    icon: APP_ICON,
    badge: BADGE_ICON,
    tag: 'default',
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || APP_ICON,
        badge: BADGE_ICON,
        tag: payload.tag || 'default',
        data: payload.data || {},
        requireInteraction: payload.requireInteraction || false,
        actions: payload.actions || []
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions
    })
  );
});

/**
 * CLIQUE NA NOTIFICAÇÃO
 */
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificação clicada:', event.notification.tag);

  event.notification.close();

  const urlToOpen = new URL('/', self.location.origin);
  const notificationData = event.notification.data || {};

  if (notificationData.type === 'routine') {
    urlToOpen.searchParams.set('tab', 'routine');
  } else if (notificationData.type === 'challenge') {
    urlToOpen.searchParams.set('tab', 'community');
  } else if (notificationData.type === 'intercession') {
    urlToOpen.searchParams.set('tab', 'community');
  } else if (notificationData.type === 'library') {
    urlToOpen.searchParams.set('tab', 'library');
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client) {
          return client.focus().then(() => {
            if ('navigate' in client) return client.navigate(urlToOpen.href);
          });
        }
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen.href);
    })
  );
});

/**
 * SINCRONIZAÇÃO EM BACKGROUND
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync:', event.tag);
  if (event.tag === 'daily-inspiration') {
    event.waitUntil(showDailyInspiration());
  } else if (event.tag === 'routine-reminder') {
    event.waitUntil(showRoutineReminder());
  } else if (event.tag === 'challenge-update') {
    event.waitUntil(showChallengeUpdate());
  }
});

async function syncNotifications() {
  console.log('📡 Sincronizando notificações...');
}

async function showDailyInspiration() {
  const inspirations = [
    { title: "Inspiração do Dia", body: "Confiai no Senhor de todo o coração e não vos apoieis na vossa própria inteligência. (Pr 3,5)" },
    { title: "Palavra para Hoje", body: "O Senhor é meu pastor, nada me faltará. (Sl 23,1)" },
    { title: "Reflexão Matinal", body: "Buscai primeiro o Reino de Deus e a sua justiça, e todas as coisas vos serão dadas por acréscimo. (Mt 6,33)" },
    { title: "Luz para o Dia", body: "Eu sou a luz do mundo. Quem me segue não andará nas trevas, mas terá a luz da vida. (Jo 8,12)" },
    { title: "Força para Hoje", body: "Tudo posso naquele que me fortalece. (Fl 4,13)" }
  ];
  const today = new Date().getDate();
  const inspiration = inspirations[today % inspirations.length];
  return self.registration.showNotification(inspiration.title, {
    body: inspiration.body, icon: APP_ICON, badge: BADGE_ICON,
    tag: 'daily-inspiration', data: { type: 'inspiration' }
  });
}

async function showRoutineReminder() {
  const hour = new Date().getHours();
  let message = hour >= 5 && hour < 12
    ? 'Bom dia! Que tal começar o dia com sua rotina espiritual? 🌅'
    : hour >= 12 && hour < 18
    ? 'Boa tarde! Um momento de oração no meio do dia renova suas forças. 🙏'
    : 'Boa noite! Encerre o dia em paz com sua rotina espiritual. 🌙';
  return self.registration.showNotification('Hora da Rotina', {
    body: message, icon: APP_ICON, badge: BADGE_ICON,
    tag: 'routine-reminder', data: { type: 'routine' }
  });
}

async function showChallengeUpdate() {
  return self.registration.showNotification('Novo Desafio Comunitário!', {
    body: 'Um novo desafio de 3 dias está disponível. Participe e fortaleça sua fé junto com a comunidade! 🔥',
    icon: APP_ICON, badge: BADGE_ICON, tag: 'challenge-update',
    data: { type: 'challenge' }, requireInteraction: true
  });
}

console.log('🚀 Espiritualizei Service Worker v2.2.0 carregado com sucesso!');