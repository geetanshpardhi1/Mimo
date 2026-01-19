import { validateEmail } from "@/lib/validation";
import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const onSendResetCode = async () => {
    if (!isLoaded) return;

    // Clear previous errors
    setEmailError("");

    // Validate email
    const emailValidation = validateEmail(emailAddress);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || "");
      return;
    }

    setLoading(true);
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress.trim(),
      });

      setPendingVerification(true);
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Failed to send reset code. Please try again.";

      Alert.alert("Reset Failed", errorMessage);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
    if (!isLoaded) return;

    setVerifyLoading(true);
    try {
      await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      Alert.alert(
        "Password Reset Successful",
        "Your password has been reset successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/save"),
          },
        ],
      );
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Failed to reset password. Please try again.";

      Alert.alert("Reset Failed", errorMessage);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setVerifyLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!isLoaded) return;

    setResendLoading(true);
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress.trim(),
      });

      Alert.alert(
        "Code Resent",
        "A new reset code has been sent to your email.",
      );
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Failed to resend code. Please try again.";

      Alert.alert("Resend Failed", errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-8 flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
            <Text className="text-[#2D2D2D] ml-2 font-semibold">Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-10 px-4">
            <Text
              className="text-[42px] font-caveat text-[#2D2D2D] mb-2 text-center px-4"
              style={{ lineHeight: 50 }}
            >
              {pendingVerification ? "Reset Password" : "Forgot Password?"}
            </Text>
            <Text className="text-[#8D7F7D] text-base font-medium text-center px-4">
              {pendingVerification
                ? "Enter the code we sent to your email."
                : "Enter your email to receive a reset code."}
            </Text>
          </View>

          {!pendingVerification ? (
            <>
              {/* Email Input */}
              <View className="mb-8">
                <Text className="text-[#2D2D2D] font-semibold mb-2 ml-1">
                  Email Address
                </Text>
                <TextInput
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="hello@example.com"
                  onChangeText={(text) => {
                    setEmailAddress(text);
                    setEmailError("");
                  }}
                  placeholderTextColor="#A0A0A0"
                  className={`w-full bg-white border ${emailError ? "border-red-500" : "border-[#E5E0D8]"} rounded-2xl px-5 h-14 text-base text-[#2D2D2D]`}
                  style={{ lineHeight: 0 }}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                />
                {emailError ? (
                  <Text className="text-red-500 text-sm mt-1 ml-1">
                    {emailError}
                  </Text>
                ) : null}
              </View>

              {/* Send Code Button */}
              <TouchableOpacity
                onPress={onSendResetCode}
                disabled={!emailAddress || loading}
                className={`w-full py-4 rounded-full mb-auto items-center justify-center shadow-sm ${
                  !emailAddress || loading
                    ? "bg-[#DCCBC4] shadow-none"
                    : "bg-[#8B6D5C] shadow-orange-100"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Send Reset Code
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Verification Code */}
              <View className="mb-5">
                <Text className="text-[#2D2D2D] font-semibold mb-2 ml-1">
                  Verification Code
                </Text>
                <TextInput
                  value={code}
                  placeholder="123456"
                  onChangeText={setCode}
                  placeholderTextColor="#A0A0A0"
                  className="w-full bg-white border border-[#E5E0D8] rounded-2xl px-5 h-14 text-base text-[#2D2D2D] tracking-widest"
                  keyboardType="number-pad"
                  style={{ lineHeight: 0 }}
                />
              </View>

              {/* New Password */}
              <View className="mb-8">
                <Text className="text-[#2D2D2D] font-semibold mb-2 ml-1">
                  New Password
                </Text>
                <View className="w-full bg-white border border-[#E5E0D8] rounded-2xl px-5 h-14 flex-row items-center">
                  <TextInput
                    value={newPassword}
                    placeholder="Enter new password"
                    secureTextEntry={!showPassword}
                    onChangeText={setNewPassword}
                    placeholderTextColor="#A0A0A0"
                    className="flex-1 h-full text-base text-[#2D2D2D] mr-2"
                    style={{ lineHeight: 0 }}
                    textContentType="newPassword"
                    autoComplete="password-new"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#8D7F7D"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reset Password Button */}
              <TouchableOpacity
                onPress={onResetPassword}
                disabled={!code || !newPassword || verifyLoading}
                className={`w-full py-4 rounded-full mb-4 items-center justify-center shadow-sm ${
                  !code || !newPassword || verifyLoading
                    ? "bg-[#DCCBC4] shadow-none"
                    : "bg-[#8B6D5C] shadow-orange-100"
                }`}
              >
                {verifyLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Reset Password
                  </Text>
                )}
              </TouchableOpacity>

              {/* Resend Code */}
              <TouchableOpacity
                onPress={onResendCode}
                disabled={resendLoading}
                className="items-center mb-3"
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color="#8B6D5C" />
                ) : (
                  <Text className="text-[#8B6D5C] font-semibold">
                    Resend Code
                  </Text>
                )}
              </TouchableOpacity>

              {/* Back to Edit Email */}
              <TouchableOpacity
                onPress={() => setPendingVerification(false)}
                className="items-center mb-auto"
              >
                <Text className="text-[#8D7F7D]">Change Email</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
