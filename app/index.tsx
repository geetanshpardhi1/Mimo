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
    <View className="flex-1 items-center justify-center bg-[#FDFBF7]">
      <Text className="text-5xl font-light text-[#2D2D2D] mb-8 tracking-widest">
        Mimo
      </Text>
      <ActivityIndicator size="small" color="#8B6D5C" />
    </View>
  );
}
