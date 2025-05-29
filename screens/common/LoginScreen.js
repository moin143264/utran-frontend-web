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

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            showAppAlert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const result = await login(formData.email, formData.password);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            showAppAlert('Success', 'Logged in successfully!'); // Added success alert
        } catch (error) {
            showAppAlert('Error', error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
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
                            <FontAwesome5 name="trophy" size={40} color="#FF9800" style={{marginBottom: 10}} />
                            <Text style={styles.title}>Welcome Back</Text>
                        </View>
                        <Text style={styles.subtitle}>Sign in to continue</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <MaterialCommunityIcons name="email" size={20} color="#fff" />
                                {' '}Email
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                style={styles.input}
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                placeholder="Enter your email"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
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
                                placeholderTextColor="#999"
                                secureTextEntry
                            />
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.forgotPasswordButton}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <View style={styles.buttonContent}>
                                <FontAwesome5 name="sign-in-alt" size={18} color="#FFF" style={{marginRight: 8}} />
                                <Text style={styles.buttonText}>
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.signupLink}
                            onPress={() => navigation.navigate('Signup')}
                        >
                            <Text style={styles.signupText}>
                                Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
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
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        marginRight: 5,
    },
    forgotPasswordText: {
        color: '#FF9800',
        fontSize: 14,
    },
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
    form: {
        padding: 30,
        borderRadius: 20,
        width: Math.min(400, width - 40),
        alignSelf: 'center',
        marginVertical: 40,
        backgroundColor: 'rgba(25, 40, 65, 0.95)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(63, 81, 181, 0.5)',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 16,
        color: '#E0E0E0',
        marginBottom: 32,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
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
    },
    input: {
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#3f51b5', // Using the primary blue from the OrganizerDashboard
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
    signupLink: {
        marginTop: 20,
    },
    signupText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 14,
    },
    signupTextBold: {
        fontWeight: 'bold',
        color: '#FF9800', // Orange accent color from the OrganizerDashboard
    },
});

export default LoginScreen;