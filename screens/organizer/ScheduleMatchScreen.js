import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Platform } from 'react-native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    // Alert, // Keep for confirmation dialogs
    ActivityIndicator,
    Modal,
    TextInput,
    FlatList,
    StatusBar,
    Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import apiServices from '../../services/api';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
// Access API services directly instead of destructuring
import MatchCard from '../../components/MatchCard';
import { showAppAlert } from '../../utils/uiUtils';

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

const ScheduleModal = ({ visible, onClose, onSubmit, teams, existingMatch = null }) => {
    const [availableTeams2, setAvailableTeams2] = useState(teams);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        team1: '',
        team2: '',
        startTime: new Date(),
        venue: '',
        round: '1'
    });
    
    // Initialize form with existing match data if provided
    useEffect(() => {
        if (existingMatch) {
            console.log('Initializing form with match:', existingMatch);
            const initialData = {
                team1: existingMatch.team1?._id || existingMatch.team1 || '',
                team2: existingMatch.team2?._id || existingMatch.team2 || '',
                startTime: existingMatch.startTime ? new Date(existingMatch.startTime) : new Date(),
                venue: existingMatch.venue || '',
                round: existingMatch.round || '1'
            };
            setFormData(initialData);
            updateAvailableTeams2(initialData.team1);
        } else {
            // Reset form for new match
            setFormData({
                team1: '',
                team2: '',
                startTime: new Date(),
                venue: '',
                round: '1'
            });
            setAvailableTeams2(teams);
        }
    }, [existingMatch, teams]);

    const updateAvailableTeams2 = (team1Id) => {
        if (!team1Id) {
            setAvailableTeams2([]);
            setFormData(prev => ({
                ...prev,
                team2: ''
            }));
        } else {
            const filteredTeams = teams.filter(team => team._id !== team1Id);
            setAvailableTeams2(filteredTeams);
            // Always clear team2 when team1 changes
            setFormData(prev => ({
                ...prev,
                team2: ''
            }));
        }
    };
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        // Only update if the user selected a date (not if they cancelled)
        if (selectedDate && event.type !== 'dismissed') {
            setFormData(prev => ({ ...prev, startTime: selectedDate }));
        }
    };
    
    // Separate Android and iOS date picker implementations
    const showDatePickerModal = () => {
        if (Platform.OS === 'android') {
            // For Android, we'll use the native date picker
            setShowDatePicker(true);
        } else {
            // For iOS, we directly open the date picker
            setShowDatePicker(true);
        }
    };

    const validateForm = () => {
        if (!formData.team1 || !formData.team2) {
            showAppAlert('Error', 'Please select both teams');
            return false;
        }
        if (formData.team1 === formData.team2) {
            showAppAlert('Error', 'Teams must be different');
            return false;
        }
        if (!formData.venue) {
            showAppAlert('Error', 'Please enter a venue');
            return false;
        }
        if (!formData.round) {
            showAppAlert('Error', 'Please enter a round number');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            console.log('Submitting form data:', formData);
            const result = await onSubmit(formData);
            
            if (result) {
                showAppAlert(
                    'Success', 
                    `Match ${existingMatch ? 'updated' : 'scheduled'} successfully`,
                    [{ text: 'OK', onPress: onClose }]
                );
            } else {
                // Keep modal open if submission failed
                setLoading(false);
            }
        } catch (error) {
            console.error('Error in modal submit:', error);
            showAppAlert('Error', error.message || 'Failed to schedule match');
            setLoading(false);
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
                        <Text style={styles.modalTitle}>
                            {existingMatch ? 'Edit Match' : 'Schedule New Match'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Team 1</Text>
                            {teams.length === 0 ? (
                                <Text style={{color: '#666', fontStyle: 'italic', marginVertical: 8}}>
                                    No teams available. Please add teams first.
                                </Text>
                            ) : (
                                <View style={styles.pickerContainer}>
                                    <MaterialCommunityIcons name="account-group" size={20} color="#3f51b5" style={styles.inputIcon} />
                                    <Picker
                                        selectedValue={formData.team1}
                                        style={styles.picker}
                                        onValueChange={(itemValue) => {
                                            setFormData(prev => ({ ...prev, team1: itemValue }));
                                            updateAvailableTeams2(itemValue);
                                        }}
                                    >
                                        <Picker.Item label="Select Team 1" value="" />
                                        {teams
                                            .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                                            .map(team => (
                                            <Picker.Item 
                                                key={team._id}
                                                label={team.name || 'Unnamed Team'}
                                                value={team._id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Team 2</Text>
                            {teams.length === 0 ? (
                                <Text style={{color: '#666', fontStyle: 'italic', marginVertical: 8}}>
                                    No teams available. Please add teams first.
                                </Text>
                            ) : (
                                <View style={[styles.pickerContainer, !formData.team1 && styles.disabledPicker]}>
                                    <MaterialCommunityIcons name="account-group" size={20} color="#3f51b5" style={styles.inputIcon} />
                                    <Picker
                                        selectedValue={formData.team2}
                                        style={styles.picker}
                                        onValueChange={(itemValue) =>
                                            setFormData(prev => ({ ...prev, team2: itemValue }))
                                        }
                                        enabled={!!formData.team1}
                                    >
                                        <Picker.Item 
                                            label={formData.team1 ? "Select Team 2" : "Select Team 1 first"} 
                                            value="" 
                                        />
                                        {availableTeams2
                                            .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                                            .map(team => (
                                                <Picker.Item 
                                                    key={team._id}
                                                    label={team.name || 'Unnamed Team'}
                                                    value={team._id}
                                                />
                                            ))}
                                    </Picker>
                                </View>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Match Time</Text>
                            <TouchableOpacity 
                                style={styles.dateButton}
                                onPress={showDatePickerModal}
                            >
                                <MaterialIcons name="calendar-today" size={20} color="#3f51b5" style={styles.inputIcon} />
                                <Text style={styles.dateButtonText}>
                                    {formData.startTime.toLocaleString()}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={formData.startTime}
                                    mode="datetime"
                                    is24Hour={true}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                />
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Venue</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="location-on" size={20} color="#3f51b5" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.venue}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, venue: text }))}
                                    placeholder="Enter match venue"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Round</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="tournament" size={20} color="#3f51b5" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.round}
                                    onChangeText={(text) => {
                                        // Only allow numbers
                                        const numericValue = text.replace(/[^0-9]/g, '');
                                        setFormData(prev => ({ ...prev, round: numericValue }));
                                    }}
                                    placeholder="Enter round number"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    maxLength={2}
                                />
                            </View>
                        </View>
                    </ScrollView>
                    
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <MaterialIcons name="cancel" size={20} color="#FFF" style={{marginRight: 8}} />
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.modalButton, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" style={{marginRight: 8}} />
                            ) : (
                                <MaterialIcons 
                                    name={existingMatch ? "update" : "add-circle"} 
                                    size={20} 
                                    color="#FFF" 
                                    style={{marginRight: 8}} 
                                />
                            )}
                            <Text style={styles.buttonText}>
                                {loading ? 'Saving...' : existingMatch ? 'Update' : 'Schedule'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const ScheduleMatchScreen = ({ route, navigation }) => {
    const { user } = useAuth();
    const { competitionId } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [competition, setCompetition] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);

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
                return;
            }
            console.log('Loading schedule data for competition:', competitionId);
            
            // Get competition details
            const competitionResponse = await apiServices.competitions.getOne(competitionId);
            console.log('Competition response:', competitionResponse);
            if (!competitionResponse?.data) {
                throw new Error('Failed to fetch competition data');
            }
            
            // Using direct access to the API service
            console.log('Available teams methods:', Object.keys(apiServices.teams));
            
            // Get all teams
            const teamsResponse = await apiServices.teams.getAll();
            console.log('Teams response:', teamsResponse);
            
            if (!teamsResponse?.data) {
                throw new Error('Failed to fetch teams data');
            }
            // No need to filter if we're not getting many teams
            // Just use all available teams for now
            const competitionTeams = teamsResponse.data;
            console.log('Competition teams available:', competitionTeams);
            
            // Try to get matches from the competition's data
            let competitionMatches = [];
            
            // Extract nested matches from competition if they exist
            if (competitionResponse.data && Array.isArray(competitionResponse.data.matches)) {
                competitionMatches = competitionResponse.data.matches;
            } else {
                // Fallback to getting matches directly if not in competition
                try {
                    const matchesResponse = await apiServices.matches.getAll();
                    if (matchesResponse?.data) {
                        competitionMatches = matchesResponse.data.filter(match => 
                            match.competition === competitionId
                        );
                    }
                } catch (matchError) {
                    console.error('Error fetching matches:', matchError);
                }
            }
            
            console.log('Competition matches:', competitionMatches);
            
            // Update state with fetched data
            setCompetition(competitionResponse.data);
            setTeams(competitionTeams);
            setMatches(competitionMatches);
        } catch (error) {
            console.error('Error loading schedule data:', error);
            showAppAlert('Error', 'Failed to load schedule data');
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleMatch = () => {
        if (teams.length < 2) {
            showAppAlert(
                'Not Enough Teams', 
                'You need at least 2 teams to schedule a match.', 
                [
                    {
                        text: 'Add Teams',
                        onPress: () => navigation.navigate('AddTeams', { competitionId })
                    },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
            return;
        }
        setSelectedMatch(null);
        setShowModal(true);
    };

    const handleEditMatch = (match) => {
        setSelectedMatch(match);
        setShowModal(true);
    };

    const handleDeleteMatch = (match) => {
        showAppAlert(
            'Confirm Delete',
            'Are you sure you want to delete this match?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiServices.matches.delete(match._id);
                            await loadData();
                            showAppAlert('Success', 'Match deleted successfully');
                        } catch (error) {
                            showAppAlert('Error', 'Failed to delete match');
                        }
                    }
                }
            ]
        );
    };

    const handleSubmit = async (formData) => {
        try {
            console.log('Submitting match form:', formData);
            
            // Get the next match number
            const nextMatchNumber = matches.length + 1;
            
            // Prepare match data with all required fields
            const matchData = {
                competitionId: competitionId,  // Required: Competition ID
                team1Id: formData.team1,      // Required: Team 1 ID
                team2Id: formData.team2,      // Required: Team 2 ID
                matchNumber: nextMatchNumber,  // Required: Match number
                round: parseInt(formData.round) || 1,  // Required: Round number
                startTime: formData.startTime.toISOString(),
                venue: formData.venue,
                status: 'scheduled'
            };
            
            console.log('Prepared match data:', matchData);
            
            if (selectedMatch) {
                // Update existing match
                console.log('Updating match:', selectedMatch._id);
                const response = await apiServices.matches.update(selectedMatch._id, matchData);
                console.log('Match update response:', response);
            } else {
                // Create new match
                console.log('Creating new match');
                const response = await apiServices.matches.create(matchData);
                console.log('Match create response:', response);
            }
            
            await loadData();
            return true;
        } catch (error) {
            console.error('Error saving match:', error);
            showAppAlert('Error', error.message || 'Failed to update match');
            return false;
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
                <Text style={styles.headerTitle}>Schedule Matches</Text>
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
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="tournament" size={24} color="#3f51b5" />
                            <Text style={styles.title}>{competition?.name || 'Competition'}</Text>
                        </View>
                        
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <MaterialIcons name="sports" size={16} color="#3f51b5" />
                                <Text style={styles.statValue}>
                                    {matches.length} Matches
                                </Text>
                            </View>
                            
                            <View style={styles.statItem}>
                                <FontAwesome5 name="users" size={16} color="#3f51b5" />
                                <Text style={styles.statValue}>
                                    {teams.length} Teams
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={handleScheduleMatch}
                    >
                        <MaterialIcons name="add-circle" size={20} color="#FFF" style={{marginRight: 8}} />
                        <Text style={styles.addButtonText}>Schedule New Match</Text>
                    </TouchableOpacity>

                    {matches.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="whistle" size={60} color="#3f51b5" style={{opacity: 0.5, marginBottom: 20}} />
                            <Text style={styles.emptyText}>No matches scheduled yet</Text>
                            <Text style={styles.emptySubText}>Schedule matches to start the competition</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={matches}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <MatchCard
                                    match={item}
                                    onEdit={() => handleEditMatch(item)}
                                    onDelete={() => handleDeleteMatch(item)}
                                />
                            )}
                            contentContainerStyle={styles.listContainer}
                        />
                    )}

                    {teams.length > 0 ? (
                        <ScheduleModal
                            visible={showModal}
                            teams={teams}
                            existingMatch={selectedMatch}
                            onClose={() => {
                                setShowModal(false);
                                setSelectedMatch(null);
                            }}
                            onSubmit={handleSubmit}
                        />
                    ) : (
                        <Modal
                            visible={showModal}
                            transparent
                            animationType="slide"
                            onRequestClose={() => setShowModal(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>No Teams Available</Text>
                                        <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                                            <MaterialIcons name="close" size={24} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <View style={styles.modalScrollContent}>
                                        <MaterialCommunityIcons name="account-group-outline" size={60} color="#3f51b5" style={{opacity: 0.5, alignSelf: 'center', marginVertical: 20}} />
                                        <Text style={{textAlign: 'center', marginVertical: 20, fontSize: 16, color: '#666'}}>
                                            You need to add teams to this competition before scheduling matches.
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity 
                                            style={[styles.modalButton, styles.cancelButton]}
                                            onPress={() => setShowModal(false)}
                                        >
                                            <MaterialIcons name="cancel" size={20} color="#FFF" style={{marginRight: 8}} />
                                            <Text style={styles.buttonText}>Cancel</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={[styles.modalButton, styles.submitButton]}
                                            onPress={() => {
                                                setShowModal(false);
                                                navigation.navigate('AddTeams', { competitionId });
                                            }}
                                        >
                                            <FontAwesome5 name="users" size={16} color="#FFF" style={{marginRight: 8}} />
                                            <Text style={styles.buttonText}>Add Teams</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
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
    },    competitionInfoCard: {
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
    listContainer: {
        padding: 8,
        paddingBottom: 24,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '90%',
        maxWidth: 400,
        maxHeight: '90%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        padding: 4,
    },
    modalScroll: {
        maxHeight: '80%',
    },
    modalScrollContent: {
        padding: 24,
        paddingBottom: 32,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
        marginBottom: 8,
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
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        overflow: 'hidden',
    },
    disabledPicker: {
        opacity: 0.6,
        backgroundColor: '#f0f0f0',
    },
    picker: {
        flex: 1,
        height: 50,
        color: '#333',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
    },
    dateButtonText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
        borderRadius: 8,
        marginHorizontal: 8,
        elevation: 2,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    buttonText: {
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
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    }
});

export default ScheduleMatchScreen;