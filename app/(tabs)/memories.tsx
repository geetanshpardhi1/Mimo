import { useMemoryApi, type Memory } from "@/lib/api/memories";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemoriesScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const memoryApi = useMemoryApi();

  const loadMemories = async () => {
    try {
      const data = await memoryApi.getAll();
      setMemories(data);
    } catch (error) {
      console.error("Error loading memories:", error);
      Alert.alert("Error", "Failed to load memories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMemories();
    setRefreshing(false);
  }, []);

  // Helper to format date like "12 MARCH"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      })
      .toUpperCase();
  };

  const filteredMemories = memories.filter((memory) => {
    if (!searchText.trim()) return true;
    const needle = searchText.trim().toLowerCase();
    const haystack = [
      memory.summary,
      memory.raw_text,
      memory.context,
      memory.mood,
      formatDate(memory.created_at),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      <ScrollView
        contentContainerClassName="flex-grow pb-8 px-6 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5C4033"
          />
        }
      >
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="font-caveat text-5xl text-[#4A3728] px-1">
            Your Memories
          </Text>
          <Text className="text-[#6B7280] text-sm font-medium mt-1">
            Everything you've saved
          </Text>
          {!loading && memories.length > 0 ? (
            <View className="mt-3 bg-white border border-gray-100 rounded-full px-4 py-1.5">
              <Text className="text-xs text-[#6B7280] font-semibold tracking-widest uppercase">
                {memories.length} {memories.length === 1 ? "Memory" : "Memories"}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Search */}
        {!loading && memories.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center bg-white border border-gray-100 rounded-2xl px-4 py-3">
              <FontAwesome name="search" size={14} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-800"
                placeholder="Search memories"
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
              />
              {searchText.trim().length > 0 ? (
                <Pressable
                  onPress={() => setSearchText("")}
                  className="ml-2 h-6 w-6 items-center justify-center rounded-full bg-[#F3F4F6]"
                  android_ripple={{ color: "#E5E7EB" }}
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.98 : 1 }] },
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <FontAwesome name="times" size={12} color="#9CA3AF" />
                </Pressable>
              ) : null}
            </View>

            {searchText.trim().length > 0 && (
              <Text className="text-xs text-[#6B7280] mt-2">
                Showing {filteredMemories.length} of {memories.length}
              </Text>
            )}
          </View>
        )}

        {/* Loading State */}
        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#5C4033" />
            <Text className="text-gray-500 mt-4">Loading memories...</Text>
          </View>
        ) : memories.length === 0 ? (
          /* Empty State */
          <View className="items-center justify-center py-20">
            <FontAwesome name="book" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg mt-4 font-caveat">
              No memories yet
            </Text>
            <Text className="text-gray-400 text-sm mt-2">
              Save your first memory from the Save tab
            </Text>
          </View>
        ) : (
          /* Memories List */
          <View className="gap-4">
            {filteredMemories.map((memory) => (
              <Pressable
                key={memory.id}
                onPress={() => router.push(`/memory/${memory.id}`)}
                className="bg-white rounded-[24px] p-6 shadow-sm shadow-gray-200 border border-gray-100"
                android_ripple={{ color: "#F3F4F6" }}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.99 : 1 }] },
                  { opacity: pressed ? 0.95 : 1 },
                ]}
                accessibilityRole="button"
              >
                {/* Card Header: Date & Menu */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <Text className="text-[#9CA3AF] text-xs font-bold tracking-widest uppercase">
                      {formatDate(memory.created_at)}
                    </Text>
                  </View>
                </View>

                {/* Memory Content */}
                <Text
                  numberOfLines={3}
                  className="text-gray-800 text-lg font-medium leading-6 mb-4"
                >
                  {memory.summary || memory.raw_text}
                </Text>

                {/* Tags */}
                <View className="flex-row gap-2 flex-wrap">
                  {memory.context && (
                    <View className="bg-[#F6EFE9] rounded-full px-4 py-1.5 border border-[#E8DDD3]">
                      <Text className="text-[#6B4A3A] text-xs font-semibold">
                        {memory.context}
                      </Text>
                    </View>
                  )}
                  {memory.mood && (
                    <View className="bg-[#EEF2F3] rounded-full px-4 py-1.5 border border-[#DCE3E6]">
                      <Text className="text-[#4B5B5F] text-xs font-semibold">
                        {memory.mood}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}

            {filteredMemories.length === 0 && (
              <View className="items-center justify-center py-16 bg-white rounded-[24px] border border-gray-100">
                <FontAwesome name="search" size={28} color="#D1D5DB" />
                <Text className="text-gray-600 text-base font-medium mt-3">
                  No results found
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Try a different keyword
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
