import { storage } from "@/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

export default function OnboardingThree() {
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

  const handleFinish = async () => {
    await storage.setOnboardingCompleted();
    router.replace("/auth/sign-in?from=onboarding");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <View className="flex-1 px-6 pt-4 justify-between">
        {/* Top Section */}
        <View>
          {/* Header */}
          <View className="flex-row justify-end items-center h-10 mb-6">
            <View className="flex-row gap-2">
              <View className="w-8 h-1 bg-[#E5E0D8] rounded-full" />
              <View className="w-8 h-1 bg-[#E5E0D8] rounded-full" />
              <View className="w-8 h-1 bg-[#8B6D5C] rounded-full" />
            </View>
          </View>

          {/* Animated Content */}
          <Animated.View
            key={key}
            entering={FadeInDown.duration(600).springify()}
            exiting={FadeOutDown.duration(600).springify()}
          >
            {/* Content */}
            <View className="items-center mt-4">
              <Text className="text-[40px] font-caveat italic text-[#5D4037] text-center leading-tight mb-4">
                Mimo remembers{"\n"}for you.
              </Text>
              <Text className="text-xl text-center text-[#8D7F7D] px-4 leading-relaxed">
                From quick thoughts to cherished moments, Mimo organizes your
                world.
              </Text>
            </View>

            {/* Illustration Area */}
            <View className="h-80 items-center justify-center opacity-90 my-2">
              <View className="w-full h-64 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <View className="flex-row items-center gap-4 mb-4">
                  <View className="w-12 h-12 bg-[#F5F0EB] rounded-full items-center justify-center">
                    <Ionicons name="sparkles" size={24} color="#8B6D5C" />
                  </View>
                  <View className="h-4 w-32 bg-[#F5F0EB] rounded-full" />
                </View>
                <View className="h-4 w-full bg-[#FAFAFA] rounded-full mb-3" />
                <View className="h-4 w-5/6 bg-[#FAFAFA] rounded-full mb-3" />
                <View className="absolute bottom-6 right-6 px-4 py-2 bg-[#F5F0EB] rounded-full">
                  <Text className="text-[#8B6D5C] text-xs font-bold tracking-widest">
                    FOUND NOW
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-xs text-center text-[#9E9E9E] italic px-8">
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
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
            onPress={handleFinish}
            className="bg-[#8B6D5C] px-8 py-3 rounded-full flex-row items-center gap-2 shadow-sm"
            style={{
              shadowColor: "#8B6D5C",
              shadowOpacity: 0.3,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text className="text-white text-lg font-bold">Get Started</Text>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
