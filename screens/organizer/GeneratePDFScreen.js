import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    // Alert, // Replaced by showAppAlert
    ActivityIndicator,
    Linking,
    Share,
    StatusBar,
    Dimensions,
    Platform // For showAppAlert if not already used
} from 'react-native';
import { showAppAlert } from '../../utils/uiUtils.js';
import * as FileSystem from 'expo-file-system';
import apiServices from '../../services/api';
import { API_URL } from '../../config';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
const { competitions, pdf } = apiServices;

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

const ReportOption = ({ title, description, onPress, loading, icon }) => (
    <TouchableOpacity 
        style={styles.reportOption}
        onPress={onPress}
        disabled={loading}
    >
        <View style={styles.reportIconContainer}>
            {icon}
        </View>
        <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>{title}</Text>
            <Text style={styles.reportDescription}>{description}</Text>
        </View>
        {loading && (
            <ActivityIndicator 
                size="small" 
                color="#4CAF50"
                style={styles.reportLoader}
            />
        )}
    </TouchableOpacity>
);

const GeneratePDFScreen = ({ route, navigation }) => {
    const { competitionId } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [competition, setCompetition] = useState(null);
    const [generatingReport, setGeneratingReport] = useState('');

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
            const response = await competitions.getOne(competitionId);
            setCompetition(response.data);
        } catch (error) {
            showAppAlert('Error', 'Failed to load competition data');
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async (type) => {
        let tempFileUri = null;
        try {
            setGeneratingReport(type);
            const response = await pdf.generateCompetitionReport(competitionId, type);
            const { downloadUrl, filename: suggestedFilename } = response.data; 
            
            if (!downloadUrl) {
                throw new Error('Download URL not found');
            }

            // Ensure we have a proper base URL by checking if API_URL ends with /api
            let baseUrl = API_URL;
            if (baseUrl.endsWith('/api')) {
                baseUrl = baseUrl.substring(0, baseUrl.length - 4); // Remove '/api'
            }
            
            // Ensure downloadUrl starts with a slash if needed
            const normalizedDownloadUrl = downloadUrl.startsWith('/') ? downloadUrl : '/' + downloadUrl;
            const fullDownloadUrl = `${baseUrl}${normalizedDownloadUrl}`;
            console.log('Full download URL:', fullDownloadUrl);

            // Generate a unique filename with timestamp
            const actualFilename = suggestedFilename || `competition-report-${competitionId}-${Date.now()}.pdf`;
            
            // Make sure we have a proper path separator
            const tempFileUri = FileSystem.cacheDirectory + (FileSystem.cacheDirectory.endsWith('/') ? '' : '/') + actualFilename;
            
            console.log('Downloading PDF to:', tempFileUri);
            
            // Check if we have the necessary permissions (for future reference)
            const permissions = await FileSystem.getInfoAsync(FileSystem.cacheDirectory);
            console.log('Cache directory permissions:', permissions);
            
            // Download the file with a timeout
            const downloadPromise = FileSystem.downloadAsync(fullDownloadUrl, tempFileUri);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Download timeout after 30 seconds')), 30000)
            );
            
            const downloadResult = await Promise.race([downloadPromise, timeoutPromise]);
            
            if (downloadResult.status !== 200) {
                throw new Error(`Failed to download PDF file. Status: ${downloadResult.status}`);
            }
            
            // Verify the file exists before sharing
            const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
            if (!fileInfo.exists || fileInfo.size === 0) {
                throw new Error('Downloaded file is empty or does not exist');
            }
            
            console.log('File downloaded successfully:', fileInfo);
            
            // Share the file
            await Share.share({
                url: tempFileUri, 
                message: `Check out the ${competition?.name || 'Competition'} ${type} report!`, 
            });
        } catch (error) {
            console.error('Error generating or sharing report:', error);
            let errorMessage = error.message || 'Failed to generate or share report';
            if (error.message && error.message.includes('network')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            }
            showAppAlert('Error', errorMessage);
        } finally {
            setGeneratingReport('');
            if (tempFileUri) {
                try {
                    await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
                    console.log('Temporary file deleted:', tempFileUri);
                } catch (cleanupError) {
                    console.error('Error deleting temporary file:', cleanupError);
                }
            }
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
                <Text style={styles.headerTitle}>Reports & PDFs</Text>
            </View>
            
            {!competitionId ? (
                <View style={styles.noCompetitionContainer}>
                    <MaterialCommunityIcons name="file-document-outline" size={60} color="#3f51b5" style={{opacity: 0.5, marginBottom: 20}} />
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
                <ScrollView>
                    <View style={styles.competitionInfoCard}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="trophy" size={24} color="#3f51b5" />
                            <Text style={styles.title}>{competition?.name || 'Competition'}</Text>
                        </View>
                        <Text style={styles.subtitle}>Generate & Share Reports</Text>
                    </View>

                    <View style={styles.content}>
                        <ReportOption
                            title="Competition Summary"
                            description="Generate a complete summary of the competition including all matches, teams, and results"
                            onPress={() => generateReport('summary')}
                            loading={generatingReport === 'summary'}
                            icon={<MaterialCommunityIcons name="file-document" size={30} color="#3f51b5" />}
                        />

                        <ReportOption
                            title="Match Schedule"
                            description="Generate a detailed schedule of all matches with dates, times, and venues"
                            onPress={() => generateReport('schedule')}
                            loading={generatingReport === 'schedule'}
                            icon={<MaterialCommunityIcons name="calendar-clock" size={30} color="#3f51b5" />}
                        />

                        <ReportOption
                            title="Team Statistics"
                            description="Generate detailed statistics for all participating teams"
                            onPress={() => generateReport('statistics')}
                            loading={generatingReport === 'statistics'}
                            icon={<MaterialCommunityIcons name="chart-bar" size={30} color="#3f51b5" />}
                        />

                        <ReportOption
                            title="Results and Rankings"
                            description="Generate a report of match results and team rankings"
                            onPress={() => generateReport('results')}
                            loading={generatingReport === 'results'}
                            icon={<MaterialIcons name="leaderboard" size={30} color="#3f51b5" />}
                        />

                        <ReportOption
                            title="Tournament Bracket"
                            description="Generate a visual representation of the tournament bracket"
                            onPress={() => generateReport('bracket')}
                            loading={generatingReport === 'bracket'}
                            icon={<MaterialCommunityIcons name="tournament" size={30} color="#3f51b5" />}
                        />
                    </View>
                </ScrollView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    content: {
        padding: 15,
    },
    reportOption: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        flexDirection: 'row',
        alignItems: 'center',
    },
    reportIconContainer: {
        marginRight: 15,
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    reportDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    reportLoader: {
        marginLeft: 15,
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
});

export default GeneratePDFScreen;