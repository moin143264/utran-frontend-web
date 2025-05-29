import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as Linking from 'expo-linking';
import { createStackNavigator } from "@react-navigation/stack";

// Auth Screens
import LoginScreen from "../screens/common/LoginScreen";
import SignupScreen from "../screens/common/SignupScreen";
import OTPVerificationScreen from "../screens/auth/OTPVerificationScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

// Role-based Navigators
import {
  AdminNavigator,
  OrganizerNavigator,
  ParticipantNavigator,
} from "./RoleNavigator";

// Auth Context
import { useAuth } from "../context/AuthContext";

const Stack = createStackNavigator();

const prefix = Linking.createURL('/');

const linkingConfig = {
  prefixes: [prefix],
  config: {
    screens: {
      Login: 'login',
      Signup: 'signup',
      OTPVerification: 'otp-verification',
      Main: {
        path: '', // Authenticated app will be at the root path
        // Note: For deep linking into screens within AdminNavigator, OrganizerNavigator, or ParticipantNavigator,
        // further configuration or a different navigation structure might be needed.
        // This initial setup primarily enables browser back/forward for top-level navigation.
      },
    },
  },
};

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen component
  }

  return (
    <NavigationContainer linking={linkingConfig}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <Stack.Group>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animationTypeForReplace: !user ? "pop" : "push" }}
            />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

            </Stack.Group>
        ) : (
          // Role-based Stack
          <Stack.Screen
            name="Main"
            component={
              user.role === "admin"
                ? AdminNavigator
                : user.role === "organizer"
                ? OrganizerNavigator
                : ParticipantNavigator
            }
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
