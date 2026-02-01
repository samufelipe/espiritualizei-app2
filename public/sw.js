/**
 * ESPIRITUALIZEI - SERVICE WORKER
 * Sistema completo de notificações push e cache otimizado para PWA
 * Versão 2.1.0
 */

const CACHE_NAME = 'espiritualizei-v2.1.0';
const APP_ICON = '/icons/icon-192x192.png';
const BADGE_ICON = '/icons/icon-72x72.png';

// Recursos para pré-cache (carregamento offline)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalação do Service Worker com pré-cache
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Pré-cacheando recursos essenciais');
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('⚠️ Alguns recursos não puderam ser cacheados:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativado');
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
  // Assume controle imediato de todas as páginas
  return self.clients.claim();
});

// Estratégia de cache: Stale-While-Revalidate para melhor performance
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requisições de outros domínios (exceto CDNs conhecidos)
  if (!url.origin.includes(self.location.origin) && 
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }
  
  // Para APIs do Supabase, sempre buscar da rede (dados em tempo real)
  if (url.hostname.includes('supabase')) {
    return;
  }
  
  // Para assets estáticos (JS, CSS, imagens, fontes), usar cache-first
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
    url.pathname.endsWith('.woff2');
    
  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // Se tem cache, retorna imediatamente e atualiza em background
        if (cachedResponse) {
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }
        
        // Se não tem cache, busca da rede e cacheia
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Fallback para assets que falharam
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }
  
  // Para HTML e outras requisições, network-first com fallback para cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          // Se tem cache, retorna
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback para a página inicial (SPA)
          return caches.match('/');
        });
      })
  );
});

/**
 * RECEBIMENTO DE NOTIFICAÇÕES PUSH
 * Processa notificações enviadas pelo servidor
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

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions
    }
  );

  event.waitUntil(promiseChain);
});

/**
 * CLIQUE NA NOTIFICAÇÃO
 * Abre o app e navega para a seção correta
 */
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificação clicada:', event.notification.tag);
  
  event.notification.close();

  const urlToOpen = new URL('/', self.location.origin);
  
  // Determina para onde navegar baseado no tipo de notificação
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

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    // Se já tem uma janela aberta, foca nela
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      if ('focus' in client) {
        return client.focus().then(() => {
          if ('navigate' in client) {
            return client.navigate(urlToOpen.href);
          }
        });
      }
    }
    // Se não tem janela aberta, abre uma nova
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen.href);
    }
  });

  event.waitUntil(promiseChain);
});

/**
 * SINCRONIZAÇÃO EM BACKGROUND
 * Permite agendar tarefas quando o app está fechado
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

/**
 * NOTIFICAÇÕES AGENDADAS (Periodic Background Sync)
 * Executa tarefas periódicas mesmo com o app fechado
 */
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

/**
 * FUNÇÕES AUXILIARES
 */

async function syncNotifications() {
  // Sincroniza preferências de notificação com o servidor
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
    body: inspiration.body,
    icon: APP_ICON,
    badge: BADGE_ICON,
    tag: 'daily-inspiration',
    data: { type: 'inspiration' }
  });
}

async function showRoutineReminder() {
  const hour = new Date().getHours();
  let message = '';
  
  if (hour >= 5 && hour < 12) {
    message = 'Bom dia! Que tal começar o dia com sua rotina espiritual? 🌅';
  } else if (hour >= 12 && hour < 18) {
    message = 'Boa tarde! Um momento de oração no meio do dia renova suas forças. 🙏';
  } else {
    message = 'Boa noite! Encerre o dia em paz com sua rotina espiritual. 🌙';
  }
  
  return self.registration.showNotification('Hora da Rotina', {
    body: message,
    icon: APP_ICON,
    badge: BADGE_ICON,
    tag: 'routine-reminder',
    data: { type: 'routine' }
  });
}

async function showChallengeUpdate() {
  return self.registration.showNotification('Novo Desafio Comunitário!', {
    body: 'Um novo desafio de 3 dias está disponível. Participe e fortaleça sua fé junto com a comunidade! 🔥',
    icon: APP_ICON,
    badge: BADGE_ICON,
    tag: 'challenge-update',
    data: { type: 'challenge' },
    requireInteraction: true
  });
}

console.log('🚀 Espiritualizei Service Worker v2.1.0 carregado com sucesso!');
