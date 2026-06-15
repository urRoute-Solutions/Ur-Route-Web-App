"use client";

import { useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

export function PushNotificationSetup() {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!apiKey || !vapidKey || !projectId) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    async function setup() {
      const supported = await isSupported().catch(() => false);
      if (!supported) return;

      if (Notification.permission === "denied") return;

      const app =
        getApps().length === 0
          ? initializeApp({
              apiKey,
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
              projectId,
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            })
          : getApps()[0]!;

      try {
        const messaging = getMessaging(app);
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const token = await getToken(messaging, { vapidKey });
        if (!token) return;

        await fetch("/api/notifications/fcm-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, platform: "web" }),
        });
      } catch {
        // Silently fail — push is best-effort
      }
    }

    setup();
  }, []);

  return null;
}
