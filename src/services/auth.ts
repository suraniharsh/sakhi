import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously as signInAnonymouslyFirebase,
  linkWithCredential,
  EmailAuthProvider,
  AuthCredential,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signInAnonymously = async () => {
  return signInAnonymouslyFirebase(auth);
};

export const linkAnonymousWithEmail = async (
  user: User,
  email: string,
  password: string
) => {
  const credential = EmailAuthProvider.credential(email, password);
  return linkWithCredential(user, credential);
};

export const linkAnonymousWithGoogle = async (user: User) => {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return linkWithCredential(user, GoogleAuthProvider.credentialFromResult(credential)!);
};

export const handleAuthError = (error: any): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'This authentication method is not enabled.';
    case 'auth/weak-password':
      return 'Please choose a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled.';
    default:
      return 'An error occurred during authentication.';
  }
}; 