// Custom service worker for NextShift PWA
// This extends the auto-generated Workbox service worker with version communication

import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

// Precache all files from the build with error handling
try {
  precacheAndRoute(self.__WB_MANIFEST || []);
} catch (error) {
  console.warn('Service Worker: Precache failed:', error);
}

// Clean up old caches
cleanupOutdatedCaches();

// Take control of all clients immediately
self.skipWaiting();
clientsClaim();

// Version information
const SW_VERSION = __APP_VERSION__;

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  try {
    if (event.data?.type === 'GET_VERSION') {
      // Respond with version information
      const port = event.ports[0];
      if (port) {
        port.postMessage({
          type: 'VERSION_RESPONSE',
          version: SW_VERSION,
          timestamp: Date.now(),
        });
      }
    }

    // Handle skip waiting requests
    if (event.data?.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  } catch (error) {
    console.warn('Service Worker: Message handling failed:', error);
  }
});

// Add error event listener
self.addEventListener('error', (error) => {
  console.warn('Service Worker: Unhandled error:', error);
});
