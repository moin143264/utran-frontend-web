import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    // Alert, // Keep for confirmation dialogs
    ActivityIndicator,
    StatusBar,
    Dimensions,
    ScrollView,
    Platform // For showAppAlert if not already used
} from 'react-native';
import { showAppAlert } from '../../utils/uiUtils.js';
import { useAuth } from '../../context/AuthContext';
import apiServices, { api } from '../../services/api'; // Import both the services and the API instance
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
const { teams, users } = apiServices;

// Create sports icons background component with emojis and icons
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

const MemberCard = ({ member, onRemove }) => {
    // Use either direct properties or nested userDetails
    const name = member.name || member.userDetails?.name || 'Unknown';
    const email = member.email || member.userDetails?.email || '';
    const role = member.role || member.userDetails?.role || '';
    
    return (
        <View style={styles.memberCard}>
            <View style={styles.memberCardContent}>
                <View style={styles.memberCardHeader}>
                    <FontAwesome5 name="user" size={22} color="#3f51b5" style={styles.memberIcon} />
                    <Text style={styles.memberName}>{name}</Text>
                </View>
                
                <View style={styles.memberDetails}>
                    <View style={styles.memberDetail}>
                        <MaterialIcons name="email" size={14} color="#666" />
                        <Text style={styles.memberDetailText}>{email}</Text>
                    </View>
                    
                    {role && (
                        <View style={styles.memberDetail}>
                            <FontAwesome5 name="user-tag" size={14} color="#666" />
                            <Text style={styles.memberDetailText}>Role: {role}</Text>
                        </View>
                    )}
                    
                    {member.position && (
                        <View style={styles.memberDetail}>
                            <MaterialIcons name="location-pin" size={14} color="#666" />
                            <Text style={styles.memberDetailText}>Position: {member.position}</Text>
                        </View>
                    )}
                    
                    {member.jerseyNumber && (
                        <View style={styles.memberDetail}>
                            <FontAwesome5 name="tshirt" size={14} color="#666" />
                            <Text style={styles.memberDetailText}>Jersey: #{member.jerseyNumber}</Text>
                        </View>
                    )}
                </View>
                
                {onRemove && (
                    <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => onRemove(member)}
                    >
                        <FontAwesome5 name="user-minus" size={14} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const AddMemberForm = ({ onSubmit, onCancel }) => {
    const [email, setEmail] = useState('');
    const [position, setPosition] = useState('');
    const [jerseyNumber, setJerseyNumber] = useState('');

    const handleSubmit = () => {
        if (!email) {
            showAppAlert('Error', 'Please enter member email');
            return;
        }
        onSubmit({ email, position, jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : undefined });
        setEmail('');
        setPosition('');
        setJerseyNumber('');
    };

    return (
        <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add Team Member</Text>
            
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                    <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter member email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
            </View>
            
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Position (optional)</Text>
                <View style={styles.inputWrapper}>
                    <MaterialIcons name="location-pin" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="E.g., Forward, Defense"
                        value={position}
                        onChangeText={setPosition}
                    />
                </View>
            </View>
            
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Jersey Number (optional)</Text>
                <View style={styles.inputWrapper}>
                    <FontAwesome5 name="tshirt" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter jersey number"
                        value={jerseyNumber}
                        onChangeText={setJerseyNumber}
                        keyboardType="numeric"
                    />
                </View>
            </View>
            
            <View style={styles.formButtons}>
                <TouchableOpacity 
                    style={[styles.button, styles.submitButton]}
                    onPress={handleSubmit}
                >
                    <FontAwesome5 name="user-plus" size={16} color="#FFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Add Member</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                >
                    <MaterialIcons name="cancel" size={16} color="#FFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const ManageTeamMembersScreen = ({ route, navigation }) => {
    const { teamId } = route.params;
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        console.log('ManageTeamMembersScreen mounted with teamId:', teamId);
        loadTeam();
    }, [teamId]);
    
    // Log when team state changes
    useEffect(() => {
        if (team) {
            console.log('Team state updated:', team._id);
            console.log('Team players in state:', team.players?.map(p => p.user?._id || p.user));
            console.log('Total players in state:', team.players?.length || 0);
        }
    }, [team]);

    const loadTeam = async () => {
        try {
            setLoading(true);
            console.log('Loading team with ID:', teamId);
            
            // Use direct fetch to bypass any potential caching issues
            const token = await getToken();
            const response = await fetch(`http://192.168.86.134:5000/api/teams/${teamId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Team loaded with', data.players?.length || 0, 'players');
            if (data.players) {
                console.log('Player IDs:', data.players.map(p => p.user?._id || p.user));
            }
            
            // Clear any cached data and set fresh data
            setTeam(null); // Clear first to ensure React sees this as a completely new object
            setTimeout(() => setTeam(data), 50); // Short timeout to ensure UI update
        } catch (error) {
            console.error('Error loading team:', error);
            showAppAlert('Error', 'Failed to load team data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (memberData) => {
        try {
            setLoading(true);
            console.log('Adding member with data:', memberData);
            
            // Look up user by email
            const userResponse = await users.getByEmail(memberData.email);
            
            if (!userResponse.data || userResponse.data.length === 0) {
                showAppAlert('Error', 'No user found with that email');
                setLoading(false);
                return;
            }
            
            const userData = userResponse.data[0];
            console.log('Found user:', userData);
            
            // Validate user role
            if (userData.role === 'admin' || userData.role === 'organizer') {
                showAppAlert('Error', `${userData.role} users cannot be added as team players`);
                setLoading(false);
                return;
            }
            
            // Add the player using the API service
            const token = await getToken();
            const response = await fetch(`http://192.168.86.134:5000/api/teams/${teamId}/players`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                    userId: userData._id,
                    position: memberData.position || '',
                    jerseyNumber: parseInt(memberData.jerseyNumber) || 0
                })
            });
            
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to add player');
            }
            
            // Reset team data and reload
            setTeam(null);
            await loadTeam();
            
            setShowAddForm(false);
            showAppAlert('Success', 'Team member added successfully');
        } catch (error) {
            console.error('Error adding team member:', error);
            showAppAlert('Error', error.message || 'Failed to add team member');
        } finally {
            setLoading(false);
        }
    };
    
    // Helper function to get auth token
    const getToken = async () => {
        try {
            // Import the token storage utility directly to avoid circular imports
            const { getToken: getStoredToken } = require('../../utils/tokenStorage');
            return await getStoredToken();
        } catch (error) {
            console.error('Error getting token:', error);
            return '';
        }
    };

    const handleRemoveMember = (member) => {
        showsAppAlert(
            'Confirm Remove',
            `Are you sure you want to remove ${member.name} from the team?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await teams.removePlayer(teamId, member._id);
                            await loadTeam();
                            showAppAlert('Success', 'Team member removed successfully');
                        } catch (error) {
                            showAppAlert('Error', 'Failed to remove team member');
                        }
                    }
                }
            ]
        );
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
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#3f51b5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Team</Text>
            </View>
            
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={styles.teamInfoCard}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="account-group" size={24} color="#3f51b5" />
                        <Text style={styles.title}>{team?.name || 'Team'}</Text>
                    </View>
                    
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <FontAwesome5 name="users" size={16} color="#3f51b5" />
                            <Text style={styles.statValue}>{team?.players?.length || 0} Members</Text>
                        </View>
                        
                        {team?.captain && (
                            <View style={styles.statItem}>
                                <FontAwesome5 name="user-tie" size={16} color="#3f51b5" />
                                <Text style={styles.statValue}>
                                    {team.captainDetails?.name ? 'Has Captain' : 'No Captain'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
                
                {!showAddForm && (
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => setShowAddForm(true)}
                    >
                        <FontAwesome5 name="user-plus" size={16} color="#FFF" style={{marginRight: 8}} />
                        <Text style={styles.addButtonText}>Add Team Member</Text>
                    </TouchableOpacity>
                )}

                {showAddForm ? (
                    <AddMemberForm
                        onSubmit={handleAddMember}
                        onCancel={() => setShowAddForm(false)}
                    />
                ) : (
                    <View style={styles.membersContainer}>
                        {team?.captainDetails && (
                            <>
                                <View style={styles.sectionHeader}>
                                    <FontAwesome5 name="user-tie" size={18} color="#3f51b5" />
                                    <Text style={styles.sectionTitle}>Team Captain</Text>
                                </View>
                                
                                <MemberCard
                                    member={{
                                        _id: team.captain,
                                        ...team.captainDetails,
                                        isCaptain: true
                                    }}
                                    onRemove={null} // Can't remove captain
                                />
                            </>
                        )}
                        
                        <View style={styles.sectionHeader}>
                            <FontAwesome5 name="users" size={18} color="#3f51b5" />
                            <Text style={styles.sectionTitle}>Team Members ({team?.playerCount || 0})</Text>
                        </View>
                        
                        {/* Display individual player fields */}
                        {team ? (
                            <FlatList
                                data={[
                                    team.player1, team.player2, team.player3, team.player4,
                                    team.player5, team.player6, team.player7, team.player8,
                                    team.player9, team.player10, team.player11, team.player12
                                ].filter(player => player && player.user)} // Filter out empty slots
                                keyExtractor={(item, index) => `player-${index}`}
                                renderItem={({ item }) => (
                                    <MemberCard
                                        member={item}
                                        onRemove={(user._id === team.captain || user.role === 'admin' || user.role === 'organizer')
                                            ? () => handleRemoveMember(item.user)
                                            : null
                                        }
                                    />
                                )}
                                ListEmptyComponent={() => (
                                    <View style={styles.emptyContainer}>
                                        <MaterialCommunityIcons name="account-question" size={60} color="#3f51b5" style={{opacity: 0.5, marginBottom: 20}} />
                                        <Text style={styles.emptyText}>No team members added yet</Text>
                                        <Text style={styles.emptySubText}>Add team members to participate in competitions</Text>
                                    </View>
                                )}
                            />
                        ) : (
                            <ActivityIndicator size="large" color="#0000ff" />
                        )}
                    </View>
                )}
            </ScrollView>
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
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
        elevation: 3,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamInfoCard: {
        margin: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    addButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        margin: 16,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    membersContainer: {
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    memberCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 8,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    memberCardContent: {
        padding: 16,
    },
    memberCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    memberIcon: {
        marginRight: 10,
    },
    memberName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    memberDetails: {
        marginBottom: 12,
    },
    memberDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    memberDetailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    removeButton: {
        backgroundColor: '#ff5252',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignSelf: 'flex-end',
    },
    buttonIcon: {
        marginRight: 6,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        margin: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#333',
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    inputIcon: {
        padding: 10,
    },
    input: {
        flex: 1,
        padding: 10,
        fontSize: 16,
    },
    formButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#ff5252',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        fontWeight: '500',
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default ManageTeamMembersScreen;