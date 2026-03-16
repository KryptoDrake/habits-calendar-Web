import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'
import type { Recipe, ShoppingItem, MealPlan } from './types'

const firebaseConfig = {
  apiKey: "AIzaSyCtbBhrOEKKL-yurRdhYQuHdS-7qPqvF8I",
  authDomain: "what-to-eat-ba15a.firebaseapp.com",
  projectId: "what-to-eat-ba15a",
  storageBucket: "what-to-eat-ba15a.firebasestorage.app",
  messagingSenderId: "795159856986",
  appId: "1:795159856986:web:c2fc4034f4c073b13d5563"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const HOUSEHOLD_CODE = 'M&M-Haushalt'

// ============ Essen-Daten ============

export async function fetchRecipes(): Promise<Recipe[]> {
  const snap = await getDocs(collection(db, 'households', HOUSEHOLD_CODE, 'recipes'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Recipe))
}

export async function fetchShoppingList(): Promise<ShoppingItem[]> {
  const docRef = doc(db, 'households', HOUSEHOLD_CODE, 'shoppingList', 'current')
  const snap = await getDoc(docRef)
  if (!snap.exists()) return []
  const data = snap.data()
  return (data.items || []) as ShoppingItem[]
}

export async function fetchMealPlans(): Promise<MealPlan[]> {
  const snap = await getDocs(collection(db, 'households', HOUSEHOLD_CODE, 'mealplans'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MealPlan))
}

// ============ Verschlüsselter Token-Speicher ============

const TOKEN_DOC_PATH = doc(db, 'households', HOUSEHOLD_CODE, 'meta', 'webauth')

export async function fetchEncryptedToken(userId: string): Promise<string | null> {
  const snap = await getDoc(TOKEN_DOC_PATH)
  if (!snap.exists()) return null
  const data = snap.data()
  return data?.[userId] ?? null
}

export async function storeEncryptedToken(userId: string, encryptedToken: string): Promise<void> {
  await setDoc(TOKEN_DOC_PATH, { [userId]: encryptedToken }, { merge: true })
}
