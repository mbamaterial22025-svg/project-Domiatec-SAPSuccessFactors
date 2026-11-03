import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

let db = null;
let isInitialized = false;
let unsubscribeRealtime = null;

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
        if (cloudData.tasks && Array.isArray(cloudData.tasks) && cloudData.tasks.length > 0) {
          localStorage.setItem('wk_store_tasks', JSON.stringify(cloudData.tasks));
        }
        if (cloudData.categories && Array.isArray(cloudData.categories) && cloudData.categories.length > 0) {
          localStorage.setItem('wk_store_categories', JSON.stringify(cloudData.categories));
        }
        if (cloudData.users && Array.isArray(cloudData.users) && cloudData.users.length > 0) {
          localStorage.setItem('wk_store_users', JSON.stringify(cloudData.users));
        }
        if (cloudData.project && cloudData.project.titleAr) {
          localStorage.setItem('wk_store_project', JSON.stringify(cloudData.project));
        }
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

  // Realtime subscription: updates localStorage and notifies listener on any external change
  subscribeToCloud(onChangeCallback) {
    try {
      const firestore = getDbInstance();
      const docRef = doc(firestore, DOC_REF_PATH[0], DOC_REF_PATH[1]);

      if (unsubscribeRealtime) {
        unsubscribeRealtime();
      }

      unsubscribeRealtime = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data();
          let changed = false;
          if (cloudData.tasks && Array.isArray(cloudData.tasks) && cloudData.tasks.length > 0) {
            localStorage.setItem('wk_store_tasks', JSON.stringify(cloudData.tasks));
            changed = true;
          }
          if (cloudData.categories && Array.isArray(cloudData.categories)) {
            localStorage.setItem('wk_store_categories', JSON.stringify(cloudData.categories));
            changed = true;
          }
          if (cloudData.users && Array.isArray(cloudData.users)) {
            localStorage.setItem('wk_store_users', JSON.stringify(cloudData.users));
            changed = true;
          }
          if (cloudData.project) {
            localStorage.setItem('wk_store_project', JSON.stringify(cloudData.project));
            changed = true;
          }
          if (changed && typeof onChangeCallback === 'function') {
            onChangeCallback(cloudData);
          }
        }
      }, (err) => {
        console.warn('Realtime cloud listener error:', err.message);
      });

      return unsubscribeRealtime;
    } catch (err) {
      console.warn('Failed to attach realtime cloud listener:', err.message);
      return null;
    }
  },

  // Save full state or partial update to Cloud Firestore
  async syncToCloud() {
    try {
      const firestore = getDbInstance();
      const docRef = doc(firestore, DOC_REF_PATH[0], DOC_REF_PATH[1]);

      const tasksRaw = localStorage.getItem('wk_store_tasks');
      const catsRaw = localStorage.getItem('wk_store_categories');
      const usersRaw = localStorage.getItem('wk_store_users');
      const projRaw = localStorage.getItem('wk_store_project');

      // Do not overwrite with empty values if storage was wiped
      if (!tasksRaw && !catsRaw && !usersRaw) {
        console.warn('Skipping syncToCloud because local storage is empty');
        return { success: false, reason: 'empty_local' };
      }

      const tasks = tasksRaw ? JSON.parse(tasksRaw) : [];
      const categories = catsRaw ? JSON.parse(catsRaw) : [];
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const project = projRaw ? JSON.parse(projRaw) : {};

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
