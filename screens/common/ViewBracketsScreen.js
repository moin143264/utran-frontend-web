import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    // Alert, // Replaced by showAppAlert
    TouchableOpacity,
    Modal,
    StatusBar,
    Dimensions,
    ScrollView,
    Platform // For showAppAlert if not already used
} from 'react-native';
import { showAppAlert } from '../../utils/uiUtils.js';
import { matches } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Bracket from '../../components/Bracket';
import RoleBasedView from '../../components/RoleBasedView';
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

const UpdateScoreModal = ({ match, visible, onClose, onUpdate }) => {
    const [team1Score, setTeam1Score] = useState(match?.team1?.score?.toString() || '0');
    const [team2Score, setTeam2Score] = useState(match?.team2?.score?.toString() || '0');
    const [updating, setUpdating] = useState(false);

    const handleUpdate = async () => {
        if (!team1Score || !team2Score) {
            showAppAlert('Error', 'Please enter scores for both teams');
            return;
        }

        try {
            setUpdating(true);
            await onUpdate({
                team1Score: parseInt(team1Score),
                team2Score: parseInt(team2Score)
            });
            onClose();
        } catch (error) {
            showAppAlert('Error', error.message || 'Failed to update scores');
        } finally {
            setUpdating(false);
        }
    };

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
                        <MaterialCommunityIcons name="scoreboard" size={24} color="#3f51b5" style={{marginRight: 10}} />
                        <Text style={styles.modalTitle}>Update Match Scores</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.scoreInputContainer}>
                        <View style={styles.teamScore}>
                            <View style={styles.teamNameContainer}>
                                <MaterialCommunityIcons name="shield" size={16} color="#3f51b5" style={{marginRight: 6}} />
                                <Text style={styles.teamName}>{match?.team1?.team?.name || 'Team 1'}</Text>
                            </View>
                            <View style={styles.scoreInputWrapper}>
                                <TextInput
                                    style={styles.scoreInput}
                                    value={team1Score}
                                    onChangeText={setTeam1Score}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                        </View>

                        <View style={styles.vsContainer}>
                            <Text style={styles.vs}>VS</Text>
                        </View>

                        <View style={styles.teamScore}>
                            <View style={styles.teamNameContainer}>
                                <MaterialCommunityIcons name="shield" size={16} color="#3f51b5" style={{marginRight: 6}} />
                                <Text style={styles.teamName}>{match?.team2?.team?.name || 'Team 2'}</Text>
                            </View>
                            <View style={styles.scoreInputWrapper}>
                                <TextInput
                                    style={styles.scoreInput}
                                    value={team2Score}
                                    onChangeText={setTeam2Score}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                            disabled={updating}
                        >
                            <MaterialIcons name="cancel" size={18} color="#FFF" style={{marginRight: 8}} />
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.modalButton, styles.updateButton, updating && styles.buttonDisabled]}
                            onPress={handleUpdate}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator size="small" color="#fff" style={{marginRight: 8}} />
                            ) : (
                                <MaterialIcons name="check-circle" size={18} color="#FFF" style={{marginRight: 8}} />
                            )}
                            <Text style={styles.buttonText}>
                                {updating ? 'Updating...' : 'Update'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const ViewBracketsScreen = ({ route, navigation }) => {
    const { competitionId } = route.params;
    const { hasRole } = useAuth();
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [competition, setCompetition] = useState(null);

    useEffect(() => {
        loadMatches();
    }, [competitionId]);

    const loadMatches = async () => {
        try {
            setLoading(true);
            console.log('Loading matches for competition:', competitionId);
            
            // First try to get competition details
            try {
                const compResponse = await competitions.getOne(competitionId);
                console.log('Competition details:', compResponse.data);
                setCompetition(compResponse.data);
            } catch (compError) {
                console.warn('Could not fetch competition details:', compError);
            }
            
            // Then get matches
            const response = await matches.getByCompetition(competitionId);
            console.log('Matches response:', response);
            
            // Handle case where response is already the data array
            const matchesData = Array.isArray(response) ? response : (response.data || []);
            console.log('Processed matches data:', matchesData);
            
            setMatchData(matchesData);
            
            if (matchesData.length === 0) {
                console.log('No matches found for this competition');
                showAppAlert('Info', 'No matches scheduled for this competition yet.');
            }
        } catch (error) {
            console.error('Error loading matches:', error);
            let errorMessage = 'Failed to load matches';
            if (error.response) {
                console.error('Error response:', error.response.data);
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.request) {
                console.error('No response received:', error.request);
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                console.error('Error setting up request:', error.message);
                errorMessage = error.message || errorMessage;
            }
            showAppAlert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleMatchPress = (match) => {
        if (hasRole(['admin', 'organizer']) && match.status !== 'completed') {
            setSelectedMatch(match);
            setModalVisible(true);
        }
    };

    const handleScoreUpdate = async (scores) => {
        try {
            await matches.updateScore(selectedMatch._id, scores);
            await loadMatches();
            showAppAlert('Success', 'Match scores updated successfully');
        } catch (error) {
            throw new Error(error.message || 'Failed to update scores');
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
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#3f51b5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tournament Brackets</Text>
            </View>
            
            <View style={styles.container}>
                {competition && (
                    <View style={styles.competitionInfoCard}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="trophy" size={24} color="#3f51b5" />
                            <Text style={styles.competitionTitle}>{competition.name || 'Tournament'}</Text>
                        </View>
                    </View>
                )}
                
                <RoleBasedView roles={['admin', 'organizer']}>
                    <View style={styles.hintContainer}>
                        <MaterialIcons name="info" size={20} color="#3f51b5" style={{marginRight: 8}} />
                        <Text style={styles.hint}>
                            Tap on a match to update scores
                        </Text>
                    </View>
                </RoleBasedView>

                <ScrollView style={styles.bracketContainer}>
                    <Bracket 
                        matches={matchData}
                        onMatchPress={handleMatchPress}
                    />
                </ScrollView>

                <UpdateScoreModal
                    match={selectedMatch}
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setSelectedMatch(null);
                    }}
                    onUpdate={handleScoreUpdate}
                />
            </View>
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
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    competitionInfoCard: {
        margin: 16,
        marginBottom: 8,
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
    },
    competitionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
    },
    hint: {
        color: '#333',
        fontSize: 14,
        flex: 1,
    },
    bracketContainer: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 8,
        borderRadius: 10,
        padding: 8,
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
        width: '90%',
        maxWidth: 400,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        marginLeft: 'auto',
        padding: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    scoreInputContainer: {
        padding: 16,
    },
    teamScore: {
        marginVertical: 10,
    },
    teamNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    scoreInputWrapper: {
        alignItems: 'center',
    },
    scoreInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        width: '100%',
        fontSize: 18,
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
    },
    vsContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
    vs: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3f51b5',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        width: 40,
        height: 40,
        borderRadius: 20,
        textAlign: 'center',
        textAlignVertical: 'center',
        lineHeight: 40,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#f9f9f9',
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
    updateButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ViewBracketsScreen;