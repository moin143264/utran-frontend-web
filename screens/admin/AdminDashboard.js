import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  // Alert, // Replaced by showAppAlert
  StatusBar,
  Dimensions,
  Platform // For showAppAlert if not already used
} from "react-native";
import { showAppAlert } from '../../utils/uiUtils.js';
import {
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import { competitions, users, matches, feedback } from "../../services/api";

// Create sports icons background component
const SportsIconsBackground = () => {
  // Array of sports icons to use
  const sportsIcons = [
    "basketball",
    "soccer",
    "football",
    "tennis",
    "cricket-bat",
    "volleyball",
    "hockey-sticks",
    "baseball",
    "table-tennis",
    "badminton",
    "swim",
    "run",
    "bike",
    "golf",
    "weight-lifter",
  ];

  // Array of sports emojis to use
  const sportsEmojis = [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🎾",
    "🏐",
    "🏉",
    "🎱",
    "🏓",
    "🏸",
    "🏊‍♂️",
    "🏃‍♂️",
    "🚴‍♂️",
    "⛳",
    "🏋️‍♂️",
    "🤾‍♂️",
    "🏌️‍♂️",
    "🤺",
    "🏇",
    "🧗‍♂️",
    "🏄‍♂️",
    "🤽‍♂️",
    "🚣‍♂️",
    "⛷️",
    "🏂",
    "🏆",
    "🥇",
    "🥈",
    "🥉",
  ];

  const { width, height } = Dimensions.get("window");
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
      const randomEmoji =
        sportsEmojis[Math.floor(Math.random() * sportsEmojis.length)];
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
            position: "absolute",
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
      const randomIcon =
        sportsIcons[Math.floor(Math.random() * sportsIcons.length)];
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
            position: "absolute",
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

  return <View style={styles.iconsBackground}>{elements}</View>;
};

const StatCard = ({ title, value, color, icon }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
      {icon}
    </View>
  </View>
);

const QuickAction = ({ title, onPress, color, icon }) => (
  <TouchableOpacity
    style={[styles.quickAction, { backgroundColor: color }]}
    onPress={onPress}
  >
    <View style={styles.quickActionContent}>
      {icon}
      <Text style={styles.quickActionText}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const AdminDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();

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
    activeCompetitions: 0,
    totalUsers: 0,
    pendingFeedbacks: 0,
    todayMatches: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Loading admin dashboard data...");

      // Get competitions
      const competitionsData = await competitions.getAll();
      console.log("Competitions data:", competitionsData);
      const competitionsList = competitionsData?.data || [];
      if (!Array.isArray(competitionsList)) {
        throw new Error("Invalid competitions data format");
      }

      // Get users
      const usersData = await users.getAll();
      console.log("Users data:", usersData);
      const usersList = usersData?.data || [];
      if (!Array.isArray(usersList)) {
        throw new Error("Invalid users data format");
      }

      // Get feedback
      const feedbacksData = await feedback.getAll();
      console.log("Feedback data:", feedbacksData);
      const feedbacksList = feedbacksData?.data || [];
      if (!Array.isArray(feedbacksList)) {
        throw new Error("Invalid feedback data format");
      }

      // Get upcoming matches instead of today's matches
      const matchesData = await matches.getUpcoming();
      console.log("Matches data:", matchesData);
      const matchesList = matchesData?.data || [];
      if (!Array.isArray(matchesList)) {
        throw new Error("Invalid matches data format");
      }

      // Calculate stats with null checks
      const newStats = {
        activeCompetitions: Array.isArray(competitionsList) 
          ? competitionsList.filter((c) => c?.status === "active").length 
          : 0,
        totalUsers: Array.isArray(usersList) ? usersList.length : 0,
        pendingFeedbacks: Array.isArray(feedbacksList) 
          ? feedbacksList.filter((f) => f?.status === "pending").length 
          : 0,
        todayMatches: Array.isArray(matchesList) ? matchesList.length : 0, // Now shows upcoming matches count
      };

      console.log("Setting new stats:", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("Dashboard data error:", error);
      showAppAlert(
        "Error",
        error.message ||
          "Failed to load dashboard data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Manage Users",
      onPress: () => navigation.navigate("UserManagement"),
      color: "#4CAF50",
      icon: <MaterialIcons name="group" size={24} color="#fff" />,
    },
    {
      title: "View Competitions",
      onPress: () => navigation.navigate("CompetitionList"),
      color: "#2196F3",
      icon: <MaterialCommunityIcons name="trophy" size={24} color="#fff" />,
    },
    {
      title: "Review Feedback",
      onPress: () => navigation.navigate("Feedback"),
      color: "#FF9800",
      icon: <MaterialIcons name="feedback" size={24} color="#fff" />,
    },
    {
      title: "Generate Reports",
      onPress: () => navigation.navigate("GeneratePDF"),
      color: "#9C27B0",
      icon: (
        <MaterialCommunityIcons name="file-document" size={24} color="#fff" />
      ),
    },
  ];

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
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.adminCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons
              name="admin-panel-settings"
              size={24}
              color="#3f51b5"
            />
            <Text style={styles.cardTitle}>Admin Dashboard</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Manage competitions, users, and more
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Active Competitions"
            value={stats.activeCompetitions}
            color="#4CAF50"
            icon={
              <MaterialCommunityIcons name="trophy" size={24} color="#4CAF50" />
            }
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            color="#2196F3"
            icon={<MaterialIcons name="people" size={24} color="#2196F3" />}
          />
          <StatCard
            title="Pending Feedbacks"
            value={stats.pendingFeedbacks}
            color="#FF9800"
            icon={<MaterialIcons name="feedback" size={24} color="#FF9800" />}
          />
          <StatCard
            title="Today's Matches"
            value={stats.todayMatches}
            color="#9C27B0"
            icon={
              <MaterialCommunityIcons
                name="whistle"
                size={24}
                color="#9C27B0"
              />
            }
          />
        </View>

        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="flash-on"
            size={24}
            color="#3f51b5"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              onPress={action.onPress}
              color={action.color}
              icon={action.icon}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadDashboardData}
        >
          <MaterialIcons
            name="refresh"
            size={20}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.refreshButtonText}>Refresh Dashboard</Text>
        </TouchableOpacity>

        {/* Full Logout Button */}
        <TouchableOpacity
          style={styles.logoutFullButton}
          onPress={handleLogout}
        >
          <MaterialIcons
            name="logout"
            size={20}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.refreshButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: "rgba(240, 245, 255, 0.85)",
  },
  iconsBackground: {
    position: "absolute",
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
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  adminCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  statCard: {
    width: "46%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    margin: "2%",
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  quickActionsContainer: {
    padding: 8,
  },
  quickAction: {
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  quickActionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  refreshButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  // New logout button style
  logoutFullButton: {
    backgroundColor: "#F44336", // Red color for logout
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 16,
    marginTop: 0, // Stick close to the refresh button
    marginBottom: 64, // Add extra space at the bottom
    borderRadius: 8,
  },
});

export default AdminDashboard;
