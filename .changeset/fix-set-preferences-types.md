---
"@knocklabs/client": patch
---

Fix TypeScript type mismatch in SetPreferencesProperties. All fields (workflows, categories, channel_types, channels) are now optional to match the nullable nature of PreferenceSet returned by getPreferences(). This allows users to pass preference data without type errors and properly supports partial updates.
