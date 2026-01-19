import { storage } from "@/lib/storage";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

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

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-4xl font-bold text-blue-600 mb-4">Mimo</Text>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}
