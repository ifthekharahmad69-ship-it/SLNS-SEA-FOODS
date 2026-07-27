// OneSignalSDKWorker.js — alias to unified service worker
// OneSignal looks for this file by default. We redirect to our combined sw.js
// which already imports OneSignalSDK.sw.js at the top.
importScripts('/sw.js');
