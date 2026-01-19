import { validateEmail } from "@/lib/validation";
import { useAuth, useSignUp, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
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

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Check if user is already signed in and redirect
  React.useEffect(() => {
    if (isSignedIn) {
      router.replace("/(tabs)/save");
    }
  }, [isSignedIn]);

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [verifyLoading, setVerifyLoading] = React.useState(false);
  const [resendLoading, setResendLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Check if already signed in
    if (isSignedIn) {
      Alert.alert(
        "Already Signed In",
        "You are already signed in. Redirecting to app...",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/save"),
          },
        ],
      );
      return;
    }

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
      await signUp.create({
        emailAddress: emailAddress.trim(),
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Failed to sign up. Please try again.";

      Alert.alert("Sign Up Failed", errorMessage);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    setVerifyLoading(true);
    try {
      // Check if signUp object is still valid
      if (!signUp || !signUp.attemptEmailAddressVerification) {
        Alert.alert(
          "Session Expired",
          "Your signup session has expired. Please start over.",
          [
            {
              text: "OK",
              onPress: () => {
                setPendingVerification(false);
                setCode("");
              },
            },
          ],
        );
        setVerifyLoading(false);
        return;
      }

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/(tabs)/save");
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
        Alert.alert(
          "Verification Incomplete",
          "Please check your verification code and try again.",
        );
      }
    } catch (err: any) {
      console.error("Verification error:", JSON.stringify(err, null, 2));

      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Invalid verification code. Please try again.";

      // Check if it's a "no signup attempt" error
      if (errorMessage.toLowerCase().includes("no sign up attempt")) {
        Alert.alert(
          "Session Expired",
          "Your signup session has expired. Please sign up again.",
          [
            {
              text: "OK",
              onPress: () => {
                setPendingVerification(false);
                setCode("");
                setEmailAddress("");
                setPassword("");
              },
            },
          ],
        );
      } else {
        Alert.alert("Verification Failed", errorMessage);
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!isLoaded) return;

    setResendLoading(true);
    try {
      // Check if signUp object is still valid
      if (!signUp || !signUp.prepareEmailAddressVerification) {
        Alert.alert(
          "Session Expired",
          "Your verification session expired. Please try signing up again.",
          [
            {
              text: "OK",
              onPress: () => {
                setPendingVerification(false);
                setCode("");
              },
            },
          ],
        );
        setResendLoading(false);
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert(
        "Code Resent",
        "A new verification code has been sent to your email.",
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
        // Use signIn or signUp for next steps such as MFA
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
              {pendingVerification ? "Verify Email" : "Create Account"}
            </Text>
            <Text className="text-[#8D7F7D] text-base font-medium text-center px-4">
              {pendingVerification
                ? "We sent a code to your email."
                : "Begin your memory keeping journey."}
            </Text>
          </View>

          {!pendingVerification ? (
            <>
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

              {/* Password */}
              <View className="mb-8">
                <Text className="text-[#2D2D2D] font-semibold mb-2 ml-1">
                  Password
                </Text>
                <View className="w-full bg-white border border-[#E5E0D8] rounded-2xl px-5 h-14 flex-row items-center">
                  <TextInput
                    value={password}
                    placeholder="Create password"
                    secureTextEntry={!showPassword}
                    onChangeText={setPassword}
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

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={onSignUpPress}
                disabled={!emailAddress || !password || loading}
                className={`w-full py-4 rounded-full mb-8 items-center justify-center shadow-sm ${
                  !emailAddress || !password || loading
                    ? "bg-[#DCCBC4] shadow-none"
                    : "bg-[#8B6D5C] shadow-orange-100"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">Sign Up</Text>
                )}
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
                <Text className="text-[#8D7F7D]">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/auth/sign-in")}
                >
                  <Text className="text-[#8B6D5C] font-bold">Sign In</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Verification Input */}
              <View className="mb-8">
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

              <TouchableOpacity
                onPress={onPressVerify}
                disabled={!code || verifyLoading}
                className={`w-full py-4 rounded-full mb-4 items-center justify-center shadow-sm ${
                  !code || verifyLoading
                    ? "bg-[#DCCBC4] shadow-none"
                    : "bg-[#8B6D5C] shadow-orange-100"
                }`}
              >
                {verifyLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Verify Email
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
                className="items-center"
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
