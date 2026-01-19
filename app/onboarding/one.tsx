import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

export default function OnboardingOne() {
  const router = useRouter();
  const [key, setKey] = useState(0);
  const isFirstMount = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }
      setKey((prev) => prev + 1);
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <View className="flex-1 px-6 pt-4 justify-between">
        {/* Top Section */}
        <View>
          {/* Header */}
          <View className="flex-row justify-end items-center h-10 mb-6">
            <View className="flex-row gap-2">
              <View className="w-8 h-1 bg-[#8B6D5C] rounded-full" />
              <View className="w-8 h-1 bg-[#E5E0D8] rounded-full" />
              <View className="w-8 h-1 bg-[#E5E0D8] rounded-full" />
            </View>
          </View>

          {/* Animated Content */}
          <Animated.View
            key={key}
            entering={FadeInDown.duration(600).springify()}
            exiting={FadeOutDown.duration(600).springify()}
          >
            {/* Content */}
            <View className="mt-4">
              <Text className="text-[42px] font-caveat italic text-[#5D4037] leading-tight mb-6">
                You save a lot.
              </Text>
              <Text className="text-xl text-[#8D7F7D] leading-relaxed">
                Quotes, screenshots,{"\n"}links, thoughts...
              </Text>
            </View>

            {/* Illustration Area */}
            <View className="h-80 items-center justify-center opacity-90 my-4">
              <View className="relative w-64 h-64 justify-center items-center">
                {/* Back Card (Vertical) */}
                <View
                  className="absolute top-0 w-40 h-52 bg-white rounded-3xl border border-white shadow-sm"
                  style={{
                    transform: [{ rotate: "-6deg" }, { translateY: -10 }],
                    shadowColor: "#EAEAEA",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 10,
                  }}
                >
                  {/* Card Content Placeholder lines */}
                  <View className="mt-8 ml-4 h-2 w-24 bg-[#F5F5F5] rounded-full" />
                  <View className="mt-3 ml-4 h-2 w-16 bg-[#F5F5F5] rounded-full" />
                </View>

                {/* Middle Card (Angled) */}
                <View
                  className="absolute top-4 right-8 w-40 h-52 bg-white rounded-3xl border border-white shadow-sm"
                  style={{
                    transform: [{ rotate: "8deg" }],
                    shadowColor: "#EAEAEA",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 10,
                  }}
                />

                {/* Front Card (Horizontal) */}
                <View
                  className="absolute bottom-4 w-52 h-32 bg-white rounded-3xl border border-white shadow-sm flex-col justify-center px-6 gap-3"
                  style={{
                    shadowColor: "#EAEAEA",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 15,
                  }}
                >
                  <View className="h-2.5 w-full bg-[#F5F5F5] rounded-full" />
                  <View className="h-2.5 w-3/4 bg-[#F5F5F5] rounded-full" />
                </View>
              </View>
            </View>

            <Text className="text-xl text-[#6D5D5D] leading-relaxed mt-4">
              But later you forget where{"\n"}you saved them.
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Buttons */}
        <View className="flex-row justify-between items-center mb-6 h-14">
          {/* Invisible Back Button for Layout Consistency */}
          <View className="px-6 py-3 opacity-0 flex-row items-center gap-2">
            <Ionicons name="arrow-back" size={20} color="transparent" />
            <Text className="text-transparent text-lg font-semibold">Back</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/onboarding/two")}
            className="bg-[#8B6D5C] px-8 py-3 rounded-full flex-row items-center gap-2"
          >
            <Text className="text-white text-lg font-semibold">Next</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
