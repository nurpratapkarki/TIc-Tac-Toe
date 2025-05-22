import { useRollingTicTacToeStore } from '@/game_logic/ticTacToeStore';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Assuming you'll have a nested stack navigator for TicTacToe:
// export type TicTacToeStackParamList = {
//   TicTacToeSetup: undefined;
//   TicTacToeGame: undefined; 
// };
// type Props = NativeStackScreenProps<TicTacToeStackParamList, 'TicTacToeSetup'>;

// If using directly within a Tab screen that can navigate, adjust props as needed.
// For now, let's assume navigation prop is available.
const TicTacToeSetupScreen = () => { 
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const setPlayerNamesInStore = useRollingTicTacToeStore(state => state.setPlayerNames);

  const handleStartGame = () => {
    if (!player1.trim() || !player2.trim()) {
      alert('Please enter names for both players');
      return;
    }
    setPlayerNamesInStore(player1, player2);
    router.replace("/(tabs)/game");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.overlay}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Player Setup</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Player 1 (X)</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome name="user" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Player 1 Name"
                  placeholderTextColor="#999"
                  value={player1}
                  onChangeText={setPlayer1}
                  maxLength={15}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Player 2 (O)</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome name="user" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Player 2 Name"
                  placeholderTextColor="#999"
                  value={player2}
                  onChangeText={setPlayer2}
                  maxLength={15}
                />
              </View>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={handleStartGame}>
              <Text style={styles.buttonText}>Start Game</Text>
              <FontAwesome name="play" size={16} color="white" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(47, 53, 66, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F3542',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: 8,
  }
});

export default TicTacToeSetupScreen; 