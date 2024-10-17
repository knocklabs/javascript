declare module "react-native-config" {
  export interface NativeConfig {
    KNOCK_PUBLIC_API_KEY: string;
    KNOCK_FEED_CHANNEL_ID: string;
    KNOCK_USER_ID: string;
    KNOCK_HOST?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
