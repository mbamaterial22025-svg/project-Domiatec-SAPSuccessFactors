import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

let db = null;
let isInitialized = false;

function getDbInstance() {
  if (!db) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  }
  return db;
}

const DOC_REF_PATH = ['kanban_v1', 'domiatec_project'];

export const cloudStore = {
  // Check if Firestore is reachable and sync data
  async syncFromCloud() {
    try {
      const firestore = getDbInstance();
      const docRef = doc(firestore, DOC_REF_PATH[0], DOC_REF_PATH[1]);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        if (cloudData.tasks) localStorage.setItem('wk_store_tasks', JSON.stringify(cloudData.tasks));
        if (cloudData.categories) localStorage.setItem('wk_store_categories', JSON.stringify(cloudData.categories));
        if (cloudData.users) localStorage.setItem('wk_store_users', JSON.stringify(cloudData.users));
        if (cloudData.project) localStorage.setItem('wk_store_project', JSON.stringify(cloudData.project));
        isInitialized = true;
        return { success: true, source: 'cloud', data: cloudData };
      } else {
        // Document does not exist yet: Seed initial data to cloud!
        await this.syncToCloud();
        isInitialized = true;
        return { success: true, source: 'initialized_to_cloud' };
      }
    } catch (err) {
      console.warn('Cloud Firestore sync notice:', err.message);
      return { success: false, error: err.message };
    }
  },

  // Save full state or partial update to Cloud Firestore
  async syncToCloud() {
    try {
      const firestore = getDbInstance();
      const docRef = doc(firestore, DOC_REF_PATH[0], DOC_REF_PATH[1]);

      const tasks = JSON.parse(localStorage.getItem('wk_store_tasks') || '[]');
      const categories = JSON.parse(localStorage.getItem('wk_store_categories') || '[]');
      const users = JSON.parse(localStorage.getItem('wk_store_users') || '[]');
      const project = JSON.parse(localStorage.getItem('wk_store_project') || '{}');

      const payload = {
        updatedAt: new Date().toISOString(),
        tasks,
        categories,
        users,
        project
      };

      await setDoc(docRef, payload, { merge: true });
      return { success: true };
    } catch (err) {
      console.warn('Failed to write to Cloud Firestore:', err.message);
      return { success: false, error: err.message };
    }
  },

  // Realtime single-field updater
  async updateField(field, data) {
    try {
      const firestore = getDbInstance();
      const docRef = doc(firestore, DOC_REF_PATH[0], DOC_REF_PATH[1]);
      await setDoc(docRef, { [field]: data, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn(`Failed to update ${field} in cloud:`, err.message);
    }
  }
};
