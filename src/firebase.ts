import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyCE4ZBcfgZO_qSfiPNztYe0d2dhVuZQtqk',
  authDomain: 'cash-merge.firebaseapp.com',
  projectId: 'cash-merge',
  storageBucket: 'cash-merge.firebasestorage.app',
  messagingSenderId: '443348246231',
  appId: '1:443348246231:web:bb7300d477eefa94de9a92',
  measurementId: 'G-Z228ERJ6E9',
};

export const app = initializeApp(firebaseConfig);

export async function initAnalytics() {
  try {
    if (await isSupported()) {
      getAnalytics(app);
    }
  } catch (_) {
    // ignore analytics init errors (unsupported env)
  }
}
