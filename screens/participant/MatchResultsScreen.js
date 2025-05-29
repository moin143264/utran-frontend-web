import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    StatusBar
} from 'react-native';
import { competitions, matches } from '../../services/api';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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

const MatchCard = ({ match }) => {
    const getStatusColor = () => {
        switch (match.status) {
            case 'completed':
                return '#4CAF50';
            case 'ongoing':
                return '#2196F3';
            case 'scheduled':
                return '#FFC107';
            default:
                return '#9E9E9E';
        }
    };

    const getWinnerStyle = (teamId) => {
        if (match.status !== 'completed') return {};
        const isWinner = match.winner === teamId;
        return isWinner ? styles.winnerText : {};
    };

    return (
        <View style={styles.matchCardContainer}>
            <View style={[styles.matchCard, { borderLeftColor: getStatusColor() }]}>
                <View style={styles.matchHeader}>
                    <View style={styles.roundContainer}>
                        <FontAwesome5 name="flag-checkered" size={14} color="#555" style={styles.inlineIcon} />
                        <Text style={styles.roundText}>Round {match.round}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                        <Text style={styles.statusText}>
                            {match.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.teamsContainer}>
                    <View style={styles.teamContainer}>
                        <View style={styles.teamIconContainer}>
                            <FontAwesome5 name="users" size={16} color={getWinnerStyle(match.team1?.team).color || '#555'} />
                        </View>
                        <Text style={[styles.teamName, getWinnerStyle(match.team1?.team)]}>
                        {`Team ${match.team1?.name || match.team1?.team?.name || '1'}`}
                        </Text>
                        {match.status === 'completed' && (
                            <Text style={styles.score}>{match.team1?.score}</Text>
                        )}
                    </View>

                    <View style={styles.vsContainer}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>

                    <View style={styles.teamContainer}>
                        <View style={styles.teamIconContainer}>
                            <FontAwesome5 name="users" size={16} color={getWinnerStyle(match.team2?.team).color || '#555'} />
                        </View>
                        <Text style={[styles.teamName, getWinnerStyle(match.team2?.team)]}>
                        {`Team ${match.team2?.name || match.team2?.team?.name || '2'}`}
                        </Text>
                        {match.status === 'completed' && (
                            <Text style={styles.score}>{match.team2?.score}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.matchFooter}>
                    <View style={styles.matchDetailRow}>
                        <Ionicons name="time-outline" size={14} color="#666" style={styles.inlineIcon} />
                        <Text style={styles.matchDetails}>
                            {new Date(match.startTime).toLocaleString()}
                        </Text>
                    </View>
                    <View style={styles.matchDetailRow}>
                        <Ionicons name="location-outline" size={14} color="#666" style={styles.inlineIcon} />
                        <Text style={styles.matchDetails}>
                            {match.venue}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const MatchResultsScreen = ({ route, navigation }) => {
    const { competitionId } = route.params;
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [competition, setCompetition] = useState(null);
    const [matchList, setMatchList] = useState([]);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        console.log('[MatchResultsScreen.js] loadData triggered. Competition ID:', competitionId); 
        try {
            console.log('[MatchResultsScreen.js] Attempting to fetch competition and matches data using Promise.all.');
            console.log(`[MatchResultsScreen.js] competitionId for competitions.getOne: ${competitionId}`);
            console.log(`[MatchResultsScreen.js] competitionId for matches.getByCompetition: ${competitionId}`);

            const [competitionData, matchesDataResponse] = await Promise.all([
                competitions.getOne(competitionId),
                matches.getByCompetition(competitionId) 
            ]);

            console.log('[MatchResultsScreen.js] Fetched competitionData:', competitionData);
            console.log('[MatchResultsScreen.js] Fetched matchesDataResponse:', matchesDataResponse);

            if (competitionData && competitionData.data) {
                setCompetition(competitionData.data);
            } else {
                console.error('[MatchResultsScreen.js] Failed to get competition data or data.data is missing');
                // setError('Failed to load competition details.'); // Optionally set error
            }

            if (matchesDataResponse) { // matchesDataResponse is the actual data or an empty array from api.js
                // Sort matches by round and start time
                const sortedMatches = matchesDataResponse.sort((a, b) => {
                    if (a.round !== b.round) {
                        return a.round - b.round;
                    }
                    return new Date(a.startTime) - new Date(b.startTime);
                });
                setMatchList(sortedMatches);
                console.log('[MatchResultsScreen.js] Successfully processed and set matchList:', sortedMatches);
            } else {
                // This case should ideally be handled by the error catch or if getByCompetition returns null explicitly
                console.log('[MatchResultsScreen.js] matchesDataResponse is null or undefined - this might indicate an issue.');
                setMatchList([]); // Set to empty list if no matches
            }

        } catch (err) {
            console.error('[MatchResultsScreen.js] Error in loadData:', err);
            // Alert.alert('Error', 'Failed to load match results'); // Original alert
            setError(`Failed to load match results: ${err.message}`); // More specific error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [competitionId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <View style={styles.backgroundContainer}>
                <SportsIconsBackground />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF5722" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.backgroundContainer}>
            <StatusBar backgroundColor="rgba(63, 81, 181, 0.8)" barStyle="light-content" />
            <SportsIconsBackground />
            <ScrollView 
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#FF5722']}
                    />
                }
            >
                <View style={styles.headerGradient}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{competition?.name || 'Match Results'}</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        <FontAwesome5 name="trophy" size={14} color="#E0E0E0" style={styles.inlineIcon} />
                        {' '}{competition?.sport || 'Sport'} Tournament
                    </Text>
                </View>

                <View style={styles.content}>
                    {matchList.length > 0 ? (
                        matchList.map(match => (
                            <MatchCard key={match._id} match={match} />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No matches found for this competition.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    backgroundContainer: {
        flex: 1,
        backgroundColor: 'rgba(240, 245, 255, 0.85)', // Light blue background to match ParticipantHome
        position: 'relative',
        zIndex: 1, // Ensure content is above background but below icons
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent', // Fully transparent to show emojis
        zIndex: 2, // Ensure content is above background and icons
        paddingTop: 15, // Add padding at the top of the main container
    },
    iconsBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none', // Allow touch events to pass through
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    headerGradient: {
        paddingTop: 30,
        paddingBottom: 25,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(63, 81, 181, 0.8)', // Indigo blue for light theme
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 15,
        marginTop: 10, // Add more space at the top
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        fontSize: 16,
        color: '#ffffff',
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        padding: 15,
    },
    matchCardContainer: {
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4.5,
    },
    matchCard: {
        borderRadius: 12,
        borderLeftWidth: 4,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(63, 81, 181, 0.1)',
        backgroundColor: 'rgba(63, 81, 181, 0.08)',
    },
    roundContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roundText: {
        fontSize: 14,
        color: '#444',
        fontWeight: '600',
        marginLeft: 5,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        overflow: 'hidden',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 0,
        padding: 15,
        backgroundColor: 'rgba(63, 81, 181, 0.03)',
    },
    teamContainer: {
        flex: 1,
        alignItems: 'center',
    },
    teamIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(63, 81, 181, 0.2)',
    },
    teamName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        textAlign: 'center',
    },
    winnerText: {
        color: '#FF5722',
        fontWeight: 'bold',
        textShadowColor: 'rgba(255, 87, 34, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    vsContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        backgroundColor: '#3f51b5',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    vsText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    matchFooter: {
        marginTop: 0,
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: 'rgba(63, 81, 181, 0.03)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(63, 81, 181, 0.1)',
    },
    matchDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    inlineIcon: {
        marginRight: 6,
    },
    matchDetails: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: 'rgba(63, 81, 181, 0.15)',
        borderRadius: 20,
        marginTop: 15,
        borderWidth: 1,
        borderColor: 'rgba(63, 81, 181, 0.3)',
    },
    emptyText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default MatchResultsScreen;
