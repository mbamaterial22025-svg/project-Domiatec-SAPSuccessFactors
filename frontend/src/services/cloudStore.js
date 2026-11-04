import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocFromServer, setDoc, onSnapshot } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';
import { normalizeTask, DEFAULT_PROJECT, DEFAULT_CATEGORIES, DEFAULT_USERS, DEFAULT_TASKS } from './localStore';

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

function cleanForFirestore(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    return value === undefined ? null : value;
  }));
}

export const cloudStore = {
  // Check if Firestore is reachable and sync fresh data directly from server
  async syncFromCloud(forceServer = true) {
    try {
      const firestore = getDbInstance();
      const docRef = doc(firestore, DOC_REF_PATH[0], DOC_REF_PATH[1]);
      
      let snapshot;
      try {
        if (forceServer) {
          snapshot = await getDocFromServer(docRef);
        } else {
          snapshot = await getDoc(docRef);
        }
      } catch (netErr) {
        // Fallback to cache if offline
        snapshot = await getDoc(docRef);
      }

      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        if (cloudData.tasks && Array.isArray(cloudData.tasks)) {
          const normalized = cloudData.tasks.map(normalizeTask);
          localStorage.setItem('wk_store_tasks', JSON.stringify(normalized));
        }
        if (cloudData.categories && Array.isArray(cloudData.categories)) {
          localStorage.setItem('wk_store_categories', JSON.stringify(cloudData.categories));
        }
        if (cloudData.users && Array.isArray(cloudData.users)) {
          localStorage.setItem('wk_store_users', JSON.stringify(cloudData.users));
        }
        if (cloudData.project && (cloudData.project.titleAr || cloudData.project.title_ar)) {
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
          if (cloudData.tasks && Array.isArray(cloudData.tasks)) {
            const normalized = cloudData.tasks.map(normalizeTask);
            localStorage.setItem('wk_store_tasks', JSON.stringify(normalized));
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

      // Safety check: Never overwrite existing cloud data if local storage is blank!
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().tasks && snap.data().tasks.length > 0) {
        const localTasksRaw = localStorage.getItem('wk_store_tasks');
        if (!localTasksRaw) {
          console.log('Protecting existing cloud data from empty local storage. Pulling from cloud instead.');
          return this.syncFromCloud();
        }
      }

      const tasksRaw = localStorage.getItem('wk_store_tasks');
      const catsRaw = localStorage.getItem('wk_store_categories');
      const usersRaw = localStorage.getItem('wk_store_users');
      const projRaw = localStorage.getItem('wk_store_project');

      const tasks = tasksRaw ? JSON.parse(tasksRaw).map(normalizeTask) : DEFAULT_TASKS.map(normalizeTask);
      const categories = catsRaw ? JSON.parse(catsRaw) : DEFAULT_CATEGORIES;
      const users = usersRaw ? JSON.parse(usersRaw) : DEFAULT_USERS;
      const project = projRaw ? JSON.parse(projRaw) : DEFAULT_PROJECT;

      const payload = cleanForFirestore({
        updatedAt: new Date().toISOString(),
        tasks,
        categories,
        users,
        project
      });

      await setDoc(docRef, payload, { merge: true });
      return { success: true };
    } catch (err) {
      console.error('Failed to write to Cloud Firestore:', err);
      return { success: false, error: err.message };
    }
  },

  // Realtime single-field updater
  async updateField(field, data) {
    try {
      const firestore = getDbInstance();
      const docRef = doc(firestore, DOC_REF_PATH[0], DOC_REF_PATH[1]);
      const cleanData = cleanForFirestore(data);
      await setDoc(docRef, { [field]: cleanData, updatedAt: new Date().toISOString() }, { merge: true });
      return { success: true };
    } catch (err) {
      console.error(`Failed to update ${field} in cloud:`, err);
      return { success: false, error: err.message };
    }
  }
};
