'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { db, auth, doc, setDoc, onSnapshot } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// This flag lives OUTSIDE React to survive re-renders.
// It prevents the sync from pushing resetStore/mock data to Firebase.
let isSyncing = false;
let isInitialLoad = true;

export default function FirebaseSync() {
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;
    let unsubStore: (() => void) | undefined;
    let timeoutId: NodeJS.Timeout | undefined;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous listeners
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (unsubStore) unsubStore();
      if (timeoutId) clearTimeout(timeoutId);

      if (!user) {
        isSyncing = false;
        isInitialLoad = true;
        return;
      }

      console.log('Firebase Sync: Connected as', user.email);
      const storeRef = doc(db, 'pos_data', 'main_store');
      isInitialLoad = true;

      // 1. Listen for changes FROM Firebase → update local state
      unsubscribeSnapshot = onSnapshot(storeRef, (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();

          if (isInitialLoad) {
            // On first load, ALWAYS trust Firebase (the source of truth)
            console.log('Firebase Sync: Initial load from cloud');
            isSyncing = true;
            useStore.getState().setStoreFromFirebase(remoteData as any);
            isInitialLoad = false;
            // Give time for the state to settle before allowing pushes
            setTimeout(() => { isSyncing = false; }, 500);
            return;
          }

          // For subsequent updates (from another device), check timestamps
          const remoteTime = remoteData.lastUpdatedLocal || 0;
          const localTime = useStore.getState().lastUpdatedLocal || 0;

          if (remoteTime > localTime) {
            console.log('Firebase Sync: Remote is newer, pulling...', { remoteTime, localTime });
            isSyncing = true;
            useStore.getState().setStoreFromFirebase(remoteData as any);
            setTimeout(() => { isSyncing = false; }, 500);
          }
        } else {
          // No data on Firebase yet: push local data as initial seed
          console.log('Firebase Sync: No cloud data, pushing initial data');
          isInitialLoad = false;
          const { isRemoteUpdate, setStoreFromFirebase, resetStore, ...dataToSave } = useStore.getState();
          setDoc(storeRef, { ...dataToSave, lastUpdatedLocal: Date.now() }).catch(console.error);
        }
      });

      // 2. Listen for local changes → push TO Firebase
      unsubStore = useStore.subscribe((state, prevState) => {
        // Don't push if we're syncing from Firebase
        if (isSyncing || state.isRemoteUpdate) {
          return;
        }

        // Don't push if lastUpdatedLocal is 0 (resetStore was just called)
        if ((state.lastUpdatedLocal || 0) === 0) {
          return;
        }

        // Stamp the change with current time if not already stamped
        if (state.lastUpdatedLocal === prevState.lastUpdatedLocal) {
          useStore.setState({ lastUpdatedLocal: Date.now() });
          return;
        }

        // Debounce: wait 500ms for rapid changes to settle
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (isSyncing) return;
          console.log('Firebase Sync: Pushing to cloud...');
          const { isRemoteUpdate, setStoreFromFirebase, resetStore, ...dataToSave } = useStore.getState();
          // Use setDoc WITHOUT merge so that deleted items are actually removed from Firebase
          setDoc(storeRef, dataToSave).catch(err => {
            console.error('Firebase Sync: Push failed', err);
          });
        }, 500);
      });
    });

    return () => {
      unsubAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (unsubStore) unsubStore();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
