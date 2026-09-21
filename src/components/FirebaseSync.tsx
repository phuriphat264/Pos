'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { db, auth, doc, setDoc, onSnapshot } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function FirebaseSync() {
  useEffect(() => {
    let unsubscribeSnapshot: () => void;
    let unsubStore: () => void;
    let timeoutId: NodeJS.Timeout;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous listeners if user changes or logs out
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (unsubStore) unsubStore();
      clearTimeout(timeoutId);

      if (!user) return; // Stop if not logged in

      console.log('Firebase Sync Initialized for shop');
      // ใช้ ID คงที่ "main_store" เพื่อให้พนักงานทุกคนในร้านซิงค์ข้อมูลลงกล่องเดียวกัน
      const storeRef = doc(db, 'pos_data', 'main_store');

      // 1. Listen for changes from Firebase
      unsubscribeSnapshot = onSnapshot(storeRef, (docSnap) => {
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
            const { isRemoteUpdate, setStoreFromFirebase, resetStore, ...dataToSave } = useStore.getState();
            setDoc(storeRef, dataToSave, { merge: true }).catch(err => console.error(err));
          }
        }
      });

      // 2. Listen for local changes in Zustand and push to Firebase
      unsubStore = useStore.subscribe((state, prevState) => {
        // Ignore if this update came from Firebase itself
        if (state.isRemoteUpdate) {
          useStore.setState({ isRemoteUpdate: false });
          return;
        }

        // Update local timestamp to indicate this is a fresh local change
        if (state.lastUpdatedLocal === prevState.lastUpdatedLocal) {
           useStore.setState({ lastUpdatedLocal: Date.now() });
           return; 
        }

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log('Pushing to Cloud...');
          const { isRemoteUpdate, setStoreFromFirebase, resetStore, ...dataToSave } = useStore.getState();
          
          setDoc(storeRef, dataToSave, { merge: true }).catch(err => {
            console.error("Error pushing to Firebase:", err);
          });
        }, 2000);
      });
    });

    return () => {
      unsubAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (unsubStore) unsubStore();
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
