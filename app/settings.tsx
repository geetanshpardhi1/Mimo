import { storage } from "@/lib/storage";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth/sign-in");
  };

  const handleResetOnboarding = async () => {
    await storage.resetOnboarding();
    alert("Onboarding reset. Restart app to see it.");
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-8">Settings</Text>
      <TouchableOpacity
        className="bg-red-500 px-6 py-3 rounded-full mb-4 w-full"
        onPress={handleSignOut}
      >
        <Text className="text-white font-semibold text-center">Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-200 px-6 py-3 rounded-full w-full"
        onPress={handleResetOnboarding}
      >
        <Text className="text-black font-semibold text-center">
          Reset Onboarding (Debug)
        </Text>
      </TouchableOpacity>
    </View>
  );
}
