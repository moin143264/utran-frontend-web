import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    // Alert, // Replaced by showAppAlert
    Modal,
    TextInput,
    StatusBar,
    Dimensions,
    Platform // For showAppAlert if not already used
} from 'react-native';
import { showAppAlert } from '../../utils/uiUtils.js';
import { users } from '../../services/api';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

// Create sports icons background component
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
  const iconSize = 30;
  const emojiSize = 26;
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
      const randomOpacity = Math.random() * 0.5 + 0.2; // Between 0.2 and 0.7
      const randomRotation = Math.floor(Math.random() * 360);
      const randomScale = Math.random() * 0.6 + 1.0; // Between 1.0 and 1.6
      
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
            zIndex: 1,
          }}
        >
          {randomEmoji}
        </Text>
      );
    } else {
      const randomIcon = sportsIcons[Math.floor(Math.random() * sportsIcons.length)];
      const randomOpacity = Math.random() * 0.4 + 0.2; // Between 0.2 and 0.6
      const randomRotation = Math.floor(Math.random() * 360);
      const randomScale = Math.random() * 0.5 + 1.0; // Between 1.0 and 1.5
      
      // Spread elements more evenly
      const xPos = (Math.random() * 0.8 + 0.1) * width; // 10-90% of width
      const yPos = (Math.random() * 0.8 + 0.1) * height; // 10-90% of height
      
      elements.push(
        <MaterialCommunityIcons
          key={`icon-${i}`}
          name={randomIcon}
          size={iconSize * randomScale}
          color="#3f51b5"
          style={{
            position: 'absolute',
            left: xPos,
            top: yPos,
            opacity: randomOpacity,
            transform: [{ rotate: `${randomRotation}deg` }],
            zIndex: 1,
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

const UserCard = ({ user, onEdit, onDelete }) => (
    <View style={styles.userCard}>
        <View style={styles.userInfo}>
            <View style={styles.userHeader}>
                <MaterialIcons name="person" size={22} color="#3f51b5" style={styles.userIcon} />
                <Text style={styles.userName}>{user.name}</Text>
            </View>
            <View style={styles.emailContainer}>
                <MaterialIcons name="email" size={16} color="#666" style={styles.detailIcon} />
                <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <View style={styles.roleContainer}>
                <MaterialIcons name="badge" size={16} color="#666" style={styles.detailIcon} />
                <Text style={styles.roleLabel}>Role:</Text>
                <View style={[
                    styles.roleBadge, 
                    { backgroundColor: getRoleColor(user.role) + '20' }
                ]}>
                    <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                        {user.role.toUpperCase()}
                    </Text>
                </View>
            </View>
        </View>
        <View style={styles.actionButtons}>
            <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => onEdit(user)}
            >
                <MaterialIcons name="edit" size={16} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(user)}
            >
                <MaterialIcons name="delete" size={16} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const EditUserModal = ({ visible, user, onClose, onSave }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [role, setRole] = useState(user?.role || 'participant');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
        }
    }, [user]);

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) {
            showAppAlert('Error', 'Name and email are required');
            return;
        }

        try {
            setSaving(true);
            await onSave({ name, email, role });
            onClose();
        } catch (error) {
            console.error('Save error:', error);
            showAppAlert('Error', error.message || 'Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    // Available roles in the system (must match backend enum)
    const roles = ['user', 'admin', 'organizer'];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <MaterialIcons 
                            name={user ? "edit" : "person-add"} 
                            size={24} 
                            color="#3f51b5" 
                            style={styles.modalIcon}
                        />
                        <Text style={styles.modalTitle}>
                            {user ? 'Edit User' : 'Add New User'}
                        </Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Name"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <Text style={styles.roleTitle}>Select Role:</Text>
                    <View style={styles.roleSelector}>
                        {roles.map((r) => (
                            <TouchableOpacity
                                key={r}
                                style={[
                                    styles.roleOption,
                                    role === r && styles.selectedRole,
                                    role === r && { backgroundColor: getRoleColor(r) + '30', borderColor: getRoleColor(r) }
                                ]}
                                onPress={() => setRole(r)}
                            >
                                <MaterialIcons 
                                    name={r === 'admin' ? 'admin-panel-settings' : r === 'organizer' ? 'event' : 'person'} 
                                    size={16} 
                                    color={role === r ? getRoleColor(r) : '#666'} 
                                    style={styles.roleIcon}
                                />
                                <Text style={[
                                    styles.roleOptionText,
                                    role === r && { color: getRoleColor(r), fontWeight: '600' }
                                ]}>
                                    {r.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                            disabled={saving}
                        >
                            <MaterialIcons name="close" size={18} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.modalButton, styles.saveButton]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <MaterialIcons name="check" size={18} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>
                                {saving ? 'Saving...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
        case 'admin':
            return '#4CAF50';
        case 'organizer':
            return '#2196F3';
        default:
            return '#FF9800';
    }
};

const UserManagement = () => {
    const [loading, setLoading] = useState(true);
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await users.getAll();
            setUserList(response.data);
        } catch (error) {
            showAppAlert('Error', 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setModalVisible(true);
    };

    const handleDelete = (user) => {
        const proceedWithDelete = async () => {
            try {
                setLoading(true);
                await users.delete(user._id);
                showAppAlert('Success', 'User deleted successfully');
                loadUsers(); // Refresh the list
            } catch (error) {
                console.error('Delete error:', error);
                showAppAlert('Error', error.message || 'Failed to delete user');
            } finally {
                setLoading(false);
            }
        };

        if (Platform.OS === 'web') {
            // Using window.confirm for a simple browser-based confirmation on web
            if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
                proceedWithDelete();
            }
        } else {
            // Native platforms will use the Alert.alert via showAppAlert for confirmation
            showAppAlert(
                "Confirm Delete",
                `Are you sure you want to delete ${user.name}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: proceedWithDelete, // Call the actual delete logic
                    },
                ],
                { cancelable: true }
            );
        }
    };

    const handleSave = async (userData) => {
        try {
            if (selectedUser) {
                console.log('Updating user:', selectedUser._id, userData);
                // Update role if changed
                if (userData.role !== selectedUser.role) {
                    await users.updateRole(selectedUser._id, userData.role);
                }
                // Update profile if name or email changed
                if (userData.name !== selectedUser.name || userData.email !== selectedUser.email) {
                    await users.updateProfile(selectedUser._id, {
                        name: userData.name,
                        email: userData.email
                    });
                }
            } else {
                // For new users
                await users.create(userData);
            }
            await loadUsers();
            showAppAlert('Success', `User ${selectedUser ? 'updated' : 'created'} successfully`);
        } catch (error) {
            console.error('Save error:', error);
            throw new Error(error.message || `Failed to ${selectedUser ? 'update' : 'create'} user`);
        }
    };

    if (loading) {
        return (
            <View style={styles.backgroundContainer}>
                <SportsIconsBackground />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.backgroundContainer}>
            <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
            <SportsIconsBackground />
            
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <MaterialIcons name="people" size={24} color="#3f51b5" />
                    <Text style={styles.headerTitle}>User Management</Text>
                </View>
            </View>
            
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                    setSelectedUser(null);
                    setModalVisible(true);
                }}
            >
                <MaterialIcons name="person-add" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.addButtonText}>Add New User</Text>
            </TouchableOpacity>

            <FlatList
                data={userList}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <UserCard
                        user={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="account-off-outline" size={48} color="#aaa" />
                        <Text style={styles.emptyText}>No users found</Text>
                        <TouchableOpacity 
                            style={styles.emptyButton}
                            onPress={loadUsers}
                        >
                            <Text style={styles.emptyButtonText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            <EditUserModal
                visible={modalVisible}
                user={selectedUser}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedUser(null);
                }}
                onSave={handleSave}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    backgroundContainer: {
        flex: 1,
        backgroundColor: 'rgba(240, 245, 255, 0.85)',
    },
    iconsBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    header: {
        padding: 16,
        backgroundColor: "#f5f5f5",
        elevation: 3,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginLeft: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
        paddingTop: 8,
    },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#3f51b5',
    },
    userInfo: {
        flex: 1,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    userIcon: {
        marginRight: 8,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailIcon: {
        marginRight: 6,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roleLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    buttonIcon: {
        marginRight: 4,
    },
    editButton: {
        backgroundColor: '#2196F3',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        margin: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
        marginBottom: 16,
    },
    emptyButton: {
        backgroundColor: '#3f51b5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalIcon: {
        marginRight: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    roleTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 10,
    },
    roleSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    roleOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    roleIcon: {
        marginRight: 6,
    },
    roleOptionText: {
        fontSize: 12,
        color: '#666',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
});

export default UserManagement;