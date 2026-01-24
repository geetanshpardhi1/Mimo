import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecallScreen() {
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a network request or refresh action
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

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
          <Text className="font-caveat px-2 text-5xl text-[#4A3728]">Recall</Text>
        </View>

        {/* Search Input Area */}
        <View className="bg-[#F3F4F6] rounded-3xl p-6 h-40 mb-[-25px] z-10 relative">
          <TextInput
            className="flex-1 text-lg text-gray-800 leading-7 font-medium"
            placeholder="Ask Mimo about a memory..."
            placeholderTextColor="#6B7280"
            multiline
            textAlignVertical="top"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Recall Action Button */}
        <View className="items-center z-20 mb-8">
          <TouchableOpacity
            className="bg-[#5C4033] rounded-full py-4 px-10 flex-row items-center shadow-lg shadow-orange-900/20"
            onPress={() => console.log("Recall memory")}
          >
            <View className="mr-2">
              <FontAwesome name="magic" size={16} color="#FFF" />
            </View>
            <Text className="text-white text-lg font-semibold">Recall</Text>
          </TouchableOpacity>
        </View>

        {/* Results Placeholder Area */}
        <View className="bg-[#FDFDFD] border border-gray-100 rounded-3xl items-center justify-center mb-4 py-12">
          <View className="items-center opacity-60">
            <FontAwesome name="book" size={32} color="#9CA3AF" />
            <Text className="text-[#6B7280] text-lg font-caveat mt-2">
              Your memories will appear here...
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
