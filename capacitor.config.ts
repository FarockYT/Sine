import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.neuroquest.remindblocks",
  appName: "ReMind Blocks",
  webDir: "dist",
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#1f7a5c",
      sound: "beep.wav"
    }
  }
};

export default config;
