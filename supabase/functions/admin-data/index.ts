import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ADMIN_SECRET = Deno.env.get('ADMIN_SECRET');
    if (!ADMIN_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Servidor não configurado: ADMIN_SECRET ausente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar autenticação do admin
    const adminSecret = req.headers.get('x-admin-secret')
    if (adminSecret !== ADMIN_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Acesso não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar cliente Supabase com service_role key (acesso total)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    const { action, data } = await req.json()

    const logAdminAction = async (actionName: string, targetId?: string, details?: object) => {
      try {
        await supabase.from('admin_audit_log').insert({
          action: actionName,
          target_id: targetId || null,
          details: details || null,
          created_at: new Date().toISOString(),
        });
      } catch (_) { /* silently skip if table not yet created */ }
    };

    switch (action) {
      case 'get_all_users': {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: profiles }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_stats': {
        // Buscar contagens
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        const { count: premiumUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_type', 'premium')

        const { count: suspendedUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_suspended', true)

        // Usuários novos esta semana
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const { count: newThisWeek } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo.toISOString())

        // Usuários novos este mês
        const monthAgo = new Date()
        monthAgo.setDate(monthAgo.getDate() - 30)
        const { count: newThisMonth } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthAgo.toISOString())

        // Contagem de intenções
        let totalIntentions = 0
        try {
          const { count } = await supabase
            .from('intentions')
            .select('*', { count: 'exact', head: true })
          totalIntentions = count || 0
        } catch (e) {}

        // Contagem de rotinas
        let totalRoutines = 0
        try {
          const { count } = await supabase
            .from('routines')
            .select('*', { count: 'exact', head: true })
          totalRoutines = count || 0
        } catch (e) {}

        // Contagem de posts
        let totalPosts = 0
        try {
          const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
          totalPosts = count || 0
        } catch (e) {}

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              totalUsers: totalUsers || 0,
              premiumUsers: premiumUsers || 0,
              freeUsers: (totalUsers || 0) - (premiumUsers || 0),
              suspendedUsers: suspendedUsers || 0,
              newThisWeek: newThisWeek || 0,
              newThisMonth: newThisMonth || 0,
              totalIntentions,
              totalRoutines,
              totalPosts
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_posts': {
        const { data: posts, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: posts || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_support_messages': {
        const { data: messages, error } = await supabase
          .from('support_messages')
          .select('*')
          .order('created_at', { ascending: false })

        // Se a tabela não existir, retornar array vazio
        if (error && error.code === '42P01') {
          return new Response(
            JSON.stringify({ success: true, data: [] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: messages || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_user': {
        const { userId, updates } = data
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)

        if (error) throw error

        await logAdminAction('update_user', userId, { fields: Object.keys(updates) });

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete_user': {
        const { userId } = data

        // Deletar do auth
        const { error: authError } = await supabase.auth.admin.deleteUser(userId)
        if (authError) console.error('Erro ao deletar do auth:', authError)

        // Deletar do profiles
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId)

        if (error) throw error

        await logAdminAction('delete_user', userId);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete_post': {
        const { postId } = data
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId)

        if (error) throw error

        await logAdminAction('delete_post', postId);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'respond_support': {
        const { messageId, response, adminEmail } = data
        const { error } = await supabase
          .from('support_messages')
          .update({
            status: 'resolved',
            admin_response: response,
            responded_by: adminEmail,
            responded_at: new Date().toISOString()
          })
          .eq('id', messageId)

        if (error) throw error

        await logAdminAction('respond_support', messageId, { adminEmail });

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'send_broadcast': {
        const { title, message, target } = data

        // Buscar usuários alvo
        let query = supabase.from('profiles').select('id, email, name')
        if (target === 'premium') {
          query = query.eq('subscription_type', 'premium')
        } else if (target === 'free') {
          query = query.eq('subscription_type', 'free')
        }

        const { data: users, error } = await query
        if (error) throw error

        // Disparar push notification via send-push-notification Edge Function
        try {
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!
          const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
          await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({ title, body: message, send_to_all: target === 'all', data: { type: 'broadcast' } }),
          })
        } catch (pushErr) {
          console.warn('Push broadcast falhou (não bloqueia):', pushErr)
        }

        await logAdminAction('send_broadcast', undefined, { title, target, recipients: users?.length || 0 });

        return new Response(
          JSON.stringify({
            success: true,
            message: `Broadcast enviado para ${users?.length || 0} usuários`,
            recipients: users?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'publish_content': {
        const { contentType, content } = data
        const now = new Date().toISOString()

        if (contentType === 'post') {
          const { error } = await supabase.from('posts').insert({
            user_id: 'espiritualizei-official',
            user_name: 'Espiritualizei',
            user_avatar: 'https://www.espiritualizei.com/icon-512.png',
            content,
            type: 'testimony',
            timestamp: now,
            likes: 0,
            comments_count: 0,
            is_official: true,
          })
          if (error) throw error
        } else {
          const { error } = await supabase.from('prayer_intentions').insert({
            user_id: 'espiritualizei-official',
            user_name: 'Espiritualizei',
            content,
            created_at: now,
            is_anonymous: false,
            prayer_count: 0,
            is_official: true,
          })
          if (error) throw error
        }

        await logAdminAction('publish_content', undefined, { contentType, preview: content.substring(0, 100) })

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação não reconhecida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Erro na Edge Function admin-data:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
