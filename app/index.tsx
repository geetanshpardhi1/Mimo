import { storage } from "@/lib/storage";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, useColorScheme } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const firstTime = await storage.isFirstTimeUser();
    setIsFirstTime(firstTime);
  };

  useEffect(() => {
    if (!isLoaded || isFirstTime === null) return;

    const timer = setTimeout(() => {
      if (isFirstTime) {
        router.replace("/onboarding/one");
      } else if (isSignedIn) {
        router.replace("/(tabs)/save");
      } else {
        router.replace("/auth/sign-in");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, isFirstTime]);

  const isDark = colorScheme === "dark";

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: isDark ? "#000000" : "#FFFFFF" }}
    >
      <Text
        style={{
          fontFamily: "Caveat_700Bold",
          fontSize: 72,
          color: isDark ? "#FFFFFF" : "#2D2D2D",
          paddingHorizontal: 20,
        }}
      >
        MIMO
      </Text>
      <ActivityIndicator
        size="small"
        color={isDark ? "#CCCCCC" : "#666666"}
        style={{ marginTop: 24 }}
      />
    </View>
  );
}
