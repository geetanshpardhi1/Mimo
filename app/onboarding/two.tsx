import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

export default function OnboardingTwo() {
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
              <View className="w-8 h-1 bg-[#E5E0D8] rounded-full" />
              <View className="w-8 h-1 bg-[#8B6D5C] rounded-full" />
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
              <Text className="text-[40px] font-caveat italic text-[#5D4037] leading-tight mb-6">
                You remember moments, not folders.
              </Text>
              <Text className="text-xl text-[#8D7F7D] leading-relaxed">
                Like: I read something about discipline at the gym...
              </Text>
            </View>

            {/* Illustration Area */}
            <View className="h-80 items-center justify-center my-4">
              <View className="relative w-64 h-64 justify-center items-center">
                {/* Large Background Circle (Abstract User/Shape) */}
                <View className="absolute bottom-0 w-48 h-56 bg-[#EDE7E3] rounded-t-full rounded-b-lg opacity-80" />

                {/* Head/Middle Circle */}
                <View className="absolute top-8 w-32 h-32 bg-[#EDE7E3] rounded-full opacity-90 border-4 border-[#FDFBF7]" />

                {/* Left Icon Circle (Barbell) */}
                <View
                  className="absolute top-0 left-[-20px] w-28 h-28 bg-white rounded-full items-center justify-center shadow-sm"
                  style={{
                    shadowColor: "#EAEAEA",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 10,
                  }}
                >
                  <Ionicons
                    name="barbell-outline"
                    size={32}
                    color="#8B6D5C"
                    style={{ transform: [{ rotate: "-45deg" }] }}
                  />
                </View>

                {/* Right Icon Circle (Book) */}
                <View
                  className="absolute top-12 right-[-30px] w-24 h-24 bg-white rounded-full items-center justify-center shadow-sm"
                  style={{
                    shadowColor: "#EAEAEA",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 10,
                  }}
                >
                  <Ionicons name="book-outline" size={28} color="#D7CCC8" />
                </View>

                {/* Small Decorative Dots */}
                <View className="absolute top-10 right-10 w-3 h-3 bg-[#E5E0D8] rounded-full" />
                <View className="absolute bottom-16 left-[-10px] w-6 h-6 bg-[#F5F0EB] rounded-full" />

                {/* Bottom Right Floating Icon (Bulb) */}
                <View
                  className="absolute bottom-20 right-[-10px] w-20 h-20 bg-white rounded-full items-center justify-center shadow-sm"
                  style={{
                    shadowColor: "#EAEAEA",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 10,
                  }}
                >
                  <Ionicons name="bulb-outline" size={24} color="#8B6D5C" />
                </View>

                {/* Dotted Line Connection (Subtle) */}
                <View className="absolute w-40 h-40 border border-dashed border-[#E5E0D8] rounded-full opacity-50 pointer-events-none" />
              </View>
            </View>

            <Text className="text-sm text-center text-[#9E9E9E] italic mt-4 px-8">
              Memory works in associations, not in nested file systems.
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Buttons */}
        <View className="flex-row justify-between items-center mb-6 h-14">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-[#DCCBC4] px-6 py-3 rounded-full flex-row items-center gap-2"
          >
            <Ionicons name="arrow-back" size={20} color="#5D4037" />
            <Text className="text-[#5D4037] text-lg font-semibold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/onboarding/three")}
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
