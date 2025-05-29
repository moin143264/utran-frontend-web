import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  // Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { showAppAlert } from '../../utils/uiUtils.js';

const OTPVerificationScreen = ({ route, navigation }) => {
  const { email, name, password, role, purpose } = route.params || {};
  const { sendOTP, verifyOTP, resetPassword, otpVerification } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  
  const inputRefs = useRef([]);

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Handle countdown for resend button
  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
      setCountdown(60);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  // Set otpSent to true initially since OTP is sent from SignupScreen
  useEffect(() => {
    if (email) {
      setOtpSent(true);
      setResendDisabled(true);
    }
  }, [email]);

  const handleSendOTP = async () => {
    if (!email) {
      showAppAlert('Error', 'Email is required');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTP(email);
      if (result.success) {
        setOtpSent(true);
        setResendDisabled(true);
        showAppAlert('Success', result.message || 'OTP sent to your email');
      } else {
        showAppAlert('Error', result.error || 'Failed to send OTP');
      }
    } catch (error) {
      showAppAlert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      showAppAlert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    if (purpose === 'reset-password' && !showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    if (purpose === 'reset-password' && !newPassword) {
      showAppAlert('Error', 'Please enter your new password');
      return;
    }

    setLoading(true);
    try {
      if (purpose === 'reset-password') {
        const result = await resetPassword(otpValue, newPassword);
        if (result.success) {
          showAppAlert('Success', result.message || 'Password reset successful');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        } else {
          showAppAlert('Error', result.error || 'Invalid reset code');
        }
      } else {
        const userData = { name, password, role };
        const result = await verifyOTP(otpValue, userData);
        if (result.success) {
          showAppAlert('Success', 'Registration completed successfully');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          showAppAlert('Error', result.error || 'Invalid OTP');
        }
      }
    } catch (error) {
      showAppAlert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (!resendDisabled) {
      handleSendOTP();
    }
  };

  const handleOtpChange = (text, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Email Verification</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to {email}
          </Text>

          {purpose === 'reset-password' && showPasswordInput ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter your new password"
                secureTextEntry
                autoCapitalize="none"
                minLength={6}
              />
            </View>
          ) : (
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.resendContainer}
            onPress={handleResendOTP}
            disabled={resendDisabled}
          >
            <Text style={styles.resendText}>
              {resendDisabled
                ? `Resend code in ${countdown}s`
                : 'Resend code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {loading ? 'Processing...' : 
               purpose === 'reset-password' ? 
                (showPasswordInput ? 'Reset Password' : 'Verify Code') : 
                'Verify & Complete Registration'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>
              {purpose === 'reset-password' ? 'Back to Forgot Password' : 'Back to Registration'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#fff',
  },
  resendContainer: {
    marginBottom: 30,
  },
  resendText: {
    color: '#3498db',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#a0cdf3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

export default OTPVerificationScreen;