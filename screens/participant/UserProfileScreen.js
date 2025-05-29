import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    // Alert,
    Image,
    ActivityIndicator,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'utran-app';
import { useAuth } from '../../context/AuthContext';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { users, auth } from '../../services/api';
import axios from 'axios';
import { showAppAlert } from '../../utils/uiUtils';

const UserProfileScreen = ({ navigation }) => {
    const { user, logout, updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [image, setImage] = useState(user?.profileImage || null);
    
    // Debug log to see user data
    console.log('User data in profile:', user);

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Not available';
            
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            return date.toLocaleDateString(undefined, options);
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Not available';
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showAppAlert('Sorry, we need camera roll permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setUploading(true);
                const uri = result.assets[0].uri;
                // For web, we need to handle the file differently
                
                // Convert base64/blob uri to file object for web
                const fileResponse = await fetch(uri);
                const blob = await fileResponse.blob();
                const fileDetails = {
                    uri,
                    name: 'profile.jpg', // You can derive this from uri if needed, or keep it generic
                    type: blob.type || 'image/jpeg', // Use blob's type if available
                };
                console.log('File details for FormData:', fileDetails);
                console.log('Blob to be uploaded:', blob);

                if (!blob) {
                    throw new Error('No file blob could be created');
                }
                
                console.log('Getting Cloudinary signature from server...');
                try {
                    const signatureResponse = await auth.getCloudinarySignature();
                    const signatureData = signatureResponse.data;
            
                    const formData = new FormData();
                    // IMPORTANT: Append the blob directly, with a filename
                    formData.append('file', blob, fileDetails.name);
                    formData.append('api_key', signatureData.api_key);
                    formData.append('timestamp', signatureData.timestamp); // This was signed
                    formData.append('signature', signatureData.signature);
                    formData.append('upload_preset', signatureData.upload_preset); // This was signed
                    
                    console.log('Starting signed upload to Cloudinary with minimal FormData...');
                    console.log('Upload URL:', `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`);
                    console.log('FormData being sent (excluding file content):',
                        `api_key: ${signatureData.api_key}, timestamp: ${signatureData.timestamp}, signature: ${signatureData.signature.substring(0,10)}..., upload_preset: ${signatureData.upload_preset}`
                    );

                    // Upload to Cloudinary with signature
                    const uploadResponse = await axios({
                        method: 'post',
                        url: `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
                        data: formData,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'X-Requested-With': 'XMLHttpRequest' // Often helpful for Cloudinary
                        },
                        onUploadProgress: (progressEvent) => {
                            // Ensure progressEvent.total is a positive number before calculating progress
                            if (progressEvent.lengthComputable && progressEvent.total && progressEvent.total > 0) {
                                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                console.log(`Upload Progress: ${progress}%`);
                            } else {
                                console.log(`Upload Progress: loaded ${progressEvent.loaded} bytes`); // Fallback if total is not known or length is not computable
                            }
                        },
                        timeout: 30000 // 30 seconds
                    });

                    const uploadResult = uploadResponse.data;
                    if (uploadResult.secure_url) {
                        await users.updateProfile({ profileImage: uploadResult.secure_url });
                        updateUser({ ...user, profileImage: uploadResult.secure_url });
                        setImage(uploadResult.secure_url);
                        showAppAlert('Success', 'Profile image updated successfully!');
                    } else {
                        throw new Error('Failed to get image URL from Cloudinary');
                    }
                } catch (error) {
                    console.error('Error in upload process:', error);
                    
                    // Log more details about the error
                    if (error.response) {
                        console.error('Error response status:', error.response.status);
                        console.error('Error response data:', error.response.data);
                        
                        // If it's a Cloudinary error, log the details
                        if (error.response.data?.error) {
                            console.error('Cloudinary error details:', error.response.data.error);
                        }
                        
                        // Handle specific error cases
                        if (error.response.status === 401) {
                            throw new Error('Authentication failed. Please sign in again.');
                        } else if (error.response.status === 400) {
                            throw new Error('Invalid request. Please try with a different image.');
                        } else {
                            throw new Error('Failed to upload image. Please try again later.');
                        }
                    } else if (error.request) {
                        console.error('No response received:', error.request);
                        throw new Error('Network error. Please check your connection and try again.');
                    } else {
                        console.error('Error setting up request:', error.message);
                        throw new Error('Failed to process your request. Please try again.');
                    }
                }
            }
        } catch (error) {
            console.error('Error in upload process:', error);
            
            // Log more details about the error
            if (error.response) {
                console.error('Error response status:', error.response.status);
                console.error('Error response data:', error.response.data);
                
                // If it's a Cloudinary error, log the details
                if (error.response.data?.error) {
                    console.error('Cloudinary error details:', error.response.data.error);
                }
                
                // Handle specific error cases
                if (error.response.status === 401) {
                    throw new Error('Authentication failed. Please sign in again.');
                } else if (error.response.status === 400) {
                    throw new Error('Invalid request. Please try with a different image.');
                } else {
                    throw new Error('Failed to upload image. Please try again later.');
                }
            } else if (error.request) {
                console.error('No response received:', error.request);
                throw new Error('Network error. Please check your connection and try again.');
            } else {
                console.error('Error setting up request:', error.message);
                throw new Error('Failed to process your request. Please try again.');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            showAppAlert('Error', 'Failed to logout. Please try again.');
        }
    };

    const ProfileSection = ({ icon, title, value }) => (
        <View style={styles.profileSection}>
            <View style={styles.sectionIcon}>
                <Feather name={icon} size={20} color="#4A90E2" />
            </View>
            <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionValue}>{value}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <View style={styles.profileImageContainer}>
                <TouchableOpacity style={styles.profileImage} onPress={pickImage}>
                    {uploading ? (
                        <ActivityIndicator size="large" color="#4A90E2" />
                    ) : image ? (
                        <Image source={{ uri: image }} style={styles.profileImageStyle} />
                    ) : (
                        <Feather name="user" size={50} color="#4A90E2" />
                    )}
                    <View style={styles.editIconContainer}>
                        <Feather name="edit" size={16} color="#FFF" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userRole}>{user?.role || 'Participant'}</Text>
            </View>

            <View style={styles.infoContainer}>
                <ProfileSection 
                    icon="mail" 
                    title="Email" 
                    value={user?.email || 'Not provided'} 
                />
                <ProfileSection 
                    icon="calendar" 
                    title="Joined" 
                    value={user?.createdAt ? formatDate(user?.createdAt) : formatDate(user?.created_at)} 
                />
            </View>

            <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <MaterialIcons name="logout" size={24} color="#FF4444" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    profileImageStyle: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    editIconContainer: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#4A90E2',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 16,
    },
    profileImageContainer: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 16,
        color: '#666',
        textTransform: 'capitalize',
    },
    infoContainer: {
        backgroundColor: '#FFF',
        marginTop: 16,
        paddingHorizontal: 16,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    sectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    sectionContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    sectionValue: {
        fontSize: 16,
        color: '#333',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        marginTop: 24,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
        color: '#FF4444',
    },
});

export default UserProfileScreen;
