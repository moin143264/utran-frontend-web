import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  // Alert, // Keep for dialogs with custom actions
  FlatList,
  Modal,
  StatusBar,
  Dimensions,
  Platform // For showAppAlert if not already used
} from "react-native";
import { showAppAlert } from "../../utils/uiUtils.js";
import { Picker } from "@react-native-picker/picker";
import {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
  
import { useAuth } from "../../context/AuthContext";
import apiServices from "../../services/api";
import socketService from "../../utils/socket";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";

const { competitions, matches, teams } = apiServices;

const StatCard = ({ title, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const CompetitionCard = ({ competition, onPress }) => {
  if (!competition) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <TouchableOpacity
      style={styles.competitionCard}
      onPress={() => onPress(competition)}
    >
      <View style={styles.competitionHeader}>
        <Text style={styles.competitionName}>
          {competition.name || "Untitled Competition"}
        </Text>
        <Text
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusColor(competition.status || "unknown"),
            },
          ]}
        >
          {(competition.status || "UNKNOWN").toUpperCase()}
        </Text>
      </View>
      <Text style={styles.sportName}>
        {competition.sport || "Not specified"}
      </Text>
      <View style={styles.competitionDetails}>
        <Text style={styles.detailText}>
          Teams:{" "}
          {Array.isArray(competition.teams) ? competition.teams.length : 0}
        </Text>
        <Text style={styles.detailText}>
          Matches:{" "}
          {Array.isArray(competition.matches) ? competition.matches.length : 0}
        </Text>
      </View>
      <Text style={styles.dateText}>
        {formatDate(competition.startDate || competition.date)}
      </Text>
    </TouchableOpacity>
  );
};

const getStatusColor = (status) => {
  if (!status) return "#6c757d";
  switch (status.toLowerCase()) {
    case "active":
      return "#4CAF50";
    case "upcoming":
      return "#2196F3";
    case "completed":
      return "#FF9800";
    default:
      return "#6c757d";
  }
};

const OrganizerDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Load dashboard data from API

 
  const handleLogout = async () => {
    showAppAlert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await logout();
              // The navigation reset will happen automatically through AppNavigator
              // when the auth context updates
            } catch (error) {
              showAppAlert("Error", "Failed to logout");
            }
          }
        }
      ],
      { cancelable: true }
    );
  };
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompetitions: 0,
    activeCompetitions: 0,
    totalTeams: 0,
    upcomingMatches: 0,
  });
  const [competitionsList, setCompetitionsList] = useState([]);

  useEffect(() => {
    // Only proceed if we have a valid user
    if (!user?._id) {
      console.log("No user ID available, skipping socket connection");
      return;
    }


    // Initial data load
    loadDashboardData();

    // Connect to socket
    const socket = socketService.connect();

    if (socket) {
      // Listen for socket connection events
      socket.on("connect", () => {
        console.log("Socket connected successfully");
        // Join user's room after successful connection
        console.log("Joining socket room for user:", user._id);
        socket.emit("join", user._id);
      });

      socket.on("joined", (data) => {
      });

      // Listen for team created events
      socket.on("teamCreated", (newTeam) => {
        console.log("Socket event: teamCreated received", newTeam);
        showAppAlert(
          "New Team Added",
          `Team "${newTeam.name}" has been created. Refreshing data.`
        );
        loadDashboardData(); // Refresh dashboard data
      });

      // Listen for team updated events
      socket.on("teamUpdated", (updatedTeam) => {
        console.log("Socket event: teamUpdated received", updatedTeam);
        showAppAlert(
          "Team Updated",
          `Team "${updatedTeam.name}" has been updated. Refreshing data.`
        );
        loadDashboardData(); // Refresh dashboard data
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      // Listen for real-time updates
      socketService.onCompetitionUpdate((data) => {
        console.log("Competition update received:", data);
        if (data.organizerId === user._id) {
          loadDashboardData();
        }
      });

      // Listen for team updates using socketService
      socketService.onTeamUpdate((data) => {
        console.log("Team update received from socketService:", data);
        loadDashboardData(); // Always refresh for team updates
      });
    } else {
      console.warn("Failed to initialize socket connection");
    }

    socketService.onMatchUpdate((data) => {
      console.log("Match update received:", data);
      if (data.competitionOrganizerId === user._id) {
        loadDashboardData();
      }
    });

    socketService.onTeamUpdate((data) => {
      console.log("Team update received:", data);
      if (data.organizerId === user._id) {
        loadDashboardData();
      }
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log("Disconnecting socket for user:", user._id);
        socket.off("connect");
        socket.off("joined");
        socket.off("connect_error");
        socketService.disconnect();
      }
    };
  }, [user?._id]);
  const loadDashboardData = useCallback(async () => {
    if (!user?._id) {
      console.log("No user ID available, skipping data load");
      return;
    }
    try {
      setLoading(true);
      console.log("Loading dashboard data for user:", user._id);

      // Get competitions organized by the user
      const competitionsResponse = await competitions.getByOrganizer(user._id);
      console.log("Competitions response:", competitionsResponse);
      if (!competitionsResponse?.data) {
        throw new Error("Failed to fetch competitions");
      }

      // Get teams managed by the user
      const teamsResponse = await teams.getByOrganizer(user._id);
      console.log("Teams response:", teamsResponse);
      if (!teamsResponse?.data) {
        throw new Error("Failed to fetch teams");
      }

      // Get upcoming matches
      const matchesResponse = await matches.getUpcoming();
      console.log("Matches response:", matchesResponse);
      if (!matchesResponse?.data) {
        throw new Error("Failed to fetch matches");
      }

      // Log competition data

      // Update state with fetched data
      setCompetitionsList(competitionsResponse.data);
      setStats({
        totalCompetitions: competitionsResponse.data.length,
        activeCompetitions: competitionsResponse.data.filter(
          (c) => c.status === "active"
        ).length,
        totalTeams: teamsResponse.data.length,
        upcomingMatches: matchesResponse.data.length,
      });
    } catch (error) {
      console.error("Dashboard data error:", error);
      showAppAlert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [user?._id]);
  const handleCompetitionPress = (competition) => {
    try {
      // Validate the competition object
      if (!competition) {
        console.error("Invalid competition object (null or undefined)");
        showAppAlert("Error", "Invalid competition data");
        return;
      }

      if (!competition._id) {
        console.error("Competition has no ID:", competition);
        showAppAlert("Error", "Competition ID is missing");
        return;
      }

      // Convert ID to string to ensure it's serializable
      const competitionId = String(competition._id);

      // Navigate with params
      setTimeout(() => {
        navigation.navigate("BracketView", {
          competitionId: competitionId,
        });
      }, 300); // Short delay to ensure navigation happens after rendering
    } catch (error) {
      console.error("Navigation error:", error);
      showAppAlert("Error", "Failed to navigate to competition view");
    }
  };

  // Handle competition selection for team or match management
  const selectCompetitionForAction = (action) => {
    if (competitionsList.length === 0) {
      showsAppAlert(
        "No Competitions",
        "You need to create a competition first.",
        [
          {
            text: "Create Now",
            onPress: () => navigation.navigate("CreateCompetition"),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    // If only one competition, use it directly
    if (competitionsList.length === 1) {
      const competition = competitionsList[0];
      navigation.navigate(action, { competitionId: competition._id });
      return;
    }

    // Show competition picker modal
    setActionType(action);
    setSelectedCompetition(competitionsList[0]?._id || null);
    setShowPicker(true);
  };

  const quickActions = [
    {
      title: "Create Competition",
      onPress: () => navigation.navigate("CreateCompetition"),
      color: "#4CAF50",
    },
    {
      title: "Add Teams",
      onPress: () => selectCompetitionForAction("AddTeams"),
      color: "#2196F3",
    },
    {
      title: "Schedule Matches",
      onPress: () => selectCompetitionForAction("ScheduleMatch"),
      color: "#FF9800",
    },
    {
      title: "Generate Reports",
      onPress: () => selectCompetitionForAction("GeneratePDF"),
      color: "#9C27B0",
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const handleCompetitionSelect = () => {
    if (selectedCompetition && actionType) {
      navigation.navigate(actionType, { competitionId: selectedCompetition });
      setShowPicker(false);
      setActionType(null);
      setSelectedCompetition(null);
    }
  };

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

return (
  <SafeAreaWrapper>
    <View style={styles.backgroundContainer}>
      <StatusBar backgroundColor="rgba(63, 81, 181, 0.8)" barStyle="light-content" />
      <SportsIconsBackground />

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>
              Select a Competition for {actionType}
            </Text>
            <Picker
              selectedValue={selectedCompetition}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedCompetition(itemValue)}
            >
              <Picker.Item label="Select a competition..." value="" />
              {competitionsList.map((comp) => (
                <Picker.Item
                  key={comp._id}
                  label={comp.name || "Unnamed Competition"}
                  value={comp._id}
                />
              ))}
            </Picker>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPicker(false);
                  setSelectedCompetition(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.selectButton]}
                onPress={handleCompetitionSelect}
                disabled={!selectedCompetition}
              >
                <Text style={styles.modalButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>{user?.name || "Organizer"}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color="#3f51b5" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Competitions"
            value={stats.totalCompetitions}
            color="#3f51b5"
          />
          <StatCard
            title="Active Competitions"
            value={stats.activeCompetitions}
            color="#4CAF50"
          />
          <StatCard
            title="Total Teams"
            value={stats.totalTeams}
            color="#FF9800"
          />
          <StatCard
            title="Upcoming Matches"
            value={stats.upcomingMatches}
            color="#9C27B0"
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: "#3f51b5" }]}
              onPress={() => navigation.navigate("CreateCompetition")}
            >
              <FontAwesome5 name="trophy" size={18} color="#FFF" style={{marginRight: 8}} />
              <Text style={styles.quickActionText}>Create Competition</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: "#3f51b5" }]}
              onPress={() => selectCompetitionForAction("AddTeams")}
            >
              <FontAwesome5 name="users" size={18} color="#FFF" style={{marginRight: 8}} />
              <Text style={styles.quickActionText}>Manage Teams</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: "#3f51b5" }]}
              onPress={() => selectCompetitionForAction("ScheduleMatch")}
            >
              <FontAwesome5 name="calendar-alt" size={18} color="#FFF" style={{marginRight: 8}} />
              <Text style={styles.quickActionText}>Schedule Matches</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: "#3f51b5" }]}
              onPress={() => selectCompetitionForAction("GeneratePDF")}
            >
              <FontAwesome5 name="clipboard-list" size={18} color="#FFF" style={{marginRight: 8}} />
              <Text style={styles.quickActionText}>Generate Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Competitions</Text>
          {competitionsList.length > 0 ? (
            <View style={styles.competitionList}>
              {competitionsList.map(item => (
                <CompetitionCard
                  key={item._id}
                  competition={item}
                  onPress={handleCompetitionPress}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="trophy" size={40} color="#3f51b5" style={{marginBottom: 10, opacity: 0.5}} />
              <Text style={styles.emptyText}>
                No competitions found. Create your first competition!
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadDashboardData}
        >
          <FontAwesome5 name="sync" size={16} color="#666" style={{marginRight: 8}} />
          <Text style={styles.refreshButtonText}>Refresh Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  </SafeAreaWrapper>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  selectButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  statCard: {
    width: "45%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    margin: "2.5%",
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sectionContainer: {
    padding: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    padding: 10,
    paddingBottom: 10,
  },
  quickActionsContainer: {
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAction: {
    width: "48%",
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    elevation: 2,
  },
  quickActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  competitionList: {
    padding: 10,
  },
  competitionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  competitionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  competitionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  sportName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  competitionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  refreshButton: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 0, // Stick close to the refresh button
    marginBottom: 64, // Add extra space at the bottom
 
  },
  refreshButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default OrganizerDashboard;
