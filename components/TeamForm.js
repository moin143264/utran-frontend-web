import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView,
    // Alert, // Replaced by showAppAlert
    ActivityIndicator,
    Platform // Platform might be needed if showAppAlert doesn't import it
} from 'react-native';
import { showAppAlert } from '../utils/uiUtils'; // Adjusted path for components folder
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import apiServices from '../services/api';
const { teams, users } = apiServices;

const TeamForm = ({ 
    initialData, 
    onSubmit,
    onCancel,
    sport
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [captainEmail, setCaptainEmail] = useState('');
    const [captainData, setCaptainData] = useState(null);
    const [players, setPlayers] = useState([{ email: '', userData: null }]);
    const [loading, setLoading] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData) {
            // Only extract the fields we need to prevent direct object rendering
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                _id: initialData._id
            });
            
            // If we have captain data, populate the captain field
            if (initialData.captain && typeof initialData.captain === 'object') {
                setCaptainData(initialData.captain);
                setCaptainEmail(initialData.captain.email || '');
            }
            
            // If we have player data, populate the players array
            if (initialData.players && Array.isArray(initialData.players)) {
                const captainId = initialData.captain?._id || (typeof initialData.captain === 'string' ? initialData.captain : null);
                const existingPlayers = initialData.players
                    .filter(player => player.user && typeof player.user === 'object' && player.user._id !== captainId) // Filter out captain
                    .map(player => ({
                        email: player.user.email || '',
                        userData: player.user,
                        position: player.position || '',
                        jerseyNumber: player.jerseyNumber || ''
                    }));
                
                if (existingPlayers.length > 0) {
                    setPlayers(existingPlayers);
                } else {
                    // If, after filtering, no other players remain, ensure the players state is empty or has a default empty player field
                    // This prevents an old player list from showing if the only player was the captain
                    setPlayers([{ email: '', userData: null, position: '', jerseyNumber: '' }]); 
                }
            }
        }
    }, [initialData]);
    
    // Function to look up a user by email
    const lookupUserByEmail = async (email) => {
        if (!email) return null;
        
        try {
            setLookupLoading(true);
            const response = await users.getByEmail(email);
            console.log('User lookup response:', response.data);
            
            if (response.data && response.data.length > 0) {
                const user = response.data[0];
                console.log('Found user:', user);
                console.log('User role:', user.role);
                return user;
            }
            return null;
        } catch (error) {
            console.error('Error looking up user:', error);
            return null;
        } finally {
            setLookupLoading(false);
        }
    };
    
    // Function to handle captain email lookup
    const handleCaptainLookup = async () => {
        if (!captainEmail) {
            showAppAlert('Error', 'Please enter a captain email');
            return;
        }
        
        const user = await lookupUserByEmail(captainEmail);
        if (user) {
            // Check if user has admin role
            if (user.role === 'admin') {
                showAppAlert('Error', 'Admin users cannot be added as team captain');
                setCaptainData(null);
                return;
            }
            
            setCaptainData(user);
            showAppAlert('Success', `Found captain: ${user.name}`);
        } else {
            setCaptainData(null);
            showAppAlert('Error', 'No user found with that email');
        }
    };
    
    // Function to handle player email lookup
    const handlePlayerLookup = async (index) => {
        const playerEmail = players[index].email;
        if (!playerEmail) {
            showAppAlert('Error', 'Please enter a player email');
            return;
        }
        
        // Check if this email is already used for captain
        if (captainData && captainData.email.toLowerCase() === playerEmail.toLowerCase()) {
            showAppAlert('Error', 'This user is already added as the team captain');
            return;
        }
        
        // Check if this email is already used for another player
        const isDuplicate = players.some((player, idx) => 
            idx !== index && 
            player.userData && 
            player.userData.email.toLowerCase() === playerEmail.toLowerCase()
        );
        
        if (isDuplicate) {
            showAppAlert('Error', 'This player is already added to the team');
            return;
        }
        
        const user = await lookupUserByEmail(playerEmail);
        if (user) {
            // Check if user has admin role
            if (user.role === 'admin') {
                showAppAlert('Error', 'Admin users cannot be added as team players');
                
                const updatedPlayers = [...players];
                updatedPlayers[index].userData = null;
                setPlayers(updatedPlayers);
                return;
            }
            
            const updatedPlayers = [...players];
            updatedPlayers[index].userData = user;
            setPlayers(updatedPlayers);
            showAppAlert('Success', `Found player: ${user.name}`);
        } else {
            const updatedPlayers = [...players];
            updatedPlayers[index].userData = null;
            setPlayers(updatedPlayers);
            showAppAlert('Error', 'No user found with that email');
        }
    };
    
    // Function to add a new player field
    const addPlayerField = () => {
        setPlayers([...players, { email: '', userData: null }]);
    };
    
    // Function to remove a player field
    const removePlayerField = (index) => {
        const updatedPlayers = [...players];
        updatedPlayers.splice(index, 1);
        setPlayers(updatedPlayers);
    };
    
    // Function to update player email
    const updatePlayerEmail = (index, email) => {
        const updatedPlayers = [...players];
        updatedPlayers[index].email = email;
        updatedPlayers[index].userData = null; // Reset user data when email changes
        setPlayers(updatedPlayers);
    };
    
    // Function to update player position
    const updatePlayerPosition = (index, position) => {
        const updatedPlayers = [...players];
        updatedPlayers[index].position = position;
        setPlayers(updatedPlayers);
    };
    
    // Function to update player jersey number
    const updatePlayerJerseyNumber = (index, number) => {
        const updatedPlayers = [...players];
        updatedPlayers[index].jerseyNumber = number;
        setPlayers(updatedPlayers);
    };

    const handleSubmit = () => {
        try {
            setError(null);

            // Validate form
            if (!formData.name || !formData.description) {
                throw new Error('Please fill in all required fields');
            }

            // Validate captain
            if (!captainData) {
                throw new Error('Please add a valid captain');
            }

            // Validate players
            // Filter out the current captain from the players list before validation and submission
            const currentCaptainId = captainData ? captainData._id : null;
            const playersForSubmission = players.filter(player => player.userData && player.userData._id !== currentCaptainId);

            if (playersForSubmission.length === 0 && !initialData) { // For new teams, at least one non-captain player might be desired
                // This validation might need adjustment based on whether a team can consist of only a captain
                // For now, let's assume if players array is empty after filtering captain, it's okay for updates, but maybe not for new creates.
                // throw new Error('Please add at least one valid player besides the captain');
            }

            // Prepare data for submission
            const teamData = {
                ...formData,
                captain: currentCaptainId, // Use currentCaptainId here
                players: playersForSubmission.map(player => ({
                    user: player.userData._id,
                    position: player.position || '',
                    jerseyNumber: player.jerseyNumber || ''
                }))
            };

            // Pass data to parent component for API handling
            console.log('TeamForm submitted data:', JSON.stringify(teamData, null, 2));
            onSubmit && onSubmit(teamData);
            // Note: Alert will be shown by parent component
        } catch (err) {
            setError(err.message || 'Something went wrong');
            showAppAlert('Error', err.message || 'Something went wrong');
        }
    };

    // Helper function to get a sport icon
    const getSportIcon = () => {
        switch (sport?.toLowerCase()) {
            case 'soccer':
                return <MaterialIcons name="sports-soccer" size={24} color="#3f51b5" />;
            case 'basketball':
                return <MaterialIcons name="sports-basketball" size={24} color="#3f51b5" />;
            case 'cricket':
                return <MaterialCommunityIcons name="cricket" size={24} color="#3f51b5" />;
            case 'tennis':
                return <MaterialIcons name="sports-tennis" size={24} color="#3f51b5" />;
            case 'volleyball':
                return <MaterialIcons name="sports-volleyball" size={24} color="#3f51b5" />;
            default:
                return <MaterialIcons name="group" size={24} color="#3f51b5" />;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <View style={styles.titleContainer}>
                    {getSportIcon()}
                    <Text style={styles.title}>
                        {initialData ? 'Edit Team' : 'Create New Team'}
                    </Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <MaterialIcons name="groups" size={18} color="#3f51b5" style={styles.labelIcon} />
                        Team Name *
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Enter team name"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <MaterialIcons name="description" size={18} color="#3f51b5" style={styles.labelIcon} />
                        Description *
                    </Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder="Enter team description"
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Captain Section */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <MaterialIcons name="star" size={20} color="#FF9800" style={styles.sectionIcon} />
                        <Text style={styles.sectionTitle}>Team Captain</Text>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <MaterialIcons name="email" size={18} color="#3f51b5" style={styles.labelIcon} />
                        Captain Email *
                    </Text>
                    <View style={styles.inputWithButton}>
                        <TextInput
                            style={[styles.input, styles.emailInput, captainData && styles.disabledInput]}
                            value={captainEmail}
                            onChangeText={setCaptainEmail}
                            placeholder="Enter captain email"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!captainData} // Disable input if captain is found
                        />
                        <TouchableOpacity 
                            style={[styles.lookupButton, captainData && styles.resetButton]}
                            onPress={captainData ? () => {
                                setCaptainData(null);
                                setCaptainEmail('');
                            } : handleCaptainLookup}
                            disabled={lookupLoading || (!captainEmail && !captainData)}
                        >
                            {lookupLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <MaterialIcons 
                                        name={captainData ? "close" : "search"} 
                                        size={16} 
                                        color="#fff" 
                                        style={{ marginRight: 4 }} 
                                    />
                                    <Text style={styles.lookupButtonText}>
                                        {captainData ? 'Reset' : 'Lookup'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {captainData && (
                    <View style={styles.userCard}>
                        <View style={styles.userCardHeader}>
                            <MaterialIcons name="person" size={20} color="#3f51b5" style={{ marginRight: 8 }} />
                            <Text style={styles.userName}>{captainData.name}</Text>
                        </View>
                        <View style={styles.userCardContent}>
                            <MaterialIcons name="email" size={16} color="#666" style={{ marginRight: 6 }} />
                            <Text style={styles.userEmail}>{captainData.email}</Text>
                        </View>
                        <View style={styles.captainBadge}>
                            <MaterialIcons name="star" size={14} color="#FFF" style={{ marginRight: 4 }} />
                            <Text style={styles.captainBadgeText}>Captain</Text>
                        </View>
                    </View>
                )}

                {/* Players Section */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <MaterialIcons name="people" size={20} color="#3f51b5" style={styles.sectionIcon} />
                        <Text style={styles.sectionTitle}>Team Players</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={addPlayerField}
                    >
                        <MaterialIcons name="person-add" size={16} color="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.addButtonText}>Add Player</Text>
                    </TouchableOpacity>
                </View>

                {players.map((player, index) => (
                    <View key={index} style={styles.playerCard}>
                        <View style={styles.playerHeader}>
                            <View style={styles.playerNumberContainer}>
                                <MaterialIcons name="sports-handball" size={18} color="#3f51b5" style={{ marginRight: 6 }} />
                                <Text style={styles.playerNumber}>Player {index + 1}</Text>
                            </View>
                            {index > 0 && (
                                <TouchableOpacity 
                                    onPress={() => removePlayerField(index)}
                                    style={styles.removeButton}
                                >
                                    <MaterialIcons name="delete" size={14} color="#FFF" style={{ marginRight: 4 }} />
                                    <Text style={styles.removeButtonText}>Remove</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <MaterialIcons name="email" size={16} color="#3f51b5" style={styles.labelIcon} />
                                Email *
                            </Text>
                            <View style={styles.inputWithButton}>
                                <TextInput
                                    style={[styles.input, styles.emailInput, player.userData && styles.disabledInput]}
                                    value={player.email}
                                    onChangeText={(text) => updatePlayerEmail(index, text)}
                                    placeholder="Enter player email"
                                    placeholderTextColor="#999"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!player.userData} // Disable input if player is found
                                />
                                <TouchableOpacity 
                                    style={[styles.lookupButton, player.userData && styles.resetButton]}
                                    onPress={player.userData ? () => {
                                        // Reset this player's data
                                        const updatedPlayers = [...players];
                                        updatedPlayers[index].email = '';
                                        updatedPlayers[index].userData = null;
                                        updatedPlayers[index].position = '';
                                        updatedPlayers[index].jerseyNumber = '';
                                        setPlayers(updatedPlayers);
                                    } : () => handlePlayerLookup(index)}
                                    disabled={lookupLoading || (!player.email && !player.userData)}
                                >
                                    {lookupLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <MaterialIcons 
                                                name={player.userData ? "close" : "search"} 
                                                size={16} 
                                                color="#fff" 
                                                style={{ marginRight: 4 }} 
                                            />
                                            <Text style={styles.lookupButtonText}>
                                                {player.userData ? 'Reset' : 'Lookup'}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {player.userData && (
                            <View style={styles.userCard}>
                                <View style={styles.userCardHeader}>
                                    <MaterialIcons name="person" size={20} color="#3f51b5" style={{ marginRight: 8 }} />
                                    <Text style={styles.userName}>{player.userData.name}</Text>
                                </View>
                                <View style={styles.userCardContent}>
                                    <MaterialIcons name="email" size={16} color="#666" style={{ marginRight: 6 }} />
                                    <Text style={styles.userEmail}>{player.userData.email}</Text>
                                </View>
                            </View>
                        )}

                        {player.userData && (
                            <View style={styles.playerDetailsRow}>
                                <View style={[styles.inputGroup, styles.halfWidth]}>
                                    <Text style={styles.label}>
                                        <MaterialIcons name="sports" size={16} color="#3f51b5" style={styles.labelIcon} />
                                        Position
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        value={player.position}
                                        onChangeText={(text) => updatePlayerPosition(index, text)}
                                        placeholder="Position"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                                <View style={[styles.inputGroup, styles.halfWidth]}>
                                    <Text style={styles.label}>
                                        <MaterialIcons name="format-list-numbered" size={16} color="#3f51b5" style={styles.labelIcon} />
                                        Jersey #
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        value={player.jerseyNumber}
                                        onChangeText={(text) => updatePlayerJerseyNumber(index, text)}
                                        placeholder="Number"
                                        placeholderTextColor="#999"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                ))}

                {error && (
                    <View style={styles.errorContainer}>
                        <MaterialIcons name="error" size={20} color="#dc3545" style={{ marginRight: 6 }} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.cancelButton]}
                        onPress={onCancel}
                        disabled={loading}
                    >
                        <MaterialIcons name="close" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, styles.submitButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <MaterialIcons name={initialData ? "update" : "check"} size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.buttonText}>
                            {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(240, 245, 255, 0.85)',
    },
    form: {
        padding: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
        fontWeight: '500',
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelIcon: {
        marginRight: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    errorText: {
        color: '#dc3545',
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 40,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Section styles
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionIcon: {
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    // Input with button styles
    inputWithButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emailInput: {
        flex: 1,
        marginRight: 10,
    },
    lookupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3f51b5',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    resetButton: {
        backgroundColor: '#F44336',
    },
    lookupButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#666',
        borderColor: '#ddd',
    },
    // User card styles
    userCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#3f51b5',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    userCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    userCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    userEmail: {
        color: '#666',
    },
    captainBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF9800',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    captainBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // Add button styles
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    // Player card styles
    playerCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    playerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    playerNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playerNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F44336',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    playerDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
});

export default TeamForm;