import * as SecureStore from "expo-secure-store";

const ONBOARDING_KEY = "mimo-is-first-time-user";

export const storage = {
  async isFirstTimeUser(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
      // If value is null, it means the key doesn't exist, so it IS the first time.
      return value === null;
    } catch (e) {
      return true; // Default to true on error
    }
  },

  async setOnboardingCompleted() {
    try {
      await SecureStore.setItemAsync(ONBOARDING_KEY, "false");
    } catch (e) {
      console.error("Failed to set onboarding status", e);
    }
  },

  async resetOnboarding() {
    // For testing purposes
    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
  },
};
