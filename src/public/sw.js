{/* <script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered', reg))
      .catch(err => console.error('SW registration failed', err))
  }
</script> */}


// self.addEventListener('install', function (event) {
//   console.log('Service Worker installed');
// });
// self.addEventListener('fetch', function (event) {
//   // basic fetch handler
// });


self.addEventListener('install', event => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', event => {
  // Default fetch handler
});
