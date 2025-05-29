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

// Use the hosted backend URL
const HOSTED_API_URL = "https://utran.vercel.app/api";
// Ensure socket URL doesn't have trailing slashes
const HOSTED_SOCKET_URL = "https://utran.vercel.app";

// Detect Expo web environment
const isExpoWeb = Platform.OS === 'web';

// For development, you can switch between local and hosted backend
const USE_HOSTED_BACKEND = true; // Always use the hosted Vercel backend

if (USE_HOSTED_BACKEND) {
  // Use hosted backend on Vercel
  apiBaseUrl = HOSTED_API_URL;
  socketUrl = HOSTED_SOCKET_URL;
  console.log('Using hosted backend at:', socketUrl);
} else {
  // Use local backend for development
  if (isExpoWeb) {
    // Web uses window.location.hostname
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    apiBaseUrl = `http://${hostname}:5000/api`;
    socketUrl = `http://${hostname}:5000`;
    console.log('Using local backend for web at:', socketUrl);
  } else if (Platform.OS === "android") {
    // Android: Use 10.0.2.2 for emulator, LOCAL_IP for physical device
    const isPhysicalDeviceVal = !NativeModules.PlatformConstants?.isEmulator;
    apiBaseUrl = !isPhysicalDeviceVal
      ? "http://10.0.2.2:5000/api"
      : `http://${LOCAL_IP}:5000/api`;
    socketUrl = !isPhysicalDeviceVal
      ? "http://10.0.2.2:5000"
      : `http://${LOCAL_IP}:5000`;
    console.log('Using local backend for Android at:', socketUrl);
  } else {
    // iOS simulator can use localhost, physical device needs local IP
    const isPhysicalDeviceVal = !NativeModules.RNDeviceInfo?.isEmulator;
    apiBaseUrl = !isPhysicalDeviceVal
      ? "http://localhost:5000/api"
      : `http://${LOCAL_IP}:5000/api`;
    socketUrl = !isPhysicalDeviceVal
      ? "http://localhost:5000" 
      : `http://${LOCAL_IP}:5000`;
    console.log('Using local backend for iOS at:', socketUrl);
  }
}

export const API_URL = apiBaseUrl;
export const SOCKET_URL = socketUrl;

// Other configuration constants
export const DEFAULT_TIMEOUT = 10000; // 10 seconds
export const MAX_RETRIES = 3;
