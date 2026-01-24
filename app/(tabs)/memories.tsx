import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hardcoded data for memories
const MEMORIES = [
  {
    id: 1,
    date: "12 MARCH",
    content:
      "Discipline is doing what needs to be done, even if you don't want to do it.",
    tags: ["Gym", "Motivated"],
  },
  {
    id: 2,
    date: "10 MARCH",
    content:
      "The coffee at the new corner shop was surprisingly good. Met an old friend there.",
    tags: ["Travel", "Nostalgic"],
  },
  {
    id: 3,
    date: "08 MARCH",
    content: "Finally finished reading 'The Alchemist'. What a journey!",
    tags: ["Reading", "Peaceful"],
  },
  {
    id: 4,
    date: "05 MARCH",
    content: "A beautiful sunset by the bay. Colors I've never seen before.",
    tags: ["Nature"],
  },
  {
    id: 5,
    date: "01 MARCH",
    content:
      "Started the new project today. Feeling a bit overwhelmed but excited.",
    tags: ["Work", "Anxious"],
  },
];

export default function MemoriesScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

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

        {/* Memories List */}
        <View className="gap-4">
          {MEMORIES.map((memory) => (
            <View
              key={memory.id}
              className="bg-white rounded-[24px] p-6 shadow-sm shadow-gray-200 border border-gray-100"
            >
              {/* Card Header: Date & Menu */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[#9CA3AF] text-xs font-bold tracking-widest uppercase">
                  {memory.date}
                </Text>
                <TouchableOpacity>
                  <FontAwesome name="ellipsis-h" size={14} color="#D1D5DB" />
                </TouchableOpacity>
              </View>

              {/* Memory Content */}
              <Text className="text-gray-800 text-lg font-medium leading-6 mb-4">
                {memory.content}
              </Text>

              {/* Tags */}
              <View className="flex-row gap-2 flex-wrap">
                {memory.tags.map((tag, index) => (
                  <View
                    key={index}
                    className="bg-[#F3F4F6] rounded-full px-4 py-1.5"
                  >
                    <Text className="text-gray-500 text-xs font-semibold">
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
