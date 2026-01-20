import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="save">
        <Label>Save</Label>
        <Icon sf="plus.circle" drawable="ic_input_add" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="recall">
        <Label>Recall</Label>
        <Icon sf="arrow.clockwise" drawable="ic_menu_rotate" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="memories">
        <Label>Memories</Label>
        <Icon sf="photo.on.rectangle" drawable="ic_menu_gallery" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account" role="search">
        <Label>Account</Label>
        <Icon sf="person.circle" drawable="ic_menu_myplaces" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
