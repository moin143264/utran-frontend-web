import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const MatchCard = ({ 
    match, 
    onPress, 
    showActions = true 
}) => {
    const { hasRole } = useAuth();
    const isOrganizer = hasRole(['admin', 'organizer']);

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled':
                return '#FF9800'; // orange
            case 'in_progress':
                return '#4CAF50'; // green
            case 'completed':
                return '#3f51b5'; // indigo blue
            case 'cancelled':
                return '#F44336'; // red
            default:
                return '#9E9E9E'; // gray
        }
    };
    
    const getStatusIcon = (status) => {
        switch (status) {
            case 'scheduled':
                return 'schedule';
            case 'in_progress':
                return 'sports';
            case 'completed':
                return 'check-circle';
            case 'cancelled':
                return 'cancel';
            default:
                return 'help-outline';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const team1Winner = match.team1?.score > match.team2?.score && match.status === 'completed';
    const team2Winner = match.team2?.score > match.team1?.score && match.status === 'completed';
    const isDraw = match.team1?.score === match.team2?.score && match.status === 'completed';

    return (
        <TouchableOpacity 
            style={[styles.card, { borderLeftWidth: 4, borderLeftColor: getStatusColor(match.status) }]} 
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.header}>
                <View style={styles.matchNumberContainer}>
                    <MaterialCommunityIcons name="tournament" size={18} color="#3f51b5" style={{ marginRight: 6 }} />
                    <Text style={styles.matchNumber}>Match #{match.matchNumber}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <MaterialIcons name={getStatusIcon(match.status)} size={16} color={getStatusColor(match.status)} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: getStatusColor(match.status) }]}>
                        {match.status.charAt(0).toUpperCase() + match.status.slice(1).replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <View style={styles.teamsContainer}>
                <View style={[styles.teamInfo, team1Winner && styles.winnerTeam]}>
                    {team1Winner && (
                        <MaterialIcons name="emoji-events" size={18} color="#FFC107" style={styles.trophyIcon} />
                    )}
                    <Text style={[styles.teamName, team1Winner && styles.winnerText]}>{match.team1?.team?.name || 'TBD'}</Text>
                    <View style={[styles.scoreContainer, team1Winner && styles.winnerScoreContainer]}>
                        <Text style={[styles.score, team1Winner && styles.winnerScore]}>{match.team1?.score || 0}</Text>
                    </View>
                </View>

                <View style={styles.vsContainer}>
                    <MaterialIcons name="sports-soccer" size={20} color="#3f51b5" style={{ marginBottom: 4 }} />
                    <Text style={styles.vs}>VS</Text>
                </View>

                <View style={[styles.teamInfo, team2Winner && styles.winnerTeam]}>
                    {team2Winner && (
                        <MaterialIcons name="emoji-events" size={18} color="#FFC107" style={styles.trophyIcon} />
                    )}
                    <Text style={[styles.teamName, team2Winner && styles.winnerText]}>{match.team2?.team?.name || 'TBD'}</Text>
                    <View style={[styles.scoreContainer, team2Winner && styles.winnerScoreContainer]}>
                        <Text style={[styles.score, team2Winner && styles.winnerScore]}>{match.team2?.score || 0}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.venueContainer}>
                    <MaterialIcons name="location-on" size={16} color="#666" style={{ marginRight: 4 }} />
                    <Text style={styles.venue}>{match.venue}</Text>
                </View>
                <View style={styles.timeContainer}>
                    <MaterialIcons name="access-time" size={16} color="#666" style={{ marginRight: 4 }} />
                    <Text style={styles.time}>{formatDate(match.startTime)}</Text>
                </View>
            </View>

            {showActions && isOrganizer && match.status !== 'completed' && (
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: '#4CAF50' }]}
                        onPress={() => onPress && onPress('update', match)}
                    >
                        <MaterialIcons name="update" size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.buttonText}>Update Score</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginVertical: 10,
        marginHorizontal: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    matchNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    matchNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    teamsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
    },
    teamInfo: {
        flex: 1,
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
    },
    trophyIcon: {
        marginBottom: 4,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
        color: '#333',
    },
    scoreContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    score: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    vsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    vs: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    venueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    venue: {
        fontSize: 14,
        color: '#666',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    time: {
        fontSize: 14,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    winnerTeam: {
        backgroundColor: 'rgba(255, 235, 59, 0.1)',
    },
    winnerText: {
        fontWeight: 'bold',
        color: '#333',
    },
    winnerScoreContainer: {
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
    },
    winnerScore: {
        color: '#FFC107',
    }
});

export default MatchCard;