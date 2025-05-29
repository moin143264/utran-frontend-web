import React, { useEffect, useCallback } from 'react';
import { StatusBar, View, StyleSheet, Dimensions, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css'; // Commented out for debugging CSS build issue
// Platform was already imported above, removing redundant import here.

if (Platform.OS === 'web') {
  // require('./web-styles.css'); // Commented out for debugging CSS build issue
}

// Keep the splash screen visible while we fetch resources or load assets
SplashScreen.preventAutoHideAsync();

// Custom theme for react-native-paper
const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#4CAF50',
        accent: '#2196F3',
        background: '#fff',
        surface: '#fff',
        text: '#333333',
        error: '#B00020',
        disabled: '#9E9E9E',
        placeholder: '#9E9E9E',
        backdrop: 'rgba(0, 0, 0, 0.5)',
    },
    roundness: 8,
    animation: {
        scale: 1.0,
    },
};

const App = () => {
    const [appIsReady, setAppIsReady] = React.useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Perform any asynchronous tasks needed for app startup here
                // For example, load fonts, fetch initial data, etc.
                // Artificially delay for two seconds to simulate a load time
                await new Promise(resolve => setTimeout(resolve, 200)); 
            } catch (e) {
                console.warn(e);
            } finally {
                // Tell the application to render
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            // This tells the splash screen to hide immediately!
            // If we call this too early, we may see a blank screen while the app is
            // still loading its initial state and rendering its first pixels.
            // So, ensure it's called after appIsReady is true and the layout is complete.
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null; // Or a custom loading component if you have one
    }

    return (
        <View style={styles.container} onLayout={onLayoutRootView}>
            <AuthProvider>
                <PaperProvider theme={theme}>
                    <StatusBar 
                        barStyle="light-content" 
                        backgroundColor={theme.colors.primary}
                    />
                    <AppNavigator />
                    <ToastContainer />
                </PaperProvider>
            </AuthProvider>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // width: Dimensions.get('window').width, // Rely on flex: 1 for web
        // height: Dimensions.get('window').height, // Rely on flex: 1 for web
        // Optionally, for web, ensure it takes full viewport if flex:1 isn't enough
        // by adding to web-styles.css: #root { width: 100vw; height: 100vh; }
        // or here using Platform.select:
        // ...(Platform.OS === 'web' && { width: '100%', height: '100%' })
    }
});

export default App;
