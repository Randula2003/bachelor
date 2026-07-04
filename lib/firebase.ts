import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

export function getFirebaseAuth() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* variables to .env.local."
    )
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return getAuth(app)
}

export function getFirebaseStorage() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* variables to .env.local."
    )
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return getStorage(app)
}

export function getFirebaseFirestore() {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase not configured.")
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return getFirestore(app)
}
