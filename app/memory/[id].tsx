import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock data - in a real app, you'd fetch this using the ID
  const memory = {
    date: "Tue, 12 March, 2025 • 6:42 PM",
    tags: ["Gym", "Motivated"],
    content: `Today felt like a breakthrough. Usually, the early morning alarm is an enemy, but today it was a call to action. I pushed through the initial resistance and hit a personal best. It's not just about the physical gain; it's the mental clarity that follows. Remembering that the best things are on the other side of "I don't feel like it."`,
    summary: "A quote about choosing long-term goals over short-term comfort.",
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F9F9F9]"
      edges={["bottom", "left", "right"]}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="flex-grow px-6 pb-12 pt-6">
        {/* Date */}
        <Text className="text-[#6B7280] text-sm font-medium mb-4">
          {memory.date}
        </Text>

        {/* Tags */}
        <View className="flex-row gap-2 mb-8 flex-wrap">
          {memory.tags.map((tag, index) => (
            <View key={index} className="bg-[#F3F4F6] rounded-full px-4 py-1.5">
              <Text className="text-gray-500 text-xs font-bold uppercase tracking-wide">
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {/* Main Content */}
        {/* Using a serif-like font stack or styling for the "book" feel */}
        <Text
          className="text-[#1F2937] text-xl leading-8 mb-10"
          style={{
            fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
          }}
        >
          <Text className="italic">{memory.content}</Text>
        </Text>

        {/* Mimo's Summary Card */}
        <View className="bg-[#F9F9F9] rounded-2xl p-6 mb-12">
          <Text className="font-caveat text-2xl text-[#5C4033] mb-3">
            Mimo's summary
          </Text>
          <Text className="text-[#4B5563] text-base leading-6">
            {memory.summary}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center gap-12 mb-6">
          <TouchableOpacity className="items-center gap-2">
            <FontAwesome name="pencil-square-o" size={24} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] text-xs font-bold tracking-widest uppercase">
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center gap-2">
            <FontAwesome name="trash-o" size={24} color="#9CA3AF" />
            <Text className="text-[#9CA3AF] text-xs font-bold tracking-widest uppercase">
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
