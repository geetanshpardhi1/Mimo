// app/(tabs)/save.tsx

import { useMemoryApi } from "@/lib/api/memories";
import { storage } from "@/lib/storage";
import { useAuth, useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  LayoutAnimation,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  View,
  KeyboardAvoidingView,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SaveScreen() {
  if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [memory, setMemory] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const memoryApi = useMemoryApi();

  // Smart context/mood state
  const [context, setContext] = useState<string>("");
  const [mood, setMood] = useState<string>("");
  const [showContexts, setShowContexts] = useState(false);
  const [showMoods, setShowMoods] = useState(false);
  const [isContextCustom, setIsContextCustom] = useState(false);
  const [isMoodCustom, setIsMoodCustom] = useState(false);

  // IMPROVED: Semantic-rich presets (no emojis, natural language)
  const CONTEXT_PRESETS = [
    "Work meeting",
    "Personal reflection",
    "Conversation with friend",
    "Reading or learning",
    "Travel or commute",
    "Exercise or health",
    "Family time",
    "Creative work",
    "Custom...", // Opens free text
  ];

  const MOOD_PRESETS = [
    "Excited and energized",
    "Calm and peaceful",
    "Anxious or worried",
    "Grateful and content",
    "Frustrated or angry",
    "Sad or melancholy",
    "Confused or uncertain",
    "Motivated and focused",
    "Custom...", // Opens free text
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth/sign-in");
  };

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

  const handleContextSelect = (selected: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selected === "Custom...") {
      setIsContextCustom(true);
      setContext("");
      setShowContexts(false);
    } else {
      setContext(selected);
      setIsContextCustom(false);
      setShowContexts(false);
    }
  };

  const clearContext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setContext("");
    setIsContextCustom(false);
    setShowContexts(true);
  };

  const handleContextPresetPress = (selected: string) => {
    if (selected === context) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setContext("");
      setIsContextCustom(false);
      setShowContexts(true);
      return;
    }

    handleContextSelect(selected);
  };

  const handleMoodSelect = (selected: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selected === "Custom...") {
      setIsMoodCustom(true);
      setMood("");
      setShowMoods(false);
    } else {
      setMood(selected);
      setIsMoodCustom(false);
      setShowMoods(false);
    }
  };

  const clearMood = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMood("");
    setIsMoodCustom(false);
    setShowMoods(true);
  };

  const handleMoodPresetPress = (selected: string) => {
    if (selected === mood) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMood("");
      setIsMoodCustom(false);
      setShowMoods(true);
      return;
    }

    handleMoodSelect(selected);
  };

  const handleSaveMemory = async () => {
    if (!memory.trim()) {
      Alert.alert("Empty Memory", "Please enter a memory before saving");
      return;
    }

    if (memory.length > 5000) {
      Alert.alert("Memory Too Long", "Memory must be less than 5000 characters");
      return;
    }

    setSaving(true);
    try {
      const savedMemory = await memoryApi.create({
        raw_text: memory.trim(),
        context: context.trim() || undefined,
        mood: mood.trim() || undefined,
      });

      // Background AI processing
      memoryApi
        .processWithAI(savedMemory.id, savedMemory.raw_text)
        .catch((err: any) => {
          console.log("AI processing continues in background:", err);
        });

      Alert.alert("Success", "Memory saved! AI is processing...");
      
      // Reset form
      setMemory("");
      setContext("");
      setMood("");
      setShowContexts(false);
      setShowMoods(false);
      setIsContextCustom(false);
      setIsMoodCustom(false);
    } catch (error) {
      console.error("Error saving memory:", error);
      if (error instanceof Error && error.message.includes("JWT")) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please sign in again."
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-4"
          keyboardShouldPersistTaps="handled"
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

          {/* Memory Input */}
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

          {/* Context Section */}
          <View className="w-full mb-4">
            {!isContextCustom ? (
              <>
                <View className="flex-row items-center">
                  <Pressable
                    className={`flex-1 flex-row items-center justify-between px-6 py-4 rounded-full ${
                      context ? "bg-[#5C4033]" : "bg-[#F3F4F6]"
                    }`}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setShowContexts((prev) => !prev);
                    setShowMoods(false);
                  }}
                    android_ripple={{ color: "#6B7280" }}
                    style={({ pressed }) => [
                      { transform: [{ scale: pressed ? 0.99 : 1 }] },
                      { opacity: pressed ? 0.9 : 1 },
                    ]}
                    accessibilityRole="button"
                  >
                    <View className="flex-row items-center flex-1 pr-3">
                      <FontAwesome
                        name={context ? "check" : "plus"}
                        size={18}
                        color={context ? "white" : "#6B7280"}
                        style={{ marginRight: 12 }}
                      />
                      <Text
                        className={`text-lg font-medium ${
                          context ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {context || "Where or what situation?"}
                      </Text>
                    </View>
                    <FontAwesome
                      name={showContexts ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={context ? "white" : "#6B7280"}
                    />
                  </Pressable>

                  {context ? (
                    <Pressable
                      onPress={clearContext}
                      className="ml-3 h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6]"
                      android_ripple={{ color: "#6B7280" }}
                      style={({ pressed }) => [
                        { transform: [{ scale: pressed ? 0.98 : 1 }] },
                        { opacity: pressed ? 0.9 : 1 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Clear selected context"
                    >
                      <FontAwesome name="times" size={16} color="#6B7280" />
                    </Pressable>
                  ) : null}
                </View>
              </>
            ) : (
              <View className="bg-[#F3F4F6] rounded-2xl p-4">
                <Text className="text-gray-600 mb-2 font-medium">
                  Describe the situation:
                </Text>
                <TextInput
                  className="text-lg text-gray-800 min-h-[60px]"
                  placeholder="e.g., Coffee shop with Sarah discussing work project"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={context}
                  onChangeText={setContext}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsContextCustom(false);
                    setShowContexts(true);
                  }}
                  className="mt-2"
                >
                  <Text className="text-[#5C4033] font-medium">
                    ← Back to presets
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {showContexts && !isContextCustom && (
              <View className="mt-4">
                <Text className="text-xs text-[#6B7280] mb-2">
                  Choose one option or tap the X to clear.
                </Text>
                <View className="flex-row flex-wrap justify-between mt-3">
                  {CONTEXT_PRESETS.map((preset) => {
                    const isSelected = preset === context;
                    return (
                      <Pressable
                        key={preset}
                        onPress={() => handleContextPresetPress(preset)}
                        android_ripple={{ color: "#F3F4F6" }}
                        style={({ pressed }) => [
                          { transform: [{ scale: pressed ? 0.98 : 1 }] },
                          { opacity: pressed ? 0.9 : 1 },
                        ]}
                        className={`w-[48%] min-h-[52px] flex-row items-center px-3 py-3 rounded-2xl border overflow-hidden mb-3 ${
                          isSelected
                            ? "bg-[#5C4033] border-[#5C4033]"
                            : "bg-white border-gray-300"
                        }`}
                        accessibilityRole="button"
                        hitSlop={4}
                      >
                        {isSelected && (
                          <FontAwesome
                            name="check"
                            size={14}
                            color="white"
                            style={{ marginRight: 8 }}
                          />
                        )}
                        <Text
                          numberOfLines={2}
                          className={`font-medium ${
                            isSelected ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {preset}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Mood Section */}
          <View className="w-full mb-12">
            {!isMoodCustom ? (
              <>
                <View className="flex-row items-center">
                  <Pressable
                    className={`flex-1 flex-row items-center justify-between px-6 py-4 rounded-full ${
                      mood ? "bg-[#5C4033]" : "bg-[#F3F4F6]"
                    }`}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setShowMoods((prev) => !prev);
                    setShowContexts(false);
                  }}
                    android_ripple={{ color: "#6B7280" }}
                    style={({ pressed }) => [
                      { transform: [{ scale: pressed ? 0.99 : 1 }] },
                      { opacity: pressed ? 0.9 : 1 },
                    ]}
                    accessibilityRole="button"
                  >
                    <View className="flex-row items-center flex-1 pr-3">
                      <FontAwesome
                        name={mood ? "check" : "plus"}
                        size={18}
                        color={mood ? "white" : "#6B7280"}
                        style={{ marginRight: 12 }}
                      />
                      <Text
                        className={`text-lg font-medium ${
                          mood ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {mood || "How are you feeling?"}
                      </Text>
                    </View>
                    <FontAwesome
                      name={showMoods ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={mood ? "white" : "#6B7280"}
                    />
                  </Pressable>

                  {mood ? (
                    <Pressable
                      onPress={clearMood}
                      className="ml-3 h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6]"
                      android_ripple={{ color: "#6B7280" }}
                      style={({ pressed }) => [
                        { transform: [{ scale: pressed ? 0.98 : 1 }] },
                        { opacity: pressed ? 0.9 : 1 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Clear selected mood"
                    >
                      <FontAwesome name="times" size={16} color="#6B7280" />
                    </Pressable>
                  ) : null}
                </View>
              </>
            ) : (
              <View className="bg-[#F3F4F6] rounded-2xl p-4">
                <Text className="text-gray-600 mb-2 font-medium">
                  Describe your feeling:
                </Text>
                <TextInput
                  className="text-lg text-gray-800 min-h-[60px]"
                  placeholder="e.g., Overwhelmed but hopeful about the challenge"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={mood}
                  onChangeText={setMood}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsMoodCustom(false);
                    setShowMoods(true);
                  }}
                  className="mt-2"
                >
                  <Text className="text-[#5C4033] font-medium">
                    ← Back to presets
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {showMoods && !isMoodCustom && (
              <View className="mt-4">
                <Text className="text-xs text-[#6B7280] mb-2">
                  Choose one option or tap the X to clear.
                </Text>
                <View className="flex-row flex-wrap justify-between mt-3">
                  {MOOD_PRESETS.map((preset) => {
                    const isSelected = preset === mood;
                    return (
                      <Pressable
                        key={preset}
                        onPress={() => handleMoodPresetPress(preset)}
                        android_ripple={{ color: "#F3F4F6" }}
                        style={({ pressed }) => [
                          { transform: [{ scale: pressed ? 0.98 : 1 }] },
                          { opacity: pressed ? 0.9 : 1 },
                        ]}
                        className={`w-[48%] min-h-[52px] flex-row items-center px-3 py-3 rounded-2xl border overflow-hidden mb-3 ${
                          isSelected
                            ? "bg-[#5C4033] border-[#5C4033]"
                            : "bg-white border-gray-300"
                        }`}
                        accessibilityRole="button"
                        hitSlop={4}
                      >
                        {isSelected && (
                          <FontAwesome
                            name="check"
                            size={14}
                            color="white"
                            style={{ marginRight: 8 }}
                          />
                        )}
                        <Text
                          numberOfLines={2}
                          className={`font-medium ${
                            isSelected ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {preset}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Save Button */}
          <View className="items-center mb-6">
            <Pressable
              className="bg-[#5C4033] rounded-full py-5 px-16 flex-row items-center shadow-lg shadow-orange-900/20"
              onPress={handleSaveMemory}
              disabled={saving}
              android_ripple={{ color: "#6B7280" }}
              style={({ pressed }) => [
                { transform: [{ scale: pressed && !saving ? 0.98 : 1 }] },
                { opacity: saving ? 0.6 : pressed ? 0.9 : 1 },
              ]}
              accessibilityRole="button"
            >
              <View className="bg-white rounded-full p-2 mr-3">
                <FontAwesome name="bookmark" size={16} color="#5C4033" />
              </View>
              <Text className="text-white text-xl font-semibold">
                {saving ? "Saving..." : "Save Memory"}
              </Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
