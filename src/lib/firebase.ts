import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, onSnapshot, getDocFromServer, updateDoc, collection, query, where, deleteDoc, addDoc, serverTimestamp, getDocs, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
} as any, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth();
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('[FIRESTORE SECURITY AUDIT] Violation Detected: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL: Connection test for sandboxed environments
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log('[FIREBASE] Connection established successfully.');
  } catch (error: any) {
    if (error?.message?.includes('the client is offline') || error?.message?.includes('Missing or insufficient permissions')) {
      console.warn('[FIREBASE] Connection warning (expected if unauthenticated or offline):', error.message);
    } else {
      console.error('[FIREBASE] Connection error:', error);
    }
  }
}

testConnection();

export { signInWithPopup, doc, getDoc, setDoc, onSnapshot, getDocFromServer, updateDoc, collection, query, where, deleteDoc, addDoc, serverTimestamp, getDocs, orderBy, limit };
