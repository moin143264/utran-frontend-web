import { Platform, NativeModules } from "react-native";

// Your machine's local IP address when running the backend
const LOCAL_IP = "192.168.86.134"; // Replace this with your actual local IP address

// Helper to detect if running on a physical device
const isPhysicalDevice = async () => {
  if (Platform.OS === "android") {
    return !NativeModules.PlatformConstants?.isEmulator;
  }
  return !NativeModules.RNDeviceInfo?.isEmulator;
};

// API Configuration
let apiBaseUrl;
let socketUrl;

if (Platform.OS === "android") {
  // Android: Use 10.0.2.2 for emulator, LOCAL_IP for physical device
  apiBaseUrl = !isPhysicalDevice()
    ? "http://10.0.2.2:5000/api"
    : `http://${LOCAL_IP}:5000/api`;
  socketUrl = !isPhysicalDevice()
    ? "http://10.0.2.2:5000"
    : `http://${LOCAL_IP}:5000`;
} else {
  // iOS simulator can use localhost, physical device needs local IP
  apiBaseUrl = __DEV__
    ? "http://localhost:5000/api"
    : `http://${LOCAL_IP}:5000/api`;
  socketUrl = __DEV__ ? "http://localhost:5000" : `http://${LOCAL_IP}:5000`;
}

export const API_URL = apiBaseUrl;
export const SOCKET_URL = socketUrl;

// Other configuration constants
export const DEFAULT_TIMEOUT = 10000; // 10 seconds
export const MAX_RETRIES = 3;
