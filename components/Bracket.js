import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const BracketNode = ({ match, onPress }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return '#FF9800'; // Orange
            case 'in_progress': return '#4CAF50'; // Green
            case 'completed': return '#3f51b5'; // Indigo blue
            case 'cancelled': return '#F44336'; // Red
            default: return '#9E9E9E'; // Gray
        }
    };
    
    const getStatusIcon = (status) => {
        switch (status) {
            case 'scheduled': return 'schedule';
            case 'in_progress': return 'sports';
            case 'completed': return 'check-circle';
            case 'cancelled': return 'cancel';
            default: return 'help-outline';
        }
    };

    const statusColor = getStatusColor(match.status);
    const statusIcon = getStatusIcon(match.status);
    
    const team1Winner = match.team1?.score > match.team2?.score && match.status === 'completed';
    const team2Winner = match.team2?.score > match.team1?.score && match.status === 'completed';

    return (
        <View style={[styles.matchNode, { borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
            <View style={styles.matchHeader}>
                <MaterialCommunityIcons name="tournament" size={18} color={statusColor} />
                <Text style={[styles.matchStatus, { color: statusColor }]}>
                    {match.status?.charAt(0).toUpperCase() + match.status?.slice(1).replace('_', ' ')}
                </Text>
                <MaterialIcons name={statusIcon} size={18} color={statusColor} />
            </View>
            
            <View style={styles.teamContainer}>
                <View style={[styles.teamInfo, team1Winner && styles.winnerTeam]}>
                    <MaterialIcons 
                        name={team1Winner ? 'emoji-events' : 'sports-handball'} 
                        size={16} 
                        color={team1Winner ? '#FFC107' : '#757575'} 
                        style={styles.teamIcon}
                    />
                    <Text style={[styles.teamName, team1Winner && styles.winnerText]}>
                        {match.team1?.team?.name || 'TBD'}
                    </Text>
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={[styles.score, team1Winner && styles.winnerScore]}>
                        {match.team1?.score || 0}
                    </Text>
                </View>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.teamContainer}>
                <View style={[styles.teamInfo, team2Winner && styles.winnerTeam]}>
                    <MaterialIcons 
                        name={team2Winner ? 'emoji-events' : 'sports-handball'} 
                        size={16} 
                        color={team2Winner ? '#FFC107' : '#757575'} 
                        style={styles.teamIcon}
                    />
                    <Text style={[styles.teamName, team2Winner && styles.winnerText]}>
                        {match.team2?.team?.name || 'TBD'}
                    </Text>
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={[styles.score, team2Winner && styles.winnerScore]}>
                        {match.team2?.score || 0}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const Round = ({ matches, roundNumber, onMatchPress }) => {
    return (
        <View style={styles.round}>
            <View style={styles.roundTitleContainer}>
                <MaterialCommunityIcons name="flag-checkered" size={20} color="#3f51b5" style={styles.roundIcon} />
                <Text style={styles.roundTitle}>Round {roundNumber}</Text>
            </View>
            <View style={styles.matchesContainer}>
                {matches.map((match, index) => (
                    <View key={match._id || index} style={styles.matchWrapper}>
                        <BracketNode 
                            match={match} 
                            onPress={() => onMatchPress && onMatchPress(match)} 
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

const Bracket = ({ matches = [], onMatchPress }) => {
    // Ensure matches is an array
    const safeMatches = Array.isArray(matches) ? matches : [];
    
    // Group matches by round
    const roundMatches = safeMatches.reduce((acc, match) => {
        if (!match) return acc;
        const round = match.round || 1; // Default to round 1 if not specified
        if (!acc[round]) acc[round] = [];
        acc[round].push(match);
        return acc;
    }, {});

    // Sort rounds
    const sortedRounds = Object.keys(roundMatches)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    return (
        <ScrollView 
            horizontal 
            style={styles.container}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.bracketContainer}>
                {sortedRounds.map((roundNumber) => (
                    <Round
                        key={roundNumber}
                        matches={roundMatches[roundNumber]}
                        roundNumber={roundNumber}
                        onMatchPress={onMatchPress}
                    />
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(240, 245, 255, 0.85)',
    },
    scrollContent: {
        paddingBottom: 16,
    },
    bracketContainer: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'flex-start',
    },
    round: {
        width: width * 0.8,
        marginRight: 20,
    },
    roundTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    roundIcon: {
        marginRight: 8,
    },
    roundTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    matchesContainer: {
        flex: 1,
    },
    matchWrapper: {
        marginVertical: 12,
    },
    matchNode: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    matchStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
    teamContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    teamInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    teamIcon: {
        marginRight: 6,
    },
    teamName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    scoreContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        minWidth: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    score: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
    },
    winnerTeam: {
        backgroundColor: 'rgba(255, 235, 59, 0.1)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    winnerText: {
        fontWeight: 'bold',
        color: '#333',
    },
    winnerScore: {
        color: '#FFC107',
    }
});

export default Bracket;