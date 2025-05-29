import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  // Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../services/api';
import { validateEmail } from '../../utils/validation';
import { showAppAlert } from '../../utils/uiUtils';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      showAppAlert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      showAppAlert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('[ForgotPassword] Sending request for email:', email);
      const response = await auth.forgotPassword(email);
      console.log('[ForgotPassword] Response:', response.data);
      
      console.log('[ForgotPassword] Success, navigating to OTP screen');
      showAppAlert('Success', response.data.message || 'Password reset code sent to your email');
      navigation.navigate('OTPVerification', { 
        email,
        purpose: 'reset-password'
      });
    } catch (error) {
      console.error('[ForgotPassword] Error:', error);
      console.error('[ForgotPassword] Response:', error.response?.data);
      showAppAlert(
        'Error',
        error.response?.data?.message || 'Failed to process request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a verification code
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default ForgotPasswordScreen;
