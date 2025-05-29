import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    // Alert, // Replaced by showAppAlert
    ActivityIndicator,
    StatusBar,
    Dimensions,
    Platform // For showAppAlert if not already used
} from 'react-native';
import { showAppAlert } from '../../utils/uiUtils.js';
import { useAuth } from '../../context/AuthContext';
import { feedback } from '../../services/api';
import RoleBasedView from '../../components/RoleBasedView';
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

const FeedbackItem = ({ item, onRespond }) => (
    <View style={styles.feedbackItem}>
        <View style={styles.feedbackHeader}>
            <View style={styles.userContainer}>
                <MaterialIcons name="person" size={18} color="#3f51b5" style={{marginRight: 8}} />
                <Text style={styles.userName}>{item.user?.name || 'Anonymous'}</Text>
            </View>
            <View style={[styles.statusBadge, 
                { backgroundColor: item.status === 'resolved' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 165, 0, 0.1)' }]}>
                <Text style={[styles.status, { color: item.status === 'resolved' ? '#4CAF50' : '#FFA500' }]}>
                    {item.status}
                </Text>
            </View>
        </View>

        <View style={styles.feedbackContent}>
            {item.competition?.name && (
                <View style={styles.competitionContainer}>
                    <MaterialCommunityIcons name="trophy" size={16} color="#3f51b5" style={{marginRight: 6}} />
                    <Text style={styles.competitionName}>{item.competition?.name || 'General Feedback'}</Text>
                </View>
            )}
            
            <View style={styles.ratingContainer}>
                <MaterialIcons name="star-rate" size={16} color="#3f51b5" style={{marginRight: 6}} />
                <Text style={styles.ratingLabel}>Rating:</Text>
                <Text style={styles.rating}>{'⭐'.repeat(item.rating)}</Text>
            </View>
            
            <View style={styles.commentContainer}>
                <Text style={styles.comment}>{item.comment}</Text>
            </View>

            {item.adminResponse && (
                <View style={styles.responseContainer}>
                    <View style={styles.responseHeader}>
                        <MaterialIcons name="reply" size={16} color="#3f51b5" style={{marginRight: 6}} />
                        <Text style={styles.responseLabel}>Admin Response:</Text>
                    </View>
                    <Text style={styles.response}>{item.adminResponse}</Text>
                </View>
            )}
        </View>

        <RoleBasedView roles={['admin', 'organizer']}>
            {!item.adminResponse && (
                <TouchableOpacity 
                    style={styles.respondButton}
                    onPress={() => onRespond(item)}
                >
                    <MaterialIcons name="reply" size={18} color="#FFF" style={{marginRight: 8}} />
                    <Text style={styles.respondButtonText}>Respond</Text>
                </TouchableOpacity>
            )}
        </RoleBasedView>
    </View>
);

const FeedbackScreen = ({ navigation }) => {
    const { user, hasRole } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newFeedback, setNewFeedback] = useState({
        rating: 5,
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [responding, setResponding] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');

    useEffect(() => {
        loadFeedbacks();
    }, []);

    const loadFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await feedback.getAll();
            setFeedbacks(response.data);
        } catch (error) {
            showAppAlert('Error', 'Failed to load feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!newFeedback.comment.trim()) {
            showAppAlert('Error', 'Please provide feedback comment');
            return;
        }

        try {
            setSubmitting(true);
            await feedback.create(newFeedback);
            setNewFeedback({ rating: 5, comment: '' });
            await loadFeedbacks();
            showAppAlert('Success', 'Feedback submitted successfully');
        } catch (error) {
            showAppAlert('Error', error.message || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRespond = (item) => {
        setSelectedFeedback(item);
        setAdminResponse('');
    };

    const submitResponse = async () => {
        if (!adminResponse.trim()) {
            showAppAlert('Error', 'Please provide a response');
            return;
        }

        try {
            setResponding(true);
            await feedback.respond(selectedFeedback._id, {
                adminResponse,
                status: 'resolved'
            });
            setSelectedFeedback(null);
            setAdminResponse('');
            await loadFeedbacks();
            showAppAlert('Success', 'Response submitted successfully');
        } catch (error) {
            showAppAlert('Error', error.message || 'Failed to submit response');
        } finally {
            setResponding(false);
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
                <Text style={styles.headerTitle}>Feedback & Suggestions</Text>
            </View>
            
            <ScrollView style={styles.container}>
                {!hasRole(['admin', 'organizer']) && (
                    <View style={styles.submitSection}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="feedback" size={24} color="#3f51b5" style={{marginRight: 10}} />
                            <Text style={styles.sectionTitle}>Submit Feedback</Text>
                        </View>
                        
                        <View style={styles.ratingInput}>
                            <Text style={styles.label}>Rating:</Text>
                            <View style={styles.starContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setNewFeedback({ ...newFeedback, rating: star })}
                                    >
                                        <Text style={[styles.star, star <= newFeedback.rating && styles.starSelected]}>
                                            ⭐
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.commentInput}>
                            <Text style={styles.label}>Comment:</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={newFeedback.comment}
                                    onChangeText={(text) => setNewFeedback({ ...newFeedback, comment: text })}
                                    placeholder="Enter your feedback"
                                    multiline
                                    numberOfLines={4}
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" size="small" style={{marginRight: 8}} />
                            ) : (
                                <MaterialIcons name="send" size={20} color="#fff" style={{marginRight: 8}} />
                            )}
                            <Text style={styles.submitButtonText}>
                                {submitting ? 'Submitting...' : 'Submit Feedback'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.feedbackList}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="message-reply-text" size={24} color="#3f51b5" style={{marginRight: 10}} />
                        <Text style={styles.sectionTitle}>
                            {hasRole(['admin', 'organizer']) ? 'All Feedbacks' : 'Your Feedbacks'}
                        </Text>
                    </View>
                    
                    {feedbacks.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="chat-remove" size={60} color="#3f51b5" style={{opacity: 0.5, marginBottom: 20}} />
                            <Text style={styles.noFeedback}>No feedbacks yet</Text>
                        </View>
                    ) : (
                        feedbacks.map((item) => (
                            <FeedbackItem 
                                key={item._id} 
                                item={item} 
                                onRespond={handleRespond} 
                            />
                        ))
                    )}
                </View>

                {selectedFeedback && (
                    <View style={styles.responseModal}>
                        <View style={styles.modalHeader}>
                            <MaterialIcons name="question-answer" size={24} color="#3f51b5" style={{marginRight: 10}} />
                            <Text style={styles.modalTitle}>Respond to Feedback</Text>
                        </View>
                        
                        <View style={styles.responseInputContainer}>
                            <TextInput
                                style={styles.responseInput}
                                value={adminResponse}
                                onChangeText={setAdminResponse}
                                placeholder="Enter your response"
                                multiline
                                numberOfLines={4}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setSelectedFeedback(null)}
                            >
                                <MaterialIcons name="cancel" size={18} color="#FFF" style={{marginRight: 8}} />
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton, responding && styles.buttonDisabled]}
                                onPress={submitResponse}
                                disabled={responding}
                            >
                                {responding ? (
                                    <ActivityIndicator color="#fff" size="small" style={{marginRight: 8}} />
                                ) : (
                                    <MaterialIcons name="send" size={18} color="#FFF" style={{marginRight: 8}} />
                                )}
                                <Text style={styles.modalButtonText}>
                                    {responding ? 'Submitting...' : 'Submit Response'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
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
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitSection: {
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    ratingInput: {
        marginBottom: 20,
    },
    starContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    star: {
        fontSize: 24,
        marginRight: 8,
        opacity: 0.3,
    },
    starSelected: {
        opacity: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    inputContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    input: {
        padding: 12,
        fontSize: 16,
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
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    feedbackList: {
        margin: 16,
        marginTop: 0,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    noFeedback: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
    },
    feedbackItem: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    feedbackHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    status: {
        fontSize: 14,
        fontWeight: '500',
    },
    feedbackContent: {
        padding: 8,
    },
    competitionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    competitionName: {
        fontSize: 14,
        color: '#666',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    rating: {
        fontSize: 14,
    },
    commentContainer: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
    },
    comment: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    responseContainer: {
        backgroundColor: 'rgba(63, 81, 181, 0.05)',
        padding: 12,
        borderRadius: 6,
        marginTop: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#3f51b5',
    },
    responseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    responseLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    response: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    respondButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 6,
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    respondButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    responseModal: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        margin: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    responseInputContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 16,
    },
    responseInput: {
        padding: 12,
        fontSize: 16,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    modalButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default FeedbackScreen;