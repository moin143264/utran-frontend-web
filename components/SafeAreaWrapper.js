import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';

/**
 * SafeAreaWrapper component to provide consistent spacing across the app
 * when headerShown is set to false in navigation
 */
const SafeAreaWrapper = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
  },
});

export default SafeAreaWrapper;
