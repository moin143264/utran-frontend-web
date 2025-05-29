import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    // Alert,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    StatusBar,
    Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import apiServices from '../../services/api';
import { showAppAlert } from '../../utils/uiUtils';
const { teams, competitions } = apiServices;



const CompetitionCard = ({ competition, onPress }) => {
    const getStatusColor = () => {
        switch (competition.status) {
            case 'upcoming':
                return '#2196F3';
            case 'ongoing':
                return '#4CAF50';
            case 'completed':
                return '#9E9E9E';
            default:
                return '#FFC107';
        }
    };

    return (
        <TouchableOpacity 
            style={styles.cardContainer}
            onPress={() => onPress(competition)}
        >
            <View style={[styles.card, { borderLeftColor: getStatusColor() }]}>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="trophy" size={20} color={getStatusColor()} style={styles.cardIcon} />
                        <Text style={styles.cardTitle}>{competition.name}</Text>
                    </View>
                    <View style={styles.cardBody}>
                        <View style={styles.cardRow}>
                            <FontAwesome5 name="running" size={14} color="#555" style={styles.inlineIcon} />
                            <Text style={styles.cardSubtitle}>{competition.sport}</Text>
                        </View>
                        <View style={styles.cardRow}>
                            <Ionicons name="location-outline" size={14} color="#555" style={styles.inlineIcon} />
                            <Text style={styles.cardDetails}>
                                {competition.venue}
                            </Text>
                        </View>
                        <View style={styles.statusContainer}>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                                <Text style={styles.statusText}>
                                    {competition.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};


const ParticipantHome = ({ navigation }) => {
    const { user, logout } = useAuth();

    const handleProfilePress = () => {
        // Navigate to a detailed profile screen
        navigation.navigate('UserProfile');
    };

    const handleLogout = async () => {
        showAppAlert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            await logout();
                            // The navigation reset will happen automatically through AppNavigator
                            // when the auth context updates
                        } catch (error) {
                            showAppAlert('Error', 'Failed to logout');
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    };
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [competitionsList, setCompetitionsList] = useState([]);
    const [teamsList, setTeamsList] = useState([]);

    const loadData = async () => {
        if (!user?._id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching teams for user:', user._id);
            
            // Get teams where user is a member
            try {
                const teamsResponse = await teams.getByMember(user._id);
                console.log('Teams API response:', teamsResponse);
                
                if (!teamsResponse?.data) {
                    throw new Error('Failed to fetch teams data');
                }

                const userTeams = teamsResponse.data;
                console.log('Teams data:', userTeams);
                setTeamsList(userTeams);

                if (userTeams.length > 0) {
                    // Get competitions for these teams
                    const teamIds = userTeams.map(team => team._id);
                    console.log('Fetching competitions for teams:', teamIds);
                    const competitionsResponse = await competitions.getByTeams(teamIds.join(','));
                    
                    if (!competitionsResponse?.data) {
                        throw new Error('Failed to fetch competitions data');
                    }

                    const competitionData = competitionsResponse.data;
                    console.log('Competitions data:', competitionData);
                    setCompetitionsList(competitionData);
                } else {
                    setCompetitionsList([]);
                }
            } catch (apiError) {
                console.error('API call error:', apiError);
                throw apiError;
            }
        } catch (error) {
            console.error('Load data error:', error);
            showAppAlert(
                'Error',
                error.response?.data?.message || error.message || 'Failed to load your data. Please try again.'
            );
            setTeamsList([]);
            setCompetitionsList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleCompetitionPress = (competition) => {
        navigation.navigate('MatchResults', { competitionId: competition._id });
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
            <View style={styles.topDecoration}>
                <View style={styles.decorationCircle1} />
                <View style={styles.decorationCircle2} />
            </View>
            <ScrollView 
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        
                    />
                }
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.headerContainer}>
                    <View style={styles.headerGradient}>
                        <View style={styles.userInfoContainer}>
                            <TouchableOpacity 
                                style={styles.userAvatar}
                                onPress={handleProfilePress}
                            >
                                {user && user.profileImage ? (
                                    <Image 
                                        source={{ uri: user.profileImage }}
                                        style={styles.userAvatarImage} 
                                    />
                                ) : (
                                    user && user.name && (
                                        <Text style={styles.userAvatarText}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </Text>
                                    )
                                )}
                            </TouchableOpacity>
                            <View style={styles.userTextContainer}>
                                <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
                                <View style={styles.teamInfoBadge}>
                                    <FontAwesome5 name="users" size={12} color="#FFF" />
                                    <Text style={styles.teamInfoText}>
                                        {teamsList.length} teams
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={styles.logoutButton}
                                onPress={handleLogout}
                            >
                                <MaterialIcons name="logout" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                        <View style={styles.sectionIconContainer}>
                            <FontAwesome5 name="trophy" size={16} color="#FFF" />
                        </View>
                        <Text style={styles.sectionTitle}>Your Competitions</Text>
                    </View>

                    {competitionsList.length > 0 ? (
                        competitionsList.map(competition => (
                            <CompetitionCard 
                                key={competition._id} 
                                competition={competition}
                                onPress={handleCompetitionPress}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <FontAwesome5 name="calendar-times" size={40} color="#FFF" />
                            </View>
                            <Text style={styles.emptyTitle}>No Competitions Yet</Text>
                            <Text style={styles.emptyText}>You are not participating in any competitions at the moment</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    backgroundContainer: {
        flex: 1,
        backgroundColor: 'rgba(240, 245, 255, 0.85)', // Light blue background
        position: 'relative',
        zIndex: 1, // Ensure content is above background but below icons
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent', // Fully transparent to show emojis
        zIndex: 2, // Ensure content is above background and icons
        paddingTop: 15, // Add padding at the top of the main container
    },
    topDecoration: {
        position: 'absolute',
        top: -100,
        right: -100,
        zIndex: 0,
    },
    decorationCircle1: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 87, 34, 0.2)',
        position: 'absolute',
    },
    decorationCircle2: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(33, 150, 243, 0.15)',
        position: 'absolute',
        top: 50,
        left: -50,
    },
    headerContainer: {
        backgroundColor: 'transparent',
        marginBottom: 15,
    },
    headerGradient: {
        paddingTop: 30,
        paddingBottom: 25,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(63, 81, 181, 0.8)', // Indigo blue for light theme
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
        marginTop: 10, // Add more space at the top
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FF5722', // Keep orange for contrast
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    userAvatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    userAvatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 25, // Should match half of userAvatar's width/height
    },
    userTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    teamInfoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 5,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    teamInfoText: {
        fontSize: 12,
        color: '#ffffff',
        marginLeft: 5,
        fontWeight: '500',
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
    logoutButton: {
        padding: 10,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 87, 34, 0.8)',
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(255, 87, 34, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    sectionContainer: {
        marginTop: 15,
        marginHorizontal: 15,
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(63, 81, 181, 0.1)',
        paddingBottom: 8,
    },
    sectionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FF5722',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#3f51b5', // Indigo blue for light theme
        marginLeft: 12,
        textShadowColor: 'rgba(63, 81, 181, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    cardContainer: {
        marginBottom: 18,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    card: {
        borderRadius: 16,
        borderLeftWidth: 4,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    cardContent: {
        padding: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(63, 81, 181, 0.1)',
        backgroundColor: 'rgba(63, 81, 181, 0.08)',
    },
    cardBody: {
        padding: 16,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardIcon: {
        marginRight: 10,
    },
    inlineIcon: {
        marginRight: 8,
    },
    statusContainer: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        overflow: 'hidden',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        flex: 1,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
        fontWeight: '500',
    },
    cardDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
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
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 87, 34, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 87, 34, 0.3)',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3f51b5',
        marginBottom: 10,
        textShadowColor: 'rgba(63, 81, 181, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    emptyText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 16,
        marginVertical: 10,
        borderRadius: 12,
        elevation: 3,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textTransform: 'uppercase'
    },
    profileInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center'
    },
    welcomeText: {
        fontSize: 14,
        color: '#ffffff',
        marginBottom: 2
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    profileEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 2
    }
});

const SportsIconsBackground = () => {
    // Array of sports icons to use
    const sportsIcons = [
        'basketball', 'soccer', 'football', 'tennis', 'cricket',
        'volleyball', 'hockey-sticks', 'baseball', 'table-tennis',
        'badminton', 'swim', 'run', 'bike', 'golf', 'weight-lifter'
    ];
    
    // Array of sports emojis to use
    const sportsEmojis = [
        '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', 
        '🏸', '🏊‍♂️', '🏃‍♂️', '🚴‍♂️', '⛳', '🏋️‍♂️', '🤾‍♂️', '🏌️‍♂️', '🤺',
        '🏇', '🧗‍♂️', '🏄‍♂️', '🤽‍♂️', '🚣‍♂️', '⛷️', '🏂', '🏆', '🥇', '🥈', '🥉'
    ];
    
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

export default ParticipantHome;
