import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocFromServer, doc, setDoc, getDocs } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Import the Firebase configuration from the JSON file
import firebaseConfig from '../firebase-applet-config.json';

console.log("🛠️ Firebase Config loaded:", {
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,
  authDomain: firebaseConfig.authDomain
});

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Use the specific firestoreDatabaseId from the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
console.log("🔥 Firestore instance created with DB ID:", firebaseConfig.firestoreDatabaseId || "(default)");
export const storage = getStorage(app);
export const auth = getAuth(app);
export const resourcesCollection = collection(db, "resources");

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
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
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('🔥 Firestore Error Details: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// Test de connexion à Firestore pour éviter les blocages infinis
export async function testFirestoreConnection() {
  try {
    console.log("📡 Firestore : Tentative de connexion à la base", firebaseConfig.firestoreDatabaseId || "(default)");
    // On tente de lire un document inexistant juste pour tester la route
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("🔥 Firestore : Connexion établie avec succès.");
    await bootstrapForumCategories();
    return true;
  } catch (error: any) {
    console.error("❌ Firestore : Erreur de connexion :", error.message);
    if (error.message?.includes('permission')) {
      console.error("❌ Firestore : Problème de permissions. Vérifiez les règles Firestore.");
      handleFirestoreError(error, OperationType.GET, '_connection_test_/ping');
    }
    if (error.message?.includes('offline')) {
      console.error("❌ Firestore : Le client est hors ligne ou la base de données est inaccessible.");
    }
    return false;
  }
}

async function bootstrapForumCategories() {
  const categoriesRef = collection(db, 'forum_categories');
  const snapshot = await getDocs(categoriesRef);
  
  if (snapshot.empty) {
    console.log("🚀 Initialisation des catégories du forum...");
    const initialCategories = [
      { name: "L'IA au quotidien" },
      { name: "Compétences et Avenir" },
      { name: "Entraide et Mentorat" }
    ];
    
    for (const cat of initialCategories) {
      await setDoc(doc(categoriesRef), cat);
    }
    console.log("✅ Catégories initialisées.");
  }
}
testFirestoreConnection();
