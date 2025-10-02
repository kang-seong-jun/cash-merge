/* Firebase init for HTML5 mode */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCE4ZBcfgZO_qSfiPNztYe0d2dhVuZQtqk",
  authDomain: "cash-merge.firebaseapp.com",
  projectId: "cash-merge",
  storageBucket: "cash-merge.firebasestorage.app",
  messagingSenderId: "443348246231",
  appId: "1:443348246231:web:bb7300d477eefa94de9a92",
  measurementId: "G-Z228ERJ6E9"
};

const app = initializeApp(firebaseConfig);
try {
  if (await isSupported()) {
    getAnalytics(app);
  }
} catch (_) {}
