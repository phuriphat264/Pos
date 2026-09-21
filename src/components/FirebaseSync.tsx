'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { db, doc, setDoc, onSnapshot } from '@/lib/firebase';

const STORE_DOC_ID = 'main_store';

export default function FirebaseSync() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    console.log('Firebase Sync Initialized');
    const storeRef = doc(db, 'pos_data', STORE_DOC_ID);

    // 1. Listen for changes from Firebase
    const unsubscribe = onSnapshot(storeRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        const currentLocal = useStore.getState();

        // If remote data is newer, overwrite local state
        const remoteTime = remoteData.lastUpdatedLocal || 0;
        const localTime = currentLocal.lastUpdatedLocal || 0;

        if (remoteTime > localTime) {
          console.log('Syncing from Cloud...', { remoteTime, localTime });
          useStore.getState().setStoreFromFirebase(remoteData as any);
        } else if (localTime > remoteTime) {
          console.log('Local is newer! Pushing to Cloud...', { remoteTime, localTime });
          const { isRemoteUpdate, setStoreFromFirebase, ...dataToSave } = useStore.getState();
          setDoc(storeRef, dataToSave, { merge: true }).catch(err => console.error(err));
        }
      }
    });

    // 2. Listen for local changes in Zustand and push to Firebase
    let timeoutId: NodeJS.Timeout;
    const unsubStore = useStore.subscribe((state, prevState) => {
      // Ignore if this update came from Firebase itself
      if (state.isRemoteUpdate) {
        useStore.setState({ isRemoteUpdate: false });
        return;
      }

      // Update local timestamp to indicate this is a fresh local change
      // Only do this if it's not already updated in this cycle to avoid infinite loop
      if (state.lastUpdatedLocal === prevState.lastUpdatedLocal) {
         useStore.setState({ lastUpdatedLocal: Date.now() });
         return; // The next subscribe trigger will handle the upload
      }

      // It's a local update with a fresh timestamp! 
      // Let's debounce the upload by 2 seconds to avoid spamming Firestore
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Pushing to Cloud...');
        
        // Strip out the isRemoteUpdate flag and functions before saving
        const { isRemoteUpdate, setStoreFromFirebase, ...dataToSave } = useStore.getState();
        
        // Convert any non-serializable data if necessary, though Zustand state here should be serializable
        // We use setDoc to overwrite the document
        setDoc(storeRef, dataToSave, { merge: true }).catch(err => {
          console.error("Error pushing to Firebase:", err);
        });
      }, 2000);
    });

    return () => {
      unsubscribe();
      unsubStore();
      clearTimeout(timeoutId);
    };
  }, []);

  return null; // This component doesn't render anything
}
