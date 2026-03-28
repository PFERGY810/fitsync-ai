import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

import { flushOfflineQueue } from "@/lib/storage";

export function useOfflineSync() {
  useEffect(() => {
    flushOfflineQueue().catch((error) => {
      console.error("Offline sync init failed:", error);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        flushOfflineQueue().catch((error) => {
          console.error("Offline sync failed:", error);
        });
      }
    });

    return () => unsubscribe();
  }, []);
}
