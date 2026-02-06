// app/(tabs)/recall.tsx

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMemoryApi, SearchResult } from "@/lib/api/memories";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  View,
  ActivityIndicator,
  Alert,
  Keyboard,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecallScreen() {
  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const router = useRouter();
  const memoryApi = useMemoryApi();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMetadata, setSearchMetadata] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [recentQueries, setRecentQueries] = useState<string[]>([]);

  const triggerLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const runSearch = async (searchText: string) => {
    if (!searchText.trim()) {
      Alert.alert("Empty Query", "Please enter something to search for");
      return;
    }

    if (loading) return;

    Keyboard.dismiss();
    setLoading(true);
    setHasSearched(true);
    setLastQuery(searchText);
    setResults([]);
    setSearchMetadata(null);

    try {
      console.log("🔍 Searching for:", searchText);
      const response = await memoryApi.search(searchText, 20);

      console.log("✅ Search results:", response.count);
      triggerLayout();
      setResults(response.results);
      setSearchMetadata(response.query);
      setRecentQueries((prev) => {
        const normalized = searchText.trim();
        const withoutDupes = prev.filter(
          (item) => item.toLowerCase() !== normalized.toLowerCase()
        );
        return [normalized, ...withoutDupes].slice(0, 4);
      });
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Search Failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await runSearch(query);
  };

  const handleExamplePress = async (example: string) => {
    setQuery(example);
    await runSearch(example);
  };

  const handleRecentPress = async (example: string) => {
    setQuery(example);
    await runSearch(example);
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      triggerLayout();
      setHasSearched(false);
      setResults([]);
      setSearchMetadata(null);
      setLastQuery("");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return "bg-green-500";
    if (similarity >= 0.65) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.8) return "Excellent match";
    if (similarity >= 0.65) return "Good match";
    return "Possible match";
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-grow px-6 py-4" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="font-caveat text-5xl text-[#4A3728] px-4">Recall</Text>
          <Text className="text-gray-600 text-sm mt-2">Search your memories naturally</Text>
        </View>

        {/* Search Input */}
        <View className="bg-[#F3F4F6] rounded-3xl p-6 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-500 text-sm">Search query</Text>
            {query.trim().length > 0 ? (
              <Pressable
                onPress={() => handleQueryChange("")}
                className="bg-gray-100 px-3 py-1 rounded-full"
                android_ripple={{ color: "#E5E7EB" }}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  { opacity: pressed ? 0.9 : 1 },
                ]}
                accessibilityRole="button"
              >
                <Text className="text-gray-700 text-sm">Clear</Text>
              </Pressable>
            ) : null}
          </View>
          <TextInput
            className="text-lg text-gray-800 leading-7 font-medium min-h-[80px]"
            placeholder="Try 'last Monday at the gym' or 'conversation with Sarah'..."
            placeholderTextColor="#6B7280"
            multiline
            textAlignVertical="top"
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            editable={!loading}
          />
        </View>

        {/* Quick Examples */}
        {!hasSearched && (
          <View className="mb-6">
            {recentQueries.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 text-sm">Recent searches</Text>
                  <Pressable
                    onPress={() => setRecentQueries([])}
                    className="bg-gray-100 px-3 py-1 rounded-full"
                    android_ripple={{ color: "#E5E7EB" }}
                    style={({ pressed }) => [
                      { transform: [{ scale: pressed ? 0.98 : 1 }] },
                      { opacity: pressed ? 0.9 : 1 },
                    ]}
                    accessibilityRole="button"
                  >
                    <Text className="text-gray-700 text-sm">Clear</Text>
                  </Pressable>
                </View>
                <View className="flex-row flex-wrap justify-between">
                  {recentQueries.map((example) => (
                    <Pressable
                      key={example}
                      onPress={() => handleRecentPress(example)}
                      className="bg-gray-100 px-3 py-3 rounded-xl w-[48%] mb-3"
                      android_ripple={{ color: "#E5E7EB" }}
                      style={({ pressed }) => [
                        { transform: [{ scale: pressed ? 0.98 : 1 }] },
                        { opacity: pressed ? 0.9 : 1 },
                      ]}
                      accessibilityRole="button"
                    >
                      <Text className="text-gray-700 text-sm">{example}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <Text className="text-gray-500 text-sm mb-2">Try searching for:</Text>
            <View className="flex-row flex-wrap justify-between">
              {["last week", "conversation with", "when I felt happy", "gym workout"].map(
                (example) => (
                  <Pressable
                    key={example}
                    onPress={() => handleExamplePress(example)}
                    className="bg-gray-100 px-3 py-3 rounded-xl w-[48%] mb-3"
                    android_ripple={{ color: "#E5E7EB" }}
                    style={({ pressed }) => [
                      { transform: [{ scale: pressed ? 0.98 : 1 }] },
                      { opacity: pressed ? 0.9 : 1 },
                    ]}
                    accessibilityRole="button"
                  >
                    <Text className="text-gray-700 text-sm">{example}</Text>
                  </Pressable>
                )
              )}
            </View>
          </View>
        )}

        {/* Recall Button */}
        <Pressable
          className={`rounded-full py-4 px-10 flex-row items-center justify-center mb-6 shadow-lg shadow-orange-900/20 ${
            loading || !query.trim() ? "bg-gray-300" : "bg-[#5C4033]"
          }`}
          onPress={handleSearch}
          disabled={loading || !query.trim()}
          android_ripple={{ color: "#6B7280" }}
          style={({ pressed }) => [
            { transform: [{ scale: pressed && !loading ? 0.98 : 1 }] },
            { opacity: pressed ? 0.9 : 1 },
          ]}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <FontAwesome name="magic" size={16} color="#FFF" />
              <Text className="text-white text-lg font-semibold ml-2">Recall</Text>
            </>
          )}
        </Pressable>

        {/* Search Metadata */}
        {searchMetadata && (
          <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold text-blue-900">🔍 Search Analysis</Text>
              <Text className="text-xs text-blue-700">AI interpretation</Text>
            </View>
            <View className="space-y-2">
              {searchMetadata.has_temporal && searchMetadata.date_range && (
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2">
                    <FontAwesome name="calendar" size={12} color="#1e40af" />
                  </View>
                  <Text className="text-sm text-blue-800">
                    {searchMetadata.date_range.start === searchMetadata.date_range.end
                      ? searchMetadata.date_range.start
                      : `${searchMetadata.date_range.start} to ${searchMetadata.date_range.end}`}
                  </Text>
                </View>
              )}
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2">
                  <FontAwesome name="search" size={12} color="#1e40af" />
                </View>
                <Text className="text-sm text-blue-800">"{searchMetadata.semantic}"</Text>
              </View>
            </View>
          </View>
        )}

        {/* Results */}
        {hasSearched && (
          <View>
            {results.length > 0 ? (
              <>
                <Text className="text-gray-700 font-semibold mb-4">
                  {lastQuery ? `Results for "${lastQuery}" · ` : ""}
                  Found {results.length} {results.length === 1 ? "memory" : "memories"}
                </Text>

                {results.map((result) => (
                  <Pressable
                    key={result.id}
                    onPress={() => router.push(`/memory/${result.id}` as any)}
                    className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm"
                    android_ripple={{ color: "#F3F4F6" }}
                    style={({ pressed }) => [
                      { transform: [{ scale: pressed ? 0.99 : 1 }] },
                      { opacity: pressed ? 0.95 : 1 },
                    ]}
                    accessibilityRole="button"
                  >
                    {/* Header: Match Quality + Date */}
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="flex-row items-center">
                        <View
                          className={`w-2 h-2 rounded-full mr-2 ${getSimilarityColor(
                            result.similarity
                          )}`}
                        />
                        <Text className="text-xs text-gray-600">
                          {getSimilarityLabel(result.similarity)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-500">
                          {formatDate(result.created_at)}
                        </Text>
                        <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
                      </View>
                    </View>

                    {/* Summary */}
                    <Text className="text-gray-900 font-medium text-base mb-3 leading-6">
                      {result.summary || result.raw_text}
                    </Text>

                    {/* Tags */}
                    <View className="flex-row flex-wrap gap-2">
                      {result.context && (
                        <View className="bg-blue-50 px-3 py-1 rounded-full">
                          <Text className="text-xs text-blue-700 font-medium">{result.context}</Text>
                        </View>
                      )}
                      {result.mood && (
                        <View className="bg-purple-50 px-3 py-1 rounded-full">
                          <Text className="text-xs text-purple-700 font-medium">{result.mood}</Text>
                        </View>
                      )}
                      {result.match_type === "temporal_semantic" && (
                        <View className="bg-green-50 px-3 py-1 rounded-full">
                          <Text className="text-xs text-green-700 font-medium">📅 Date Match</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </>
            ) : loading ? null : (
              <View className="bg-gray-50 border border-gray-200 rounded-3xl items-center justify-center py-12 px-6">
                <FontAwesome name="search" size={40} color="#9CA3AF" />
                <Text className="text-gray-600 text-lg font-medium mt-4 text-center">
                  No memories found
                </Text>
                <Text className="text-gray-500 text-sm mt-2 text-center">
                  Try a different search or check your spelling
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Empty State */}
        {!hasSearched && !loading && (
          <View className="bg-[#FDFDFD] border border-gray-100 rounded-3xl items-center justify-center py-16 px-6">
            <FontAwesome name="book" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg font-caveat mt-4">
              Your memories will appear here
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              Search for moments, feelings, or conversations
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
