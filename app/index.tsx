import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    async function checkFirstVisit() {
      try {
        const visited = await AsyncStorage.getItem('HAS_VISITED');
        setHasVisited(visited === 'true');
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking if visited:", error);
        // Default to showing welcome screen if there's an error
        setIsLoading(false);
        setHasVisited(false);
      }
    }

    checkFirstVisit();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If the user has visited before, redirect to TicTacToe
  // Otherwise, redirect to the welcome screen
  return hasVisited ? (
    <Redirect href="/(tabs)/tictactoe" />
  ) : (
    <Redirect href="/welcome" />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});
