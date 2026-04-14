const CACHE_NAME = 'cvetoshek-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/about.html',
  '/bouquets.html',
  '/additional.html',
  '/Styles/styles.css',
  '/Styles/FA_Style/css/all.css',
  '/Styles/Images/Logo.png',
  '/Styles/Images/Background.jpg'
];

// Установка Service Worker и кэширование ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэш открыт');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Ошибка кэширования:', error);
      })
  );
});

// Активация Service Worker и очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Обработка запросов - стратегия "Cache First, Network Fallback"
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если ресурс найден в кэше, возвращаем его
        if (response) {
          return response;
        }
        // Иначе делаем запрос к сети
        return fetch(event.request)
          .then(response => {
            // Проверяем, что ответ валиден
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Клонируем ответ для кэширования
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
      .catch(error => {
        console.error('Ошибка получения ресурса:', error);
        // Можно вернуть страницу офлайн, если нужно
      })
  );
});
