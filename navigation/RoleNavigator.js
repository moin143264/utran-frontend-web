import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import UserManagement from '../screens/admin/UserManagement';
import CompetitionListScreen from '../screens/admin/CompetitionListScreen';

// Organizer Screens
import OrganizerDashboard from '../screens/organizer/OrganizerDashboard';
import CreateCompetition from '../screens/organizer/CreateCompetition';
import AddTeamsScreen from '../screens/organizer/AddTeamsScreen';
import ScheduleMatchScreen from '../screens/organizer/ScheduleMatchScreen';
import SubmitResultScreen from '../screens/organizer/SubmitResultScreen';
import GeneratePDFScreen from '../screens/organizer/GeneratePDFScreen';
import BracketViewScreen from '../screens/organizer/BracketViewScreen';

// Participant Screens
import ParticipantHome from '../screens/participant/ParticipantHome';
import MatchResultsScreen from '../screens/participant/MatchResultsScreen';
import UserProfileScreen from '../screens/participant/UserProfileScreen';

// Common Screens
import FeedbackScreen from '../screens/common/FeedbackScreen';
import ViewBracketsScreen from '../screens/common/ViewBracketsScreen';

const Stack = createStackNavigator();

const defaultScreenOptions = {
    headerShown: false,
    headerStyle: {
        backgroundColor: '#3f51b5', // Updated to match our light sports theme
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
        fontWeight: '600',
    },
    // Add top padding to all screens to account for headerShown: false
    contentStyle: {
        paddingTop: 40, // Provides space at the top of all screens
    }
};

export const AdminNavigator = () => (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
        <Stack.Screen 
            name="AdminDashboard"
            component={AdminDashboard}
            options={{ title: 'Admin Dashboard' }}
        />
        <Stack.Screen 
            name="UserManagement"
            component={UserManagement}
            options={{ title: 'User Management' }}
        />
        <Stack.Screen 
            name="CompetitionList"
            component={CompetitionListScreen}
            options={{ title: 'Competitions' }}
        />
        <Stack.Screen 
            name="ViewBrackets"
            component={ViewBracketsScreen}
            options={{ title: 'Tournament Bracket' }}
        />
        <Stack.Screen 
            name="UserProfile"
            component={UserProfileScreen}
            options={{ title: 'Profile' }}
        />
        <Stack.Screen 
            name="Feedback"
            component={FeedbackScreen}
            options={{ title: 'Feedback' }}
        />
        <Stack.Screen 
            name="GeneratePDF"
            component={GeneratePDFScreen}
            options={{ title: 'Generate Reports' }}
        />
    </Stack.Navigator>
);

export const OrganizerNavigator = () => (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
        <Stack.Screen 
            name="OrganizerDashboard"
            component={OrganizerDashboard}
            options={{ title: 'Organizer Dashboard' }}
        />
        <Stack.Screen 
            name="CreateCompetition"
            component={CreateCompetition}
            options={{ title: 'Create Competition' }}
        />
        <Stack.Screen 
            name="AddTeams"
            component={AddTeamsScreen}
            options={{ title: 'Manage Teams' }}
        />
        <Stack.Screen 
            name="ScheduleMatch"
            component={ScheduleMatchScreen}
            options={{ title: 'Schedule Matches' }}
        />
        <Stack.Screen 
            name="SubmitResult"
            component={SubmitResultScreen}
            options={{ title: 'Submit Result' }}
        />
        <Stack.Screen 
            name="GeneratePDF"
            component={GeneratePDFScreen}
            options={{ title: 'Generate Reports' }}
        />
        <Stack.Screen 
            name="BracketView"
            component={BracketViewScreen}
            options={{ title: 'Tournament Bracket' }}
        />
        <Stack.Screen 
            name="ViewBrackets"
            component={ViewBracketsScreen}
            options={{ title: 'View Brackets' }}
        />
        <Stack.Screen 
            name="Feedback"
            component={FeedbackScreen}
            options={{ title: 'Feedback' }}
        />
    </Stack.Navigator>
);

export const ParticipantNavigator = () => (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
        <Stack.Screen 
            name="ParticipantHome"
            component={ParticipantHome}
            options={{ title: 'Home' }}
        />
        <Stack.Screen 
            name="MatchResults"
            component={MatchResultsScreen}
            options={{ title: 'Match Results' }}
        />
        <Stack.Screen 
            name="ViewBrackets"
            component={ViewBracketsScreen}
            options={{ title: 'View Brackets' }}
        />
        <Stack.Screen 
            name="UserProfile"
            component={UserProfileScreen}
            options={{ title: 'Profile' }}
        />
        <Stack.Screen 
            name="Feedback"
            component={FeedbackScreen}
            options={{ title: 'Feedback' }}
        />
    </Stack.Navigator>
);
