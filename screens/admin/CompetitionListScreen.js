import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    // Alert, // Replaced by showAppAlert
    StatusBar,
    Dimensions,
    Platform // For showAppAlert if not already used
} from 'react-native';
import { showAppAlert } from '../../utils/uiUtils.js';
import { competitions } from '../../services/api';
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

const CompetitionCard = ({ competition, onPress }) => (
    <TouchableOpacity 
        style={styles.competitionCard}
        onPress={onPress}
    >
        <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
                <MaterialCommunityIcons 
                    name="trophy" 
                    size={24} 
                    color="#3f51b5" 
                    style={styles.cardIcon} 
                />
                <Text style={styles.competitionName}>{competition.name}</Text>
            </View>
            
            <View style={styles.detailsRow}>
                <MaterialIcons name="groups" size={18} color="#666" style={styles.detailIcon} />
                <Text style={styles.competitionDetails}>
                    Teams: {competition.teams?.length || 0} / {competition.maxTeams}
                </Text>
            </View>
            
            <View style={styles.statusContainer}>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: competition.status === 'active' ? '#E8F5E9' : '#FFF3E0' }
                ]}>
                    <MaterialIcons 
                        name={competition.status === 'active' ? "check-circle" : "schedule"} 
                        size={16} 
                        color={competition.status === 'active' ? '#4CAF50' : '#FF9800'} 
                        style={styles.statusIcon} 
                    />
                    <Text style={[
                        styles.statusText,
                        { color: competition.status === 'active' ? '#4CAF50' : '#FF9800' }
                    ]}>
                        {competition.status.toUpperCase()}
                    </Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

const CompetitionListScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [competitionList, setCompetitionList] = useState([]);

    useEffect(() => {
        loadCompetitions();
    }, []);

    const loadCompetitions = async () => {
        try {
            setLoading(true);
            const response = await competitions.getAll();
            setCompetitionList(response.data);
        } catch (error) {
            console.error('Load competitions error:', error);
            showAppAlert('Error', 'Failed to load competitions');
        } finally {
            setLoading(false);
        }
    };

    const handleCompetitionPress = (competition) => {
        navigation.navigate('ViewBrackets', { 
            competitionId: competition._id,
            title: competition.name
        });
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
                <View style={styles.headerContent}>
                    <MaterialCommunityIcons name="trophy-outline" size={24} color="#3f51b5" />
                    <Text style={styles.headerTitle}>Competition List</Text>
                </View>
            </View>
            
            <TouchableOpacity 
                style={styles.refreshButton}
                onPress={loadCompetitions}
            >
                <MaterialIcons name="refresh" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.refreshButtonText}>Refresh List</Text>
            </TouchableOpacity>
            
            <FlatList
                data={competitionList}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <CompetitionCard
                        competition={item}
                        onPress={() => handleCompetitionPress(item)}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#aaa" />
                        <Text style={styles.emptyText}>No competitions found</Text>
                        <TouchableOpacity 
                            style={styles.emptyButton}
                            onPress={loadCompetitions}
                        >
                            <Text style={styles.emptyButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
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
        padding: 16,
        backgroundColor: "#f5f5f5",
        elevation: 3,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginLeft: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
        paddingTop: 8,
    },
    competitionCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#3f51b5',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardIcon: {
        marginRight: 8,
    },
    competitionName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailIcon: {
        marginRight: 6,
    },
    competitionDetails: {
        fontSize: 14,
        color: '#666',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusIcon: {
        marginRight: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
        marginBottom: 16,
    },
    emptyButton: {
        backgroundColor: '#3f51b5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
    refreshButton: {
        backgroundColor: "#4CAF50",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        margin: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
});

export default CompetitionListScreen;