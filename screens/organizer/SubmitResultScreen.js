import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    // Alert, // Keep for dialogs with custom actions
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Dimensions
} from 'react-native';
import { showAppAlert } from '../../utils/uiUtils.js';
import { matches } from '../../services/api';
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

const SubmitResultScreen = ({ route, navigation }) => {
    const { matchId } = route.params;
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [match, setMatch] = useState(null);
    const [scores, setScores] = useState({
        team1Score: '',
        team2Score: ''
    });
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadMatch();
    }, [matchId]);

    const loadMatch = async () => {
        try {
            setLoading(true);
            const response = await matches.getById(matchId);
            setMatch(response.data);
            
            // Pre-fill existing scores if any
            if (response.data.team1Score !== undefined) {
                setScores({
                    team1Score: response.data.team1Score.toString(),
                    team2Score: response.data.team2Score.toString()
                });
            }
            if (response.data.notes) {
                setNotes(response.data.notes);
            }
        } catch (error) {
            showAppAlert('Error', 'Failed to load match details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const validateScores = () => {
        const team1Score = parseInt(scores.team1Score);
        const team2Score = parseInt(scores.team2Score);

        if (isNaN(team1Score) || isNaN(team2Score)) {
            showAppAlert('Error', 'Please enter valid scores for both teams');
            return false;
        }

        if (team1Score < 0 || team2Score < 0) {
            showAppAlert('Error', 'Scores cannot be negative');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateScores()) return;

        try {
            setSubmitting(true);
            const team1Score = parseInt(scores.team1Score);
            const team2Score = parseInt(scores.team2Score);

            await matches.updateResult(matchId, {
                team1Score,
                team2Score,
                winner: team1Score > team2Score ? match.team1._id : 
                        team2Score > team1Score ? match.team2._id : null,
                status: 'completed',
                notes: notes.trim()
            });

            showsAppAlert(
                'Success',
                'Match result submitted successfully',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            showAppAlert('Error', 'Failed to submit match result');
        } finally {
            setSubmitting(false);
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
                <Text style={styles.headerTitle}>Submit Match Result</Text>
            </View>
            
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.matchInfoCard}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="whistle" size={24} color="#3f51b5" />
                            <Text style={styles.matchTitle}>{match?.competition?.name || 'Match'}</Text>
                        </View>
                        <Text style={styles.matchDetails}>
                            Round {match?.round} - {new Date(match?.startTime).toLocaleDateString()}
                        </Text>
                    </View>

                    <View style={styles.teamsContainer}>
                        <View style={styles.teamSection}>
                            <View style={styles.teamNameContainer}>
                                <MaterialCommunityIcons name="shield" size={20} color="#3f51b5" style={{marginRight: 8}} />
                                <Text style={styles.teamName}>{match?.team1?.name || 'Team 1'}</Text>
                            </View>
                            <View style={styles.scoreInputContainer}>
                                <TextInput
                                    style={styles.scoreInput}
                                    value={scores.team1Score}
                                    onChangeText={(value) => setScores(prev => ({ ...prev, team1Score: value }))}
                                    keyboardType="number-pad"
                                    placeholder="Score"
                                    maxLength={3}
                                />
                            </View>
                        </View>

                        <View style={styles.vsContainer}>
                            <Text style={styles.vsText}>VS</Text>
                        </View>

                        <View style={styles.teamSection}>
                            <View style={styles.teamNameContainer}>
                                <MaterialCommunityIcons name="shield" size={20} color="#3f51b5" style={{marginRight: 8}} />
                                <Text style={styles.teamName}>{match?.team2?.name || 'Team 2'}</Text>
                            </View>
                            <View style={styles.scoreInputContainer}>
                                <TextInput
                                    style={styles.scoreInput}
                                    value={scores.team2Score}
                                    onChangeText={(value) => setScores(prev => ({ ...prev, team2Score: value }))}
                                    keyboardType="number-pad"
                                    placeholder="Score"
                                    maxLength={3}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.notesSection}>
                        <View style={styles.notesHeader}>
                            <MaterialIcons name="notes" size={20} color="#3f51b5" style={{marginRight: 8}} />
                            <Text style={styles.notesLabel}>Match Notes (Optional)</Text>
                        </View>
                        <View style={styles.notesInputContainer}>
                            <TextInput
                                style={styles.notesInput}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Enter any additional notes about the match"
                                multiline
                                numberOfLines={4}
                                maxLength={500}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" size="small" style={{marginRight: 8}} />
                        ) : (
                            <MaterialIcons name="check-circle" size={24} color="#fff" style={{marginRight: 8}} />
                        )}
                        <Text style={styles.submitButtonText}>
                            {submitting ? 'Submitting...' : 'Submit Result'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    matchInfoCard: {
        marginBottom: 24,
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
        marginBottom: 8,
    },
    matchTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    matchDetails: {
        fontSize: 16,
        color: '#666',
    },
    teamsContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    teamSection: {
        marginVertical: 12,
    },
    teamNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    teamName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    vsContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
    vsText: {
        fontSize: 20,
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
    scoreInputContainer: {
        alignItems: 'center',
    },
    scoreInput: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        backgroundColor: '#f9f9f9',
    },
    notesSection: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    notesLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    notesInputContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    notesInput: {
        padding: 12,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        marginBottom: 30,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default SubmitResultScreen;