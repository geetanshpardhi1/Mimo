import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

export default function ManageAccountScreen() {
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setUsername(user.username ?? "");
  }, [isLoaded, user]);

  const isProfileDirty =
    firstName.trim() !== (user?.firstName ?? "") ||
    lastName.trim() !== (user?.lastName ?? "") ||
    username.trim() !== (user?.username ?? "");

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        username: username.trim() || undefined,
      });
      await user.reload();
      Alert.alert("Profile updated", "Your changes have been saved.");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Update failed", "Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePhoto = async () => {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to update your profile.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setUploadingPhoto(true);
    try {
      const name = asset.fileName ?? asset.uri.split("/").pop() ?? "profile.jpg";
      const type = asset.mimeType ?? "image/jpeg";
      await user.setProfileImage({
        file: {
          uri: asset.uri,
          name,
          type,
        } as any,
      });
      await user.reload();
    } catch (error) {
      console.error("Error updating profile image:", error);
      Alert.alert("Update failed", "Unable to update your photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleMakePrimary = async (emailId: string) => {
    if (!user) return;
    try {
      await user.update({ primaryEmailAddressId: emailId });
      await user.reload();
    } catch (error) {
      console.error("Error setting primary email:", error);
      Alert.alert("Update failed", "Could not set primary email.");
    }
  };

  const handleDeleteEmail = (emailAddress: any) => {
    Alert.alert(
      "Remove email",
      "Are you sure you want to remove this email address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await emailAddress.destroy();
              await user?.reload();
            } catch (error) {
              console.error("Error removing email:", error);
              Alert.alert("Remove failed", "Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (!newPassword.trim() || newPassword.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await user.updatePassword({
        currentPassword: currentPassword.trim() || undefined,
        newPassword: newPassword.trim(),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Password updated", "Your password has been changed.");
    } catch (error) {
      console.error("Error updating password:", error);
      Alert.alert("Update failed", "Please check your current password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const emailAddresses = user?.emailAddresses ?? [];
  const primaryEmailId = user?.primaryEmailAddressId;

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]" edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerClassName="px-6 pt-0 pb-8">
        {/* Profile */}
        <View className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm shadow-gray-200 mb-6">
          <Text className="text-xs text-[#6B7280] font-semibold tracking-widest uppercase mb-4">
            Profile
          </Text>
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-sm">
              <Image source={{ uri: user?.imageUrl }} className="w-full h-full" />
            </View>
            <TouchableOpacity
              onPress={handleChangePhoto}
              disabled={!isLoaded || uploadingPhoto}
              className={`mt-4 rounded-full px-5 py-2.5 flex-row items-center ${
                !isLoaded || uploadingPhoto ? "bg-gray-300" : "bg-[#5C4033]"
              }`}
            >
              <FontAwesome name="camera" size={14} color="white" />
              <Text className="text-white text-sm font-semibold ml-2">
                {uploadingPhoto ? "Updating..." : "Change Photo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Manage Profile */}
        <View className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm shadow-gray-200 mb-6">
          <Text className="text-xs text-[#6B7280] font-semibold tracking-widest uppercase mb-4">
            Manage Profile
          </Text>
          <View className="bg-[#F3F4F6] rounded-2xl px-4 py-3 mb-3">
            <Text className="text-xs text-[#6B7280] mb-1">First name</Text>
            <TextInput
              className="text-base text-gray-900 font-medium"
              value={firstName}
              onChangeText={setFirstName}
              editable={!savingProfile}
              placeholder="First name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className="bg-[#F3F4F6] rounded-2xl px-4 py-3 mb-3">
            <Text className="text-xs text-[#6B7280] mb-1">Last name</Text>
            <TextInput
              className="text-base text-gray-900 font-medium"
              value={lastName}
              onChangeText={setLastName}
              editable={!savingProfile}
              placeholder="Last name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className="bg-[#F3F4F6] rounded-2xl px-4 py-3 mb-4">
            <Text className="text-xs text-[#6B7280] mb-1">Username</Text>
            <TextInput
              className="text-base text-gray-900 font-medium"
              value={username}
              onChangeText={setUsername}
              editable={!savingProfile}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={!isLoaded || savingProfile || !isProfileDirty}
            className={`rounded-full py-4 px-8 items-center ${
              !isLoaded || savingProfile || !isProfileDirty ? "bg-gray-300" : "bg-[#5C4033]"
            }`}
          >
            <Text className="text-white text-lg font-semibold">
              {savingProfile ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email Addresses */}
        <View className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm shadow-gray-200 mb-6">
          <Text className="text-xs text-[#6B7280] font-semibold tracking-widest uppercase mb-4">
            Email Addresses
          </Text>
          {emailAddresses.map((email) => {
            const isPrimary = email.id === primaryEmailId;
            const isVerified = email?.verification?.status === "verified";
            return (
              <View key={email.id} className="bg-[#F3F4F6] rounded-2xl px-4 py-3 mb-3">
                <Text className="text-base text-gray-900 font-medium">
                  {email.emailAddress}
                </Text>
                <View className="flex-row items-center mt-2">
                  {isPrimary && (
                    <View className="bg-white rounded-full px-3 py-1 mr-2">
                      <Text className="text-xs text-[#6B7280] font-semibold">Primary</Text>
                    </View>
                  )}
                  <View className="bg-white rounded-full px-3 py-1 mr-2">
                    <Text className="text-xs text-[#6B7280] font-semibold">
                      {isVerified ? "Verified" : "Unverified"}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center mt-3">
                  {!isPrimary && isVerified ? (
                    <TouchableOpacity
                      onPress={() => handleMakePrimary(email.id)}
                      className="bg-[#5C4033] rounded-full px-4 py-2 mr-2"
                    >
                      <Text className="text-white text-sm font-semibold">Make Primary</Text>
                    </TouchableOpacity>
                  ) : null}
                  {!isPrimary ? (
                    <TouchableOpacity
                      onPress={() => handleDeleteEmail(email)}
                      className="bg-[#FEF2F2] rounded-full px-4 py-2"
                    >
                      <Text className="text-red-500 text-sm font-semibold">Remove</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        {/* Security */}
        <View className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm shadow-gray-200 mb-6">
          <Text className="text-xs text-[#6B7280] font-semibold tracking-widest uppercase mb-4">
            Security
          </Text>
          <View className="bg-[#F3F4F6] rounded-2xl px-4 py-3 mb-3">
            <Text className="text-xs text-[#6B7280] mb-1">Current password</Text>
            <TextInput
              className="text-base text-gray-900 font-medium"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>
          <View className="bg-[#F3F4F6] rounded-2xl px-4 py-3 mb-3">
            <Text className="text-xs text-[#6B7280] mb-1">New password</Text>
            <TextInput
              className="text-base text-gray-900 font-medium"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>
          <View className="bg-[#F3F4F6] rounded-2xl px-4 py-3 mb-2">
            <Text className="text-xs text-[#6B7280] mb-1">Confirm new password</Text>
            <TextInput
              className="text-base text-gray-900 font-medium"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={savingPassword}
            className={`rounded-full py-4 items-center ${
              savingPassword ? "bg-gray-300" : "bg-[#5C4033]"
            }`}
          >
            <Text className="text-white text-lg font-semibold">
              {savingPassword ? "Updating..." : "Update Password"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
