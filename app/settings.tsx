import { storage } from "@/lib/storage";
import { useAuth } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
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

  return (
    <SafeAreaView
      className="flex-1 bg-[#F9F9F9]"
      edges={["bottom", "left", "right"]}
    >
      <View className="flex-1 px-6">
        {/* Settings Options */}
        <View className="items-center gap-4 mt-8">
          <TouchableOpacity
            onPress={handleResetOnboarding}
            className="flex-row items-center bg-[#F3F4F6] px-8 py-5 rounded-full w-full justify-center"
          >
            <FontAwesome
              name="refresh"
              size={18}
              color="#4B5563"
              className="mr-3"
            />
            <Text className="text-gray-700 text-lg font-medium ml-3">
              Reset Onboarding (Debug)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center bg-[#FEF2F2] px-8 py-5 rounded-full w-full justify-center"
          >
            <FontAwesome
              name="sign-out"
              size={18}
              color="#EF4444"
              className="mr-3"
            />
            <Text className="text-red-500 text-lg font-medium ml-3">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-auto mb-8 items-center">
          <Text className="text-gray-400 text-sm">Version 1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
