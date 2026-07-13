import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigJson from '../../../firebase-applet-config.json';

// Prefer VITE_FIREBASE_* env vars (production/CI).
// Falls back to firebase-applet-config.json for local dev convenience.
// Never commit firebase-applet-config.json to a shared repo.
const firebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY
  ? {
      apiKey:            import.meta.env.VITE_FIREBASE_API_KEY as string,
      authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
      projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
      storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
      appId:             import.meta.env.VITE_FIREBASE_APP_ID as string,
    }
  : firebaseConfigJson;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();
