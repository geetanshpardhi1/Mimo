import { Memory, useMemoryApi } from "@/lib/api/memories";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MemoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const api = useMemoryApi();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [saving, setSaving] = useState(false);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMemory() {
      if (!id) return;
      try {
        const data = await api.getById(id);
        setMemory(data);
        setEditedText(data.raw_text);
      } catch (err) {
        console.error("Failed to fetch memory:", err);
        setError("Failed to load memory");
      } finally {
        setLoading(false);
      }
    }

    fetchMemory();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Memory",
      "Are you sure you want to delete this memory? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (id) await api.delete(id);
              router.back();
            } catch (err) {
              Alert.alert("Error", "Failed to delete memory");
            }
          },
        },
      ],
    );
  };

  const handleSaveEdit = async () => {
    if (!editedText.trim()) {
      Alert.alert("Error", "Memory cannot be empty");
      return;
    }

    setSaving(true);
    try {
      if (!id) return;
      const updated = await api.update(id, { raw_text: editedText });
      setMemory(updated);
      setIsEditing(false);
      Alert.alert("Success", "Memory updated");

      // Trigger AI re-processing to update summary and embedding
      api.processWithAI(id, editedText);
    } catch (err) {
      Alert.alert("Error", "Failed to update memory");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9F9F9] justify-center items-center">
        <Text className="text-gray-500">Loading memory...</Text>
      </SafeAreaView>
    );
  }

  if (error || !memory) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9F9F9] justify-center items-center px-6">
        <Text className="text-red-500 text-center mb-4">
          {error || "Memory not found"}
        </Text>
        <TouchableOpacity
          onPress={router.back}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          <Text className="text-gray-700">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Format date
  const dateObj = new Date(memory.created_at);
  const dateStr = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });
  const formattedDate = `${dateStr} • ${timeStr}`;

  // Derive tags from context/mood if available
  const tags = [];
  if (memory.mood) tags.push(memory.mood);
  if (memory.context) tags.push(memory.context);

  return (
    <SafeAreaView
      className="flex-1 bg-[#F9F9F9]"
      edges={["bottom", "left", "right"]}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="flex-grow px-6 pb-12 pt-6">
        {/* Date & Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[#6B7280] text-sm font-medium">
            {formattedDate}
          </Text>
          {isEditing && (
            <Text className="text-[#5C4033] text-xs font-bold uppercase tracking-wider">
              Editing Mode
            </Text>
          )}
        </View>

        {/* Tags */}
        {!isEditing && tags.length > 0 && (
          <View className="flex-row gap-2 mb-8 flex-wrap">
            {tags.map((tag, index) => (
              <View
                key={index}
                className="bg-[#F3F4F6] rounded-full px-4 py-1.5"
              >
                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wide">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Main Content (View or Edit) */}
        {isEditing ? (
          <TextInput
            className="text-[#1F2937] text-xl leading-8 mb-10 bg-white p-4 rounded-xl border border-gray-200"
            style={{
              fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
              minHeight: 200,
            }}
            multiline
            value={editedText}
            onChangeText={setEditedText}
            textAlignVertical="top"
          />
        ) : (
          <Text
            className="text-[#1F2937] text-xl leading-8 mb-10"
            style={{
              fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
            }}
          >
            {memory.raw_text}
          </Text>
        )}

        {/* Read-only Summary (Hidden while editing to focus) */}
        {!isEditing && memory.summary && (
          <View className="bg-[#F9F9F9] rounded-2xl p-6 mb-12 border border-gray-100 shadow-sm">
            <Text className="font-caveat text-2xl text-[#5C4033] mb-3">
              Mimo's summary
            </Text>
            <Text className="text-[#4B5563] text-base leading-6 italic">
              {memory.summary}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row justify-center gap-12 mb-6">
          {!isEditing ? (
            <>
              <TouchableOpacity
                className="items-center gap-2"
                onPress={() => {
                  setEditedText(memory.raw_text);
                  setIsEditing(true);
                }}
              >
                <FontAwesome name="pencil-square-o" size={24} color="#9CA3AF" />
                <Text className="text-[#9CA3AF] text-xs font-bold tracking-widest uppercase">
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center gap-2"
                onPress={handleDelete}
              >
                <FontAwesome name="trash-o" size={24} color="#9CA3AF" />
                <Text className="text-[#9CA3AF] text-xs font-bold tracking-widest uppercase">
                  Delete
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="flex-row gap-6 w-full justify-center">
              <TouchableOpacity
                className="bg-gray-200 px-6 py-3 rounded-full"
                onPress={() => {
                  setIsEditing(false);
                  setEditedText(memory.raw_text);
                }}
                disabled={saving}
              >
                <Text className="text-gray-600 font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-[#5C4033] px-8 py-3 rounded-full"
                onPress={handleSaveEdit}
                disabled={saving}
              >
                <Text className="text-white font-semibold">
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
