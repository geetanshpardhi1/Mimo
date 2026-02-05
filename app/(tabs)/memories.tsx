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
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemoriesScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
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
        <View className="items-center mb-10 ">
          <Text className="font-caveat text-5xl text-[#4A3728] px-1">
            Your Memories
          </Text>
          <Text className="text-[#6B7280] text-sm font-medium mt-1">
            Everything you've saved
          </Text>
        </View>

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
            {memories.map((memory) => (
              <TouchableOpacity
                key={memory.id}
                activeOpacity={0.9}
                onPress={() => router.push(`/memory/${memory.id}`)}
                className="bg-white rounded-[24px] p-6 shadow-sm shadow-gray-200 border border-gray-100"
              >
                {/* Card Header: Date & Menu */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-[#9CA3AF] text-xs font-bold tracking-widest uppercase">
                    {formatDate(memory.created_at)}
                  </Text>
                  <TouchableOpacity>
                    <FontAwesome name="ellipsis-h" size={14} color="#D1D5DB" />
                  </TouchableOpacity>
                </View>

                {/* Memory Content */}
                <Text className="text-gray-800 text-lg font-medium leading-6 mb-4">
                  {memory.summary || memory.raw_text}
                </Text>

                {/* Tags */}
                <View className="flex-row gap-2 flex-wrap">
                  {memory.context && (
                    <View className="bg-[#F3F4F6] rounded-full px-4 py-1.5">
                      <Text className="text-gray-500 text-xs font-semibold">
                        {memory.context}
                      </Text>
                    </View>
                  )}
                  {memory.mood && (
                    <View className="bg-[#F3F4F6] rounded-full px-4 py-1.5">
                      <Text className="text-gray-500 text-xs font-semibold">
                        {memory.mood}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
