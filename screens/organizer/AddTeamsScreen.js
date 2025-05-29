import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    // Alert, // Keep for confirmation dialogs
    ActivityIndicator,
    FlatList,
    StatusBar,
    Dimensions,
    Platform // For showAppAlert if not already used
} from 'react-native';
import { showAppAlert } from '../../utils/uiUtils.js';
import { useAuth } from '../../context/AuthContext';
import apiServices from '../../services/api';
const { competitions, teams } = apiServices;
import TeamForm from '../../components/TeamForm';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

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

const TeamCard = ({ team, onEdit, onDelete, competitionName }) => {
    if (!team) return null;
    
    // Get number of players safely
    const playerCount = team.players && Array.isArray(team.players) ? team.players.length : 0;
    
    return (
        <View style={styles.teamCard}>
            <View style={styles.teamCardContent}>
                <View style={styles.teamCardHeader}>
                    <MaterialCommunityIcons name="account-group" size={24} color="#3f51b5" style={styles.teamIcon} />
                    <Text style={styles.teamName}>{team.name || 'Unnamed Team'}</Text>
                </View>
                
                <View style={styles.teamDetailsContainer}>
                    <View style={styles.teamDetail}>
                        <FontAwesome5 name="user-tie" size={14} color="#666" />
                        <Text style={styles.teamDetailText}>
                            Captain: {team.captain && team.captain.name ? team.captain.name : 'Not assigned'}
                        </Text>
                    </View>
                    
                    <View style={styles.teamDetail}>
                        <FontAwesome5 name="users" size={14} color="#666" />
                        <Text style={styles.teamDetailText}>
                            Members: {playerCount}
                        </Text>
                    </View>
                    
                    {competitionName && (
                        <View style={styles.teamDetail}>
                            <FontAwesome5 name="trophy" size={14} color="#4CAF50" />
                            <Text style={[styles.teamDetailText, {color: '#4CAF50'}]}>
                                {competitionName}
                            </Text>
                        </View>
                    )}
                </View>
                
                <View style={styles.teamCardFooter}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => onEdit(team)}
                    >
                        <FontAwesome5 name="edit" size={14} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => onDelete(team)}
                    >
                        <FontAwesome5 name="trash-alt" size={14} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const AddTeamsScreen = ({ route, navigation }) => {
    const { competitionId } = route.params || {};
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [competition, setCompetition] = useState(null);
    const [teamList, setTeamList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    useEffect(() => {
        if (competitionId) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [competitionId]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (!competitionId) {
                setTeamList([]);
                return;
            }
            // Get competition data
            const competitionData = await competitions.getOne(competitionId);
            const competition = competitionData.data;
            
            // Check if we got valid competition data
            if (!competition) {
                throw new Error('Competition data not found');
            }
            
            setCompetition(competition);

            // Get competition's registered teams
            if (!competition.teams || !competition.teams.length) {
                setTeamList([]);
                return;
            }
            
            try {
                // Get full team details for registered teams
                
                // Make sure we're using string IDs
                const teamPromises = competition.teams.map(teamId => {
                    // Handle case where teamId might be an object
                    const id = typeof teamId === 'object' && teamId._id ? teamId._id : teamId;
                    return teams.getOne(id.toString());
                });
                
                const teamResponses = await Promise.all(teamPromises);
                const teamsData = teamResponses
                    .map(response => response.data)
                    .filter(team => team); // Remove any null/undefined teams
                
                setTeamList(teamsData);
            } catch (teamError) {
                console.error('Error loading teams:', teamError);
                // Continue with empty team list rather than failing completely
                setTeamList([]);
            }
        } catch (error) {
            console.error('Load data error:', error);
            // More detailed error message
            showAppAlert('Error', `Failed to load data: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeam = () => {
        if (teamList.length >= competition.maxTeams) {
            showAppAlert('Error', 'Maximum number of teams reached');
            return;
        }
        setSelectedTeam(null);
        setShowForm(true);
    };

    const handleEditTeam = (team) => {
        // Create a clean version of the team with only the necessary properties
        const cleanTeam = {
            _id: team._id,
            name: team.name || '',
            description: team.description || '',
            // Pass the full populated captain object from the fetched team data
            captain: team.captain && typeof team.captain === 'object' ? team.captain : null, 
            players: team.players && Array.isArray(team.players) ? team.players.map(p => ({
                ...p,
                user: p.user // p.user is already populated { _id, name, email }
            })) : [] 
        };
        setSelectedTeam(cleanTeam);
        setShowForm(true);
    };

    const handleDeleteTeam = (team) => {
        showsAppAlert(
            'Confirm Delete',
            `Are you sure you want to delete ${team.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await teams.delete(team._id);
                            await loadData();
                            showAppAlert('Success', 'Team deleted successfully');
                        } catch (error) {
                            showAppAlert('Error', 'Failed to delete team');
                        }
                    }
                }
            ]
        );
    };

    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            
            // Now formData comes directly from the form, not from API response
            if (selectedTeam) {
                // For updates, we need the team ID
                await teams.update(selectedTeam._id, { ...formData, competitionId: competitionId });
            } else {
                // For new teams, just add the competition ID
                await teams.create({ ...formData, competitionId: competitionId });
            }
            
            // Close the form first
            setShowForm(false);
            
            // Then reload the data (which should include the new/updated team)
            await loadData();
            
            // Only then show the success message
            showAppAlert('Success', `Team ${selectedTeam ? 'updated' : 'added'} successfully`);
        } catch (error) {
            showAppAlert('Error', error.message || `Failed to ${selectedTeam ? 'update' : 'add'} team`);
        } finally {
            setLoading(false);
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

    if (showForm) {
        return (
            <TeamForm
                initialData={selectedTeam}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
            />
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
                <Text style={styles.headerTitle}>Manage Teams</Text>
            </View>
            
            {!competitionId ? (
                <View style={styles.noCompetitionContainer}>
                    <MaterialCommunityIcons name="trophy-broken" size={60} color="#3f51b5" style={{opacity: 0.5, marginBottom: 20}} />
                    <Text style={styles.noCompetitionText}>Please select a competition first</Text>
                    <TouchableOpacity 
                        style={styles.selectCompetitionButton}
                        onPress={() => navigation.goBack()}
                    >
                        <FontAwesome5 name="arrow-left" size={16} color="#FFF" style={{marginRight: 8}} />
                        <Text style={styles.selectCompetitionButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.container}>
                    <View style={styles.competitionInfoCard}>
                        <Text style={styles.title}>{competition?.name}</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <FontAwesome5 name="users" size={18} color="#3f51b5" />
                                <Text style={styles.statValue}>{teamList.length} / {competition?.maxTeams}</Text>
                                <Text style={styles.statLabel}>Teams</Text>
                            </View>
                            
                            <View style={styles.statItem}>
                                <FontAwesome5 name="calendar-alt" size={18} color="#3f51b5" />
                                <Text style={styles.statValue}>{new Date(competition?.startDate).toLocaleDateString()}</Text>
                                <Text style={styles.statLabel}>Start Date</Text>
                            </View>
                            
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons name="trophy" size={18} color="#3f51b5" />
                                <Text style={styles.statValue}>{competition?.sport}</Text>
                                <Text style={styles.statLabel}>Sport</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={handleAddTeam}
                    >
                        <FontAwesome5 name="plus" size={16} color="#FFF" style={{marginRight: 8}} />
                        <Text style={styles.addButtonText}>Add New Team</Text>
                    </TouchableOpacity>

                    {teamList.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="account-group" size={60} color="#3f51b5" style={{opacity: 0.5, marginBottom: 20}} />
                            <Text style={styles.emptyText}>No teams added yet</Text>
                            <Text style={styles.emptySubText}>Add teams to participate in this competition</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={teamList}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TeamCard
                                    team={item}
                                    competitionName={competition?.name}
                                    onEdit={handleEditTeam}
                                    onDelete={handleDeleteTeam}
                                />
                            )}
                            contentContainerStyle={styles.listContainer}
                        />
                    )}
                </View>
            )}
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
    competitionInfoCard: {
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    listContainer: {
        padding: 8,
        paddingBottom: 24,
    },
    teamCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 12,
        marginVertical: 8,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    teamCardContent: {
        padding: 16,
    },
    teamCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    teamIcon: {
        marginRight: 8,
    },
    teamName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    teamDetailsContainer: {
        marginBottom: 12,
    },
    teamDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    teamDetailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    teamCardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginLeft: 8,
    },
    buttonIcon: {
        marginRight: 6,
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        margin: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    noCompetitionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noCompetitionText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    selectCompetitionButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
        width: '80%',
    },
    selectCompetitionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        fontWeight: '500',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    }
});

export default AddTeamsScreen;