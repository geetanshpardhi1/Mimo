import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="one" />
      <Stack.Screen name="two" />
      <Stack.Screen name="three" />
    </Stack>
  );
}
