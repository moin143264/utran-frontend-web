import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert, // Keep for dialogs with custom actions
    Dimensions,
    TouchableOpacity,
    StatusBar,
    Platform // For showAppAlert if not already used
} from 'react-native';
import { showAppAlert } from '../../utils/uiUtils.js';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import apiServices from '../../services/api';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const { competitions, matches: matchesApi } = apiServices;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MATCH_WIDTH = 120;
const MATCH_HEIGHT = 60;
const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 40;

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

const Match = ({ match, x, y, onPress }) => {
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

    return (
        <TouchableOpacity onPress={() => onPress(match)}>
            <Rect
                x={x}
                y={y}
                width={MATCH_WIDTH}
                height={MATCH_HEIGHT}
                fill="#fff"
                stroke={getStatusColor()}
                strokeWidth="2"
                rx="8"
                ry="8"
                opacity="0.95"
            />
            <SvgText
                x={x + MATCH_WIDTH / 2}
                y={y + 15}
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                fill="#333"
            >
                {match.team1?.name || 'TBD'}
            </SvgText>
            <Line
                x1={x + 10}
                y1={y + MATCH_HEIGHT/2}
                x2={x + MATCH_WIDTH - 10}
                y2={y + MATCH_HEIGHT/2}
                stroke="#eee"
                strokeWidth="1"
            />
            <SvgText
                x={x + MATCH_WIDTH / 2}
                y={y + 35}
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                fill="#333"
            >
                {match.team2?.name || 'TBD'}
            </SvgText>
            {match.status === 'completed' && (
                <>
                    <SvgText
                        x={x + MATCH_WIDTH - 20}
                        y={y + 15}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill={match.team1Score > match.team2Score ? "#4CAF50" : "#333"}
                    >
                        {match.team1Score}
                    </SvgText>
                    <SvgText
                        x={x + MATCH_WIDTH - 20}
                        y={y + 35}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill={match.team2Score > match.team1Score ? "#4CAF50" : "#333"}
                    >
                        {match.team2Score}
                    </SvgText>
                </>
            )}
        </TouchableOpacity>
    );
};

const BracketViewScreen = ({ route, navigation }) => {
    
    // Safely extract parameters
    const params = route?.params || {};
    const competitionId = params.competitionId;
    
    
    // Validate competition ID
    if (!competitionId) {
      console.error('Error: Missing competition ID');
      showsAppAlert("Error", "No competition ID provided", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
      return null;
    }

    const [loading, setLoading] = useState(true);
    const [competition, setCompetition] = useState(null);
    const [matches, setMatches] = useState([]);
    const [bracketHeight, setBracketHeight] = useState(0);

    useEffect(() => {
        loadData();
    }, [competitionId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [competitionData, matchesData] = await Promise.all([
                competitions.getOne(competitionId),
                matchesApi.getAll({ competition: competitionId })
            ]);
            setCompetition(competitionData.data);
            
            // Sort matches by round and position
            const sortedMatches = matchesData.data.sort((a, b) => {
                if (a.round !== b.round) return a.round - b.round;
                return a.position - b.position;
            });
            setMatches(sortedMatches);

            // Calculate bracket height
            const maxRound = Math.max(...sortedMatches.map(m => m.round));
            const matchesInFirstRound = sortedMatches.filter(m => m.round === 1).length;
            const height = matchesInFirstRound * (MATCH_HEIGHT + VERTICAL_GAP);
            setBracketHeight(height);
        } catch (error) {
            console.error('Error loading bracket data:', error);
            showAppAlert('Error', error.response?.data?.message || 'Failed to load bracket data');
        } finally {
            setLoading(false);
        }
    };

    const handleMatchPress = (match) => {
        if (match.status === 'completed') {
            navigation.navigate('MatchDetails', { matchId: match._id });
        } else if (match.status === 'scheduled') {
            navigation.navigate('SubmitResult', { matchId: match._id });
        }
    };

    const renderBracket = () => {
        const maxRound = Math.max(...matches.map(m => m.round));
        const connections = [];

        // Draw connections between matches
        matches.forEach(match => {
            if (match.nextMatchId) {
                const nextMatch = matches.find(m => m._id === match.nextMatchId);
                if (nextMatch) {
                    const startX = match.x + MATCH_WIDTH;
                    const startY = match.y + MATCH_HEIGHT / 2;
                    const endX = nextMatch.x;
                    const endY = nextMatch.y + MATCH_HEIGHT / 2;

                    connections.push(
                        <Line
                            key={`${match._id}-${nextMatch._id}`}
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke="#3f51b5"
                            strokeWidth="1.5"
                            strokeDasharray="4,2"
                        />
                    );
                }
            }
        });

        return (
            <ScrollView
                horizontal
                style={styles.bracketContainer}
                contentContainerStyle={{
                    width: maxRound * (MATCH_WIDTH + HORIZONTAL_GAP),
                    height: bracketHeight + 40, // Add some buffer
                }}
            >
                <Svg width="100%" height={bracketHeight + 40}>
                    {connections}
                    {matches.map((match) => (
                        <Match
                            key={match._id}
                            match={match}
                            x={match.x}
                            y={match.y}
                            onPress={handleMatchPress}
                        />
                    ))}
                </Svg>
            </ScrollView>
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
                <Text style={styles.headerTitle}>Tournament Bracket</Text>
            </View>
            
            <View style={styles.competitionInfoCard}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="tournament" size={24} color="#3f51b5" />
                    <Text style={styles.title}>{competition?.name || 'Tournament'}</Text>
                </View>
                
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <FontAwesome5 name="users" size={16} color="#3f51b5" />
                        <Text style={styles.statValue}>{competition?.teams?.length || 0} Teams</Text>
                    </View>
                    
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="trophy" size={16} color="#3f51b5" />
                        <Text style={styles.statValue}>{competition?.sport || 'Sport'}</Text>
                    </View>
                </View>
            </View>

            {matches.length > 0 ? (
                <>
                    <View style={styles.bracketLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                            <Text style={styles.legendText}>Completed</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
                            <Text style={styles.legendText}>Ongoing</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
                            <Text style={styles.legendText}>Scheduled</Text>
                        </View>
                    </View>
                    <Text style={styles.instruction}>Scroll horizontally to view the full bracket</Text>
                    {renderBracket()}
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="trophy-broken" size={60} color="#3f51b5" style={{opacity: 0.5, marginBottom: 20}} />
                    <Text style={styles.emptyText}>
                        No matches have been scheduled yet
                    </Text>
                    <Text style={styles.emptySubText}>
                        Matches will appear here once they're created
                    </Text>
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
    bracketLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginBottom: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 4,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
    },
    instruction: {
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    bracketContainer: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        margin: 8,
        borderRadius: 8,
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
        textAlign: 'center',
        fontWeight: '500',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default BracketViewScreen;