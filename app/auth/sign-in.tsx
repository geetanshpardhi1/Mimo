import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isFromOnboarding = params.from === "onboarding";

  console.log("SignIn Params:", params);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      // This indicates the user is signed in.
      await setActive({ session: completeSignIn.createdSessionId });
      // Navigation is handled by the useEffect in index.tsx or we can push directly
      router.replace("/(tabs)/save");
    } catch (err: any) {
      // Use friendly error message
      Alert.alert(
        "Sign In Failed",
        err.errors[0]?.longMessage ||
          err.errors[0]?.message ||
          "Please check your credentials."
      );
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onGooglePress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("/(tabs)/save", { scheme: "mimo" }),
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.replace("/(tabs)/save");
      } else {
        // Handle next steps
      }
    } catch (err) {
      console.error("SSO error", err);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          {/* Header */}
          <View className="items-center mb-10 mt-12 px-4">
            <Text
              className="text-[42px] font-caveat text-[#2D2D2D] mb-2 text-center px-4"
              style={{ lineHeight: 50 }}
            >
              {isFromOnboarding ? "Welcome to Mimo" : "Welcome back"}
            </Text>
            <Text className="text-[#8D7F7D] text-base font-medium text-center px-4">
              Continue your journey with us.
            </Text>
          </View>

          {/* Inputs */}
          {/* Email */}
          <View className="mb-5">
            <Text className="text-[#2D2D2D] font-semibold mb-2 ml-1">
              Email Address
            </Text>
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="hello@example.com"
              onChangeText={setEmailAddress}
              placeholderTextColor="#A0A0A0"
              className="w-full bg-white border border-[#E5E0D8] rounded-2xl px-5 h-14 text-base text-[#2D2D2D]"
              style={{ lineHeight: 0 }}
              // Autofill props
              textContentType="emailAddress"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Password */}
          <View className="mb-2">
            <Text className="text-[#2D2D2D] font-semibold mb-2 ml-1">
              Password
            </Text>
            <View className="w-full bg-white border border-[#E5E0D8] rounded-2xl px-5 h-14 flex-row items-center">
              <TextInput
                value={password}
                placeholder="Your password"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                placeholderTextColor="#A0A0A0"
                className="flex-1 h-full text-base text-[#2D2D2D] mr-2"
                style={{ lineHeight: 0 }}
                // Autofill props
                textContentType="password"
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#8D7F7D"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="self-end mb-10">
            <Text className="text-[#8B6D5C] font-semibold">
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={onSignInPress}
            disabled={!emailAddress || !password}
            className={`w-full py-4 rounded-full mb-8 items-center justify-center shadow-sm ${
              !emailAddress || !password
                ? "bg-[#DCCBC4] shadow-none"
                : "bg-[#8B6D5C] shadow-orange-100"
            }`}
          >
            <Text className="text-white text-lg font-bold">Sign In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-8 px-4">
            <View className="flex-1 h-[1px] bg-[#E5E0D8]" />
            <Text className="mx-4 text-[#8D7F7D] font-semibold text-xs tracking-widest">
              OR
            </Text>
            <View className="flex-1 h-[1px] bg-[#E5E0D8]" />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            onPress={onGooglePress}
            className="w-full bg-white border border-[#E5E0D8] py-4 rounded-full flex-row items-center justify-center mb-auto shadow-sm shadow-gray-100"
          >
            <Image
              source={{
                uri: "https://img.icons8.com/color/48/google-logo.png",
              }}
              style={{ width: 24, height: 24, marginRight: 10 }}
            />
            <Text className="text-[#2D2D2D] text-lg font-bold">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="flex-row justify-center mt-8 pb-4">
            <Text className="text-[#8D7F7D]">New to Mimo? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/sign-up")}>
              <Text className="text-[#8B6D5C] font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
