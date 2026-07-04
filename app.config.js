const googleIosUrlScheme =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ||
  "com.googleusercontent.apps.your-reversed-ios-client-id";

module.exports = ({ config }) => ({
  ...config,
  plugins: (config.plugins || []).map((plugin) => {
    if (
      Array.isArray(plugin) &&
      plugin[0] === "@react-native-google-signin/google-signin"
    ) {
      return [
        "@react-native-google-signin/google-signin",
        { iosUrlScheme: googleIosUrlScheme },
      ];
    }

    return plugin;
  }),
});
