import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function MemoryDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Memory Detail</Text>
      <Text className="text-lg text-gray-600">ID: {id}</Text>
    </View>
  );
}
