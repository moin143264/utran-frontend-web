import React, { useState, useEffect } from "react";
import { Platform } from 'react-native'; // Platform is used for window.alert
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  // Alert, // Replaced by showAppAlert
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import { showAppAlert } from "../../utils/uiUtils.js";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../context/AuthContext";
import { competitions } from "../../services/api";
import { Picker } from "@react-native-picker/picker";
import { competitionTemplates } from "../../constants/compTemplates";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

const CreateCompetition = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedTemplateValue, setSelectedTemplateValue] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    venue: "",
    maxTeams: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week later
    registrationDeadline: new Date(),
    description: "",
    rules: "",
    prizes: "",
  });

  useEffect(() => {
    console.log("Initial form data set:", JSON.stringify(formData, null, 2));
  }, []);

  useEffect(() => {
    console.log("formData was updated:", JSON.stringify(formData, null, 2));
  }, [formData]); // This effect runs whenever formData changes

  const [showPicker, setShowPicker] = useState({
    start: false,
    end: false,
    registration: false,
  });

  const handleDateChange = (event, selectedDate, field) => {
    setShowPicker((prev) => ({ ...prev, [field]: false }));
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, [field]: selectedDate }));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { field: "name", label: "Name" },
      { field: "sport", label: "Sport" },
      { field: "venue", label: "Venue" },
      { field: "description", label: "Description" },
      { field: "maxTeams", label: "Maximum Teams" },
      { field: "registrationDeadline", label: "Registration Deadline" },
    ];

    const missingFields = [];
    for (const { field, label } of requiredFields) {
      const value = formData[field];
      if (!value || (typeof value === "string" && !value.trim())) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      showAppAlert(
        "Missing Required Fields",
        `Please fill in the following fields:\n${missingFields.join("\n")}`
      );
      return false;
    }

    if (isNaN(parseInt(formData.maxTeams))) {
      showAppAlert("Error", "Please enter a valid number for maximum teams");
      return false;
    }

    if (formData.registrationDeadline > formData.startDate) {
      showAppAlert("Error", "Registration deadline must be before start date");
      return false;
    }

    if (formData.startDate > formData.endDate) {
      showAppAlert("Error", "Start date must be before end date");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
  console.log("FORM DATA TYPE:", typeof formData, Array.isArray(formData));
  console.log("FORM DATA KEYS:", Object.keys(formData));
  console.log("Current form data (before submit):", JSON.stringify(formData, null, 2));

  if (!validateForm()) { // validateForm should handle alerts for missing/invalid fields
    return;
  }

  try {
    setLoading(true);
    
    // Format rules: string to array of strings
    const formattedRules = typeof formData.rules === 'string' && formData.rules.trim() !== ""
      ? formData.rules.split('\n').map(rule => rule.trim()).filter(rule => rule) 
      : []; // Default to empty array if no rules string or it's empty

    // Format prizes: string to array of objects { position: string, prize: string }
    let formattedPrizes = [];
    if (typeof formData.prizes === 'string' && formData.prizes.trim() !== "") {
      const prizeLines = formData.prizes.split('\n').map(line => line.trim()).filter(line => line);
      formattedPrizes = prizeLines.map((line, index) => {
        const parts = line.split(':');
        if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
          return { position: parts[0].trim(), prize: parts[1].trim() };
        }
        // If format is incorrect or line is just a prize, assign a default position
        console.warn(`Prize line "${line}" at index ${index} is not in 'Position: Prize' format. Using default position.`);
        return { position: `Prize ${index + 1}`, prize: line }; 
      });
    }
    
    const requestBody = {
      name: formData.name,
      sport: formData.sport,
      venue: formData.venue,
      description: formData.description,
      maxTeams: parseInt(formData.maxTeams), // Ensure maxTeams is an integer
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
      registrationDeadline: formData.registrationDeadline.toISOString(),
      rules: formattedRules,
      prizes: formattedPrizes,
      organizerId: user.uid, // Assuming user.uid is the organizer's ID
      status: "upcoming", // Default status
    };

    console.log("Creating competition with data (requestBody):", JSON.stringify(requestBody, null, 2));

    const response = await competitions.create(requestBody); // API Call
    console.log("Competition created (API response):", JSON.stringify(response.data ? response.data : response, null, 2)); 


    if (Platform.OS === 'web') {
      showAppAlert("Success: Competition created successfully!");
    } else {
      showAppAlert("Success", "Competition created successfully!");
    }

    navigation.navigate('OrganizerDashboard'); 

    // Reset form
    setFormData({
      name: "",
      sport: "",
      venue: "",
      maxTeams: "",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      registrationDeadline: new Date(),
      description: "",
      rules: "",
      prizes: "",
      // any other fields that are part of the initial state
    });

  } catch (error) {
    console.error("Error creating competition details:", error); // General log
    let errorMessage = "Failed to create competition. Please try again.";
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      // console.error("Error response headers:", error.response.headers); // Usually too verbose
      errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
    } else if (error.request) {
      console.error("Error request:", error.request);
      errorMessage = "No response from server. Please check your network connection.";
    } else {
      console.error("Error message:", error.message);
      errorMessage = error.message || errorMessage;
    }
    showAppAlert("Error", errorMessage);
  } finally {
    setLoading(false);
  }
};

  const showDatePicker = (field) => {
    setShowPicker((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const renderDatePicker = (stateKey, label) => (
    <View style={styles.datePickerContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => showDatePicker(stateKey)}
      >
        <Text style={styles.dateButtonText}>
          {formData[stateKey].toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showPicker[stateKey] && (
        <DateTimePicker
          value={formData[stateKey]}
          mode="date"
          onChange={(event, date) => handleDateChange(event, date, stateKey)}
        />
      )}
    </View>
  );

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
        <Text style={styles.headerTitle}>Create Competition</Text>
      </View>
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.label}>Choose a Template</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedTemplateValue}
              onValueChange={(itemValue, itemIndex) => {
                  console.log("Picker onValueChange FIRED! itemValue:", itemValue, "itemIndex:", itemIndex);
                  // itemValue is the 'value' prop from Picker.Item, which is our template object
                  // itemIndex is its index
                  // itemValue is the 'value' prop from Picker.Item, which is our template object
                  // itemIndex is its index
                  setSelectedTemplateValue(itemValue); // itemValue is likely the label string, or the index itself in some Picker versions

                  // --- SOLUTION --- 
                  // Use itemIndex to get the actual template object from our source array
                  const templateIndex = itemIndex - 1; // Adjust for the placeholder item at index 0
                  const template = templateIndex >= 0 ? competitionTemplates[templateIndex] : null; 
                  // --- END SOLUTION ---

                  // The rest of your existing onValueChange logic follows
                if (template)  { // Also check itemIndex > 0 to avoid processing the "Select a template" item
                  console.log("Selected template object (raw for inspection):", template);
                  console.log("Selected template object KEYS:", Object.keys(template));
                  try {
                    console.log("Selected template object JSON:", JSON.stringify(template, null, 2));
                  } catch (e) {
                    console.error("Could not stringify template object:", e);
                  }

                  // Access data from the template object
                  const data = template.data;
                  if (!data) {
                    console.error("Template has no data property:", template);
                    return;
                  }

                  console.log("Template data:", data);

                  // Ensure all required fields are present and properly formatted
                  const now = new Date();
                  const nextWeek = new Date(
                    now.getTime() + 7 * 24 * 60 * 60 * 1000
                  );

                  // Process template data with strict validation
                  const processedData = {
                    name: data.name || "New Competition",
                    sport: data.sport || "Generic Sport",
                    venue: data.venue || "TBD",
                    description: data.description || "Competition description", // Required
                    maxTeams: data.maxTeams ? String(data.maxTeams) : "10", // Required
                    startDate: data.startDate
                      ? new Date(data.startDate)
                      : nextWeek,
                    endDate: data.endDate
                      ? new Date(data.endDate)
                      : new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
                    registrationDeadline: data.registrationDeadline
                      ? new Date(data.registrationDeadline)
                      : now, // Required
                    rules: data.rules || "",
                    // Format prizes from template - it may be an array of objects or a string
                    prizes: Array.isArray(data.prizes)
                      ? data.prizes
                          .map((p) => `${p.position}: ${p.prize}`)
                          .join("\n")
                      : data.prizes || "",
                  };

                  console.log(
                    "Processed template data:",
                    JSON.stringify(processedData, null, 2)
                  );
                  // Update form data with processed template data
                  setFormData(processedData);
                }
              }}
            >
              <Picker.Item label="Select a template" value={null} />
              {competitionTemplates.map((template, index) => {
                // Ensure template and label exist
                if (!template || !template.label) {
                  console.error("Invalid template at index", index, template);
                  return null;
                }
                return (
                  <Picker.Item
                    key={index}
                    label={template.label}
                    value={template} // Pass the entire template object
                  />
                );
              })}
            </Picker>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Create New Competition</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Competition Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => 
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholder="Enter competition name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sport</Text>
            <TextInput
              style={styles.input}
              value={formData.sport}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, sport: text }))
              }
              placeholder="Enter sport type"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Venue</Text>
            <TextInput
              style={styles.input}
              value={formData.venue}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, venue: text }))
              }
              placeholder="Enter venue"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Maximum Teams</Text>
            <TextInput
              style={styles.input}
              value={formData.maxTeams}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, maxTeams: text }))
              }
              placeholder="Enter maximum number of teams"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder="Enter competition description"
              multiline
              numberOfLines={4}
            />
          </View>
          
          {renderDatePicker("registrationDeadline", "Registration Deadline")}
          {renderDatePicker("startDate", "Start Date")}
          {renderDatePicker("endDate", "End Date")}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Rules</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.rules}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, rules: text }))
              }
              placeholder="Enter competition rules (one per line)"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Prizes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.prizes}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, prizes: text }))
              }
              placeholder="Enter prizes (format: Position: Prize)"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <FontAwesome5 name="trophy" size={18} color="#FFF" />
            <Text style={styles.submitButtonText}>
              {loading ? "Creating..." : "Create Competition"}
            </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "transparent",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Add extra padding at bottom for scrolling
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default CreateCompetition;