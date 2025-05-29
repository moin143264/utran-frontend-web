import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';
const ROLE_KEY = '@user_role';

// Store JWT token
export const storeToken = async (token) => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error('Error storing token:', error);
    }
};

// Get stored JWT token
export const getToken = async () => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

// Store user data
export const storeUser = async (userData) => {
    try {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        if (userData.role) {
            await AsyncStorage.setItem(ROLE_KEY, userData.role);
        }
    } catch (error) {
        console.error('Error storing user data:', error);
    }
};

// Get stored user data
export const getUser = async () => {
    try {
        const userData = await AsyncStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

// Get user role
export const getRole = async () => {
    try {
        return await AsyncStorage.getItem(ROLE_KEY);
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
};

// Clear all auth related data (for logout)
export const clearAuthData = async () => {
    try {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, ROLE_KEY]);
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
    try {
        const token = await getToken();
        return !!token;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
};
