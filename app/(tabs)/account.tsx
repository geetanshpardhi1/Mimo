import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="font-caveat text-5xl text-[#4A3728]">Account</Text>
        </View>

        {/* Profile Section */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-white shadow-sm">
            <Image source={{ uri: user?.imageUrl }} className="w-full h-full" />
          </View>
          <Text className="text-2xl font-bold text-[#1F2937] mb-1">
            {user?.fullName}
          </Text>
          <Text className="text-[#6B7280] text-base">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        {/* Menu Options */}
        <View className="items-center mt-8">
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="bg-[#5C4033] rounded-full py-5 px-16 flex-row items-center shadow-lg shadow-orange-900/20"
          >
            <View className="bg-white rounded-full p-1 mr-3">
              <FontAwesome name="cog" size={18} color="#5C4033" />
            </View>
            <Text className="text-white text-xl font-semibold">Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
