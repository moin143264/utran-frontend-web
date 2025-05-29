import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const CompetitionCard = ({ competition, onPress }) => {
    if (!competition) {
        console.error('CompetitionCard: competition prop is undefined');
        return null;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not set';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    const getStatusColor = () => {
        switch (competition.status) {
            case 'active':
                return '#4CAF50';
            case 'completed':
                return '#2196F3';
            case 'upcoming':
                return '#FFC107';
            default:
                return '#9E9E9E';
        }
    };

    // Get appropriate icon based on sport type
    const getSportIcon = () => {
        const sport = (competition.sport || '').toLowerCase();
        if (sport.includes('soccer') || sport.includes('football')) return 'soccer-ball';
        if (sport.includes('basket')) return 'basketball';
        if (sport.includes('tennis')) return 'tennis';
        if (sport.includes('cricket')) return 'cricket-bat';
        if (sport.includes('volley')) return 'volleyball';
        if (sport.includes('hockey')) return 'hockey-sticks';
        if (sport.includes('base')) return 'baseball';
        if (sport.includes('table') || sport.includes('ping')) return 'table-tennis';
        if (sport.includes('badminton')) return 'badminton';
        if (sport.includes('swim')) return 'swim';
        if (sport.includes('run')) return 'run';
        if (sport.includes('bike') || sport.includes('cycle')) return 'bike';
        if (sport.includes('golf')) return 'golf';
        return 'trophy'; // Default icon
    };
    
    // Get status text with nice formatting
    const getStatusText = () => {
        switch (competition.status) {
            case 'active':
                return 'Active';
            case 'completed':
                return 'Completed';
            case 'upcoming':
                return 'Upcoming';
            default:
                return competition.status || 'Unknown';
        }
    };

    const handlePress = () => {
        if (onPress) {
            onPress(competition);
        } else {
            console.warn('CompetitionCard: onPress prop is undefined');
        }
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={handlePress}
        >
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <MaterialCommunityIcons 
                        name={getSportIcon()} 
                        size={24} 
                        color="#3f51b5" 
                        style={styles.sportIcon}
                    />
                    <Text style={styles.title}>{competition.name || 'Untitled Competition'}</Text>
                </View>
                
                <View style={styles.detailsContainer}>
                    <View style={styles.detail}>
                        <FontAwesome5 name="users" size={14} color="#666" />
                        <Text style={styles.detailText}>
                            {Array.isArray(competition.teams) ? competition.teams.length : 0} Teams
                        </Text>
                    </View>
                    
                    <View style={styles.detail}>
                        <FontAwesome5 name="calendar-alt" size={14} color="#666" />
                        <Text style={styles.detailText}>
                            {formatDate(competition.startDate || competition.date)}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.footer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                        <Text style={styles.statusText}>{getStatusText()}</Text>
                    </View>
                    <FontAwesome5 name="chevron-right" size={14} color="#999" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 0,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    statusIndicator: {
        width: 6,
        height: '100%',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sportIcon: {
        marginRight: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    detailsContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default CompetitionCard;