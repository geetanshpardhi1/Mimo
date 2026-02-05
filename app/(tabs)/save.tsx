import { useMemoryApi } from "@/lib/api/memories";
import { storage } from "@/lib/storage";
import { useAuth, useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SaveScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [memory, setMemory] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const memoryApi = useMemoryApi();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

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

  // Helper to get formatted date like "TUE, 12 MARCH, 2025"
  const getFormattedDate = () => {
    const date = new Date();
    return date
      .toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .toUpperCase();
  };

  const handleSaveMemory = async () => {
    if (!memory.trim()) {
      Alert.alert("Empty Memory", "Please enter a memory before saving");
      return;
    }

    if (memory.length > 5000) {
      Alert.alert(
        "Memory Too Long",
        "Memory must be less than 5000 characters",
      );
      return;
    }

    setSaving(true);
    try {
      const savedMemory = await memoryApi.create({ raw_text: memory });

      // Trigger AI processing in the background (non-blocking)
      // This generates summary and embeddings asynchronously
      memoryApi
        .processWithAI(savedMemory.id, savedMemory.raw_text)
        .catch((err) => {
          console.log("AI processing will continue in background:", err);
        });

      Alert.alert("Success", "Memory saved! AI is processing...");
      setMemory(""); // Clear input
    } catch (error) {
      console.error("Error saving memory:", error);
      if (error instanceof Error && error.message.includes("JWT")) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please sign in again.",
        );
        handleSignOut();
      } else {
        Alert.alert("Error", "Failed to save memory. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5C4033"
          />
        }
      >
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="font-caveat text-5xl text-[#4A3728] px-1">Mimo</Text>
          <Text className="text-[#6B7280] text-sm font-bold tracking-widest mt-1">
            {getFormattedDate()}
          </Text>
        </View>

        {/* Greeting */}
        <View className="items-center mb-10">
          <Text className="font-caveat text-4xl text-[#1F2937]">
            Good afternoon, {user?.firstName}
          </Text>
          <Text className="text-[#4B5563] text-lg mt-2 font-medium">
            What's on your mind?
          </Text>
        </View>

        {/* Input Area */}
        <View className="bg-[#F3F4F6] rounded-3xl p-6 h-56 mb-8">
          <TextInput
            className="flex-1 text-lg text-gray-800 leading-7 font-medium"
            placeholder="Write a thought or memory you want to keep..."
            placeholderTextColor="#6B7280"
            multiline
            textAlignVertical="top"
            value={memory}
            onChangeText={setMemory}
            editable={!saving}
          />
        </View>

        {/* Context Chips */}
        <View className="items-center gap-4 mb-12">
          <TouchableOpacity className="flex-row items-center bg-[#F3F4F6] px-6 py-4 rounded-full">
            <Text className="text-gray-600 text-xl mr-3 font-semibold">+</Text>
            <Text className="text-gray-700 text-lg font-medium">
              Where are you?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-[#F3F4F6] px-6 py-4 rounded-full">
            <Text className="text-gray-600 text-xl mr-3 font-semibold">+</Text>
            <Text className="text-gray-700 text-lg font-medium">
              How are you feeling?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View className="items-center mb-6">
          <TouchableOpacity
            className="bg-[#5C4033] rounded-full py-5 px-16 flex-row items-center shadow-lg shadow-orange-900/20"
            onPress={handleSaveMemory}
            disabled={saving}
          >
            <View className="bg-white rounded-full p-1 mr-3">
              <FontAwesome name="plus" size={18} color="#5C4033" />
            </View>
            <Text className="text-white text-xl font-semibold">
              {saving ? "Saving..." : "Save Memory"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
