import { storage } from "@/lib/storage";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function AccountScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth/sign-in");
  };

  const handleResetOnboarding = async () => {
    await storage.resetOnboarding();
    Alert.alert(
      "Success",
      "Onboarding reset. Restart the app to see the onboarding flow.",
    );
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-4 gap-4">
      <Text className="text-2xl font-bold mb-8">Account</Text>

      <TouchableOpacity
        onPress={handleSettings}
        className="bg-blue-500 px-6 py-3 rounded-lg w-full"
      >
        <Text className="text-white text-center font-semibold">Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-500 px-6 py-3 rounded-lg w-full"
      >
        <Text className="text-white text-center font-semibold">
          Sign Out (Debug)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleResetOnboarding}
        className="bg-gray-800 px-6 py-3 rounded-lg w-full"
      >
        <Text className="text-white text-center font-semibold">
          Reset Onboarding (Debug)
        </Text>
      </TouchableOpacity>
    </View>
  );
}
