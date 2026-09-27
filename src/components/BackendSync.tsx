'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { getStoreData, updateStoreData } from '@/lib/api';

let isSyncing = false;
let isInitialLoad = true;

export default function BackendSync() {
  useEffect(() => {
    const token = localStorage.getItem('pos_token');
    if (!token) return;

    let unsubStore: (() => void) | undefined;
    let timeoutId: NodeJS.Timeout | undefined;
    let pollInterval: NodeJS.Timeout | undefined;

    const syncFromBackend = async () => {
      try {
        const response = await getStoreData(token);
        if (response.data) {
          const remoteData = response.data;

          if (isInitialLoad) {
            console.log('Backend Sync: Initial load from cloud');
            isSyncing = true;
            useStore.getState().setStoreFromFirebase(remoteData as any);
            isInitialLoad = false;
            setTimeout(() => { isSyncing = false; }, 500);
            return;
          }

          const remoteTime = remoteData.lastUpdatedLocal || 0;
          const localTime = useStore.getState().lastUpdatedLocal || 0;

          if (remoteTime > localTime) {
            console.log('Backend Sync: Remote is newer, pulling...', { remoteTime, localTime });
            isSyncing = true;
            useStore.getState().setStoreFromFirebase(remoteData as any);
            setTimeout(() => { isSyncing = false; }, 500);
          }
        } else if (isInitialLoad) {
          console.log('Backend Sync: No cloud data, pushing initial data');
          isInitialLoad = false;
          pushToBackend();
        }
      } catch (error) {
        console.error('Backend Sync Error:', error);
      }
    };

    const pushToBackend = async () => {
      if (isSyncing) return;
      console.log('Backend Sync: Pushing to cloud...');
      const state = useStore.getState();
      const dataToSave = {
        inventory: state.inventory,
        cart: state.cart,
        sales: state.sales,
        cashTransactions: state.cashTransactions,
        heldBills: state.heldBills,
        customers: state.customers,
        customerTransactions: state.customerTransactions || [],
        storeSettings: state.storeSettings,
        lastUpdatedLocal: state.lastUpdatedLocal
      };
      
      try {
        await updateStoreData(token, dataToSave);
      } catch (err) {
        console.error('Backend Sync: Push failed', err);
      }
    };

    // Initial sync
    syncFromBackend();

    // Poll every 5 seconds for updates
    pollInterval = setInterval(syncFromBackend, 5000);

    // Listen for local changes → push to backend
    unsubStore = useStore.subscribe((state, prevState) => {
      if (isSyncing) return;
      if ((state.lastUpdatedLocal || 0) === 0) return;

      if (state.lastUpdatedLocal === prevState.lastUpdatedLocal) {
        useStore.setState({ lastUpdatedLocal: Date.now() });
        return;
      }

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        pushToBackend();
      }, 500);
    });

    return () => {
      if (unsubStore) unsubStore();
      if (timeoutId) clearTimeout(timeoutId);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  return null;
}
