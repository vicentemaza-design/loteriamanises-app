import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getRedirectResult,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { auth } from '@/shared/config/firebase';

export function enableAuthPersistence() {
  return setPersistence(auth, browserLocalPersistence);
}

export function resolveRedirectSignIn() {
  return getRedirectResult(auth);
}

export async function signInWithGoogleProvider() {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    const errorCode = getFirebaseAuthCode(error);

    if (
      errorCode === 'auth/popup-blocked' ||
      errorCode === 'auth/popup-closed-by-user' ||
      errorCode === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, provider);
      return;
    }

    throw error;
  }
}

export function logoutUser() {
  return signOut(auth);
}

export function getFirebaseAuthCode(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String(error.code);
  }
  return '';
}

export function getFirebaseAuthMessage(error: unknown) {
  const code = getFirebaseAuthCode(error);

  switch (code) {
    case 'auth/unauthorized-domain':
      return 'Este dominio no está autorizado en Firebase Auth. Añade localhost a los dominios autorizados.';
    case 'auth/popup-blocked':
      return 'El navegador ha bloqueado la ventana de acceso. Reintento con redirección.';
    case 'auth/popup-closed-by-user':
      return 'Se cerró la ventana de acceso antes de completar el login.';
    case 'auth/cancelled-popup-request':
      return 'Se canceló el intento de acceso. Vuelve a intentarlo.';
    case 'auth/operation-not-allowed':
      return 'Google Sign-In no está habilitado en Firebase Authentication.';
    case 'auth/network-request-failed':
      return 'Falló la conexión con Firebase. Revisa red, configuración y bloqueadores del navegador.';
    default:
      return 'No se pudo iniciar sesión con Google.';
  }
}
