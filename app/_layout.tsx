import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  Caveat_400Regular,
  Caveat_700Bold,
  useFonts,
} from "@expo-google-fonts/caveat";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Caveat_400Regular,
    Caveat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              title: "",
            }}
          />

          <Stack.Screen
            name="memory/[id]"
            options={{
              headerShown: true,
              presentation: "formSheet",
              sheetAllowedDetents: "fitToContents",
              sheetGrabberVisible: true,
              headerTitle: "Memory",
              headerTitleStyle: {
                fontFamily: "Caveat_700Bold",
                fontSize: 28,
                color: "#4A3728",
              },
              headerTintColor: "#4A3728",
              headerBackTitle: "",
              headerShadowVisible: false,
              headerStyle: { backgroundColor: "#F9F9F9" },
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: true,
              headerTitle: "Settings",
              headerTitleStyle: {
                fontFamily: "Caveat_700Bold",
                fontSize: 28,
                color: "#4A3728",
              },
              headerTintColor: "#4A3728",
              headerBackTitle: "",

              headerShadowVisible: false,
              headerStyle: { backgroundColor: "#F9F9F9" },
            }}
          />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
