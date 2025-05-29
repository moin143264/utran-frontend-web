import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    // Alert, // Replaced by showAppAlert
    Dimensions
} from 'react-native';
import { showAppAlert } from '../../utils/uiUtils.js';
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

// Sports Icons Background component to match OrganizerDashboard
const SportsIconsBackground = () => {
  // Array of sports icons to use
  const sportsIcons = [
    'basketball', 'soccer', 'football', 'tennis', 'cricket-bat',
    'volleyball', 'hockey-sticks', 'baseball', 'table-tennis',
    'badminton', 'swim', 'run', 'bike', 'golf', 'weight-lifter'
  ];
  
  // Array of sports emojis to use
  const sportsEmojis = [
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', 
    '🏸', '🏊‍♂️', '🏃‍♂️', '🚴‍♂️', '⛳', '🏋️‍♂️', '🤾‍♂️', '🏌️‍♂️', '🤺',
    '🏇', '🧗‍♂️', '🏄‍♂️', '🤽‍♂️', '🚣‍♂️', '⛷️', '🏂', '🏆', '🥇', '🥈', '🥉'
  ];
  
  const { width, height } = Dimensions.get('window');
  // Calculate number of icons based on screen size
  const iconSize = 30; // Increased size
  const emojiSize = 26; // Increased size
  const cols = Math.floor(width / (iconSize * 2));
  const rows = Math.floor(height / (iconSize * 2));
  const totalElements = Math.min(cols * rows, 50); // Limit total elements
  
  // Create array of elements with random positions
  const elements = [];
  for (let i = 0; i < totalElements; i++) {
    // Randomly choose between icon and emoji
    const useEmoji = Math.random() > 0.3; // More emojis
    
    if (useEmoji) {
      const randomEmoji = sportsEmojis[Math.floor(Math.random() * sportsEmojis.length)];
      const randomOpacity = Math.random() * 0.5 + 0.2; // Between 0.2 and 0.7 (more visible)
      const randomRotation = Math.floor(Math.random() * 360);
      const randomScale = Math.random() * 0.6 + 1.0; // Between 1.0 and 1.6 (larger)
      
      // Spread elements more evenly
      const xPos = (Math.random() * 0.8 + 0.1) * width; // 10-90% of width
      const yPos = (Math.random() * 0.8 + 0.1) * height; // 10-90% of height
      
      elements.push(
        <Text
          key={`emoji-${i}`}
          style={{
            position: 'absolute',
            left: xPos,
            top: yPos,
            opacity: randomOpacity,
            fontSize: emojiSize * randomScale,
            transform: [{ rotate: `${randomRotation}deg` }],
            zIndex: 1, // Ensure proper layering
          }}
        >
          {randomEmoji}
        </Text>
      );
    } else {
      const randomIcon = sportsIcons[Math.floor(Math.random() * sportsIcons.length)];
      const randomOpacity = Math.random() * 0.4 + 0.2; // Between 0.2 and 0.6 (more visible)
      const randomRotation = Math.floor(Math.random() * 360);
      const randomScale = Math.random() * 0.5 + 1.0; // Between 1.0 and 1.5 (larger)
      
      // Spread elements more evenly
      const xPos = (Math.random() * 0.8 + 0.1) * width; // 10-90% of width
      const yPos = (Math.random() * 0.8 + 0.1) * height; // 10-90% of height
      
      elements.push(
        <MaterialCommunityIcons
          key={`icon-${i}`}
          name={randomIcon}
          size={iconSize * randomScale}
          color="#3f51b5" // Blue color for light theme
          style={{
            position: 'absolute',
            left: xPos,
            top: yPos,
            opacity: randomOpacity,
            transform: [{ rotate: `${randomRotation}deg` }],
            zIndex: 1, // Ensure proper layering
          }}
        />
      );
    }
  }
  
  return (
    <View style={styles.iconsBackground}>
      {elements}
    </View>
  );
};

const SignupScreen = ({ navigation }) => {
    const [isOtpStage, setIsOtpStage] = useState(true); // true for OTP stage, false for signup details stage
    const { register, sendOTP } = useAuth(); // Keep sendOTP, register will be used in OTPVerificationScreen
    const [formData, setFormData] = useState({
        email: '', // Initially only email for OTP stage
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSendOtpClick = async () => {
        if (!formData.email) {
            showAppAlert('Error', 'Please enter your email address.');
            return;
        }
        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showAppAlert('Error', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            // Call the sendOTP function from AuthContext
            const otpResult = await sendOTP(formData.email);
            if (otpResult.success) {
                showAppAlert('Success', 'OTP sent successfully. Please check your email.');
                setIsOtpStage(false); // Move to the next stage (full signup form)
            } else {
                showAppAlert('Error', otpResult.error || 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            showAppAlert('Error', error.message || 'An unexpected error occurred while sending OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSignupClick = () => {
        // Form validation for the second stage
        if (!formData.name || !formData.password || !formData.confirmPassword) {
            showAppAlert('Error', 'Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showAppAlert('Error', 'Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            showAppAlert('Error', 'Password must be at least 6 characters long');
            return;
        }

        // Navigate to OTP verification screen with all collected user data
        // The actual registration will happen there after OTP is verified
        navigation.navigate('OTPVerification', {
            email: formData.email, // Email collected in the first stage
            name: formData.name,
            password: formData.password,
            role: 'user' // Default role for new registrations
        });
    };

    return (
        <View style={styles.backgroundContainer}>
            <SportsIconsBackground />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.form}>
                        <View style={styles.titleContainer}>
                            <View style={styles.iconContainer}>
                                <FontAwesome5 name="user-plus" size={40} color="#FF9800" />
                            </View>
                            <Text style={styles.title}>Create Account</Text>
                        </View>
                        <Text style={styles.subtitle}>Join us today</Text>

                        {isOtpStage ? (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialIcons name="email" size={16} color="#fff" />
                                        {' '}Email
                                    </Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your email"
                                            placeholderTextColor="#888"
                                            value={formData.email}
                                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleSendOtpClick}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>{loading ? 'Sending OTP...' : 'Send OTP'}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                {/* Email field (non-editable, pre-filled) */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialIcons name="email" size={16} color="#fff" />
                                        {' '}Email (Verification Pending)
                                    </Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={[styles.input, styles.disabledInput]}
                                            value={formData.email}
                                            editable={false}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <FontAwesome5 name="user-alt" size={16} color="#fff" />
                                        {' '}Name
                                    </Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.name}
                                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                                            placeholder="Enter your name"
                                            placeholderTextColor="#888"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="lock" size={20} color="#fff" />
                                        {' '}Password
                                    </Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.password}
                                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                                            placeholder="Enter your password"
                                            placeholderTextColor="#888"
                                            secureTextEntry
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="lock-check" size={20} color="#fff" />
                                        {' '}Confirm Password
                                    </Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.confirmPassword}
                                            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                            placeholder="Confirm your password"
                                            placeholderTextColor="#888"
                                            secureTextEntry
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleFinalSignupClick}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Sign Up & Verify OTP'}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity 
                            style={styles.loginLink}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginText}>
                                Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    backgroundContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(240, 245, 255, 0.85)', // Same light blue as OrganizerDashboard
    },
    iconsBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    iconContainer: {
        backgroundColor: 'rgba(63, 81, 181, 0.15)',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 152, 0, 0.3)',
    },
    form: {
        padding: 30,
        borderRadius: 20,
        width: Math.min(400, width - 40),
        alignSelf: 'center',
        marginVertical: 40,
        backgroundColor: 'rgba(25, 40, 65, 0.85)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(63, 81, 181, 0.6)',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 8,
        textAlign: 'center',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 16,
        color: '#E0E0E0',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(63, 81, 181, 0.2)',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: '#fff', 
        borderRadius: 8,
        color: '#000', 
        fontSize: 16,
    },
    disabledInput: {
        backgroundColor: '#f5f5f5', 
        color: '#666', 
    },
    button: {
        backgroundColor: '#3f51b5', 
        padding: 14,
        borderRadius: 12,
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    buttonContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 20,
    },
    loginText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 14,
    },
    loginTextBold: {
        fontWeight: 'bold',
        color: '#FF9800', // Orange accent color from the OrganizerDashboard
    },
});

export default SignupScreen;