---
"@knocklabs/expo": patch
---

Fix Android push notification channel registration issue and add customization options. The `KnockExpoPushNotificationProvider` had a race condition where the push token was not being properly registered with Knock's channel data on Android (and potentially iOS). This was caused by checking the state value immediately after setting it, before React had a chance to update the state. Additionally, added proper Android notification channel setup using `setNotificationChannelAsync`, which is required for Android push notifications to work correctly. Apps can now customize the Android notification channel setup by providing a `setupAndroidNotificationChannel` prop.
