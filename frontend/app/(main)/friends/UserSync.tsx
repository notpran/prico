"use client";

import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

export default function UserSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return;

      try {
        const token = await getToken();
        if (!token) return;

        // Try to get current user, this will auto-create if doesn't exist
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to sync user:", response.status);
        } else {
          const userData = await response.json();
          console.log("User synced:", userData.username);
        }
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    syncUser();
  }, [isLoaded, user, getToken]);

  return null; // This component doesn't render anything
}