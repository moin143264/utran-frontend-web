import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../services/api';
import { storeToken, storeUser, clearAuthData, getToken, getUser } from '../utils/tokenStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [otpVerification, setOtpVerification] = useState({
        isWaitingForOTP: false,
        email: '',
        userId: null
    });

    // Check for existing session on app start
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await getToken();
            if (token) {
                const userData = await getUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userData) => {
        try {
            await storeUser(userData);
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error('User update failed:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to update user' 
            };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await auth.login({ email, password });
            const { token, ...userData } = response.data;
            
            await storeToken(token);
            await storeUser(userData);
            setUser(userData);
            
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return { 
                success: false, 
                error: error.message || 'Login failed' 
            };
        }
    };

    const sendOTP = async (email) => {
        try {
            const response = await auth.sendOTP(email);
            setOtpVerification({
                isWaitingForOTP: true,
                email,
                userId: response.data.userId
            });
            return { 
                success: true, 
                message: response.data.message 
            };
        } catch (error) {
            console.error('OTP sending failed:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || error.message || 'Failed to send OTP' 
            };
        }
    };

    const verifyOTP = async (otp, userData) => {
        try {
            const verificationData = {
                email: otpVerification.email,
                otp,
                ...userData
            };
            
            const response = await auth.verifyOTP(verificationData);
            const { token, ...user } = response.data;
            
            await storeToken(token);
            await storeUser(user);
            setUser(user);
            
            // Reset OTP verification state
            setOtpVerification({
                isWaitingForOTP: false,
                email: '',
                userId: null
            });
            
            return { success: true };
        } catch (error) {
            console.error('OTP verification failed:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || error.message || 'OTP verification failed' 
            };
        }
    };

    const register = async (userData) => {
        try {
            // Try to register directly (will be redirected to OTP flow)
            const response = await auth.register(userData);
            
            // If we somehow get here (should not happen with current backend)
            const { token, ...user } = response.data;
            await storeToken(token);
            await storeUser(user);
            setUser(user);
            
            return { success: true };
        } catch (error) {
            console.error('Registration failed:', error);
            
            // Check if we need to redirect to OTP flow
            if (error.response?.data?.redirectToOTP) {
                return { 
                    success: false, 
                    redirectToOTP: true,
                    message: 'Please verify your email with OTP to complete registration'
                };
            }
            
            return { 
                success: false, 
                error: error.response?.data?.message || error.message || 'Registration failed' 
            };
        }
    };

    const logout = async () => {
        try {
            await auth.logout();
            await clearAuthData();
            setUser(null);
            return { success: true };
        } catch (error) {
            console.error('Logout failed:', error);
            return { 
                success: false, 
                error: error.message || 'Logout failed' 
            };
        }
    };

    const updateUserProfile = async (updatedData) => {
        try {
            const currentUser = { ...user, ...updatedData };
            await storeUser(currentUser);
            setUser(currentUser);
            return { success: true };
        } catch (error) {
            console.error('Profile update failed:', error);
            return { 
                success: false, 
                error: error.message || 'Profile update failed' 
            };
        }
    };

    // Check if user has required role
    const hasRole = (requiredRole) => {
        if (!user) return false;
        if (Array.isArray(requiredRole)) {
            return requiredRole.includes(user.role);
        }
        return user.role === requiredRole;
    };

    const resetPassword = async (token, newPassword) => {
        try {
            const response = await auth.resetPassword({
                token,
                newPassword,

                email: otpVerification.email
            });
            return { success: true ,
                message: response.data.message || 'Password reset successful'

            };
        } catch (error) {
            console.error('Password reset failed:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || error.message || 'Password reset failed' 
            };
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        sendOTP,
        verifyOTP,
        otpVerification,
        setOtpVerification,
        updateUser,
        hasRole,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
