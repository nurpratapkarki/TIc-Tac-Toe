import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
    Dimensions,
    ImageBackground,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GameMode, useColorMatchStore } from '../game_logic/colorMatchStore';
import ColorMatchGrid from './ColorMatchGrid';

const { width } = Dimensions.get('window');

const ColorMatchGame = () => {
  const {
    score,
    highScore,
    combo,
    timeLeft,
    movesLeft,
    gameMode,
    gameActive,
    setGameMode,
    resetGame,
    decreaseTime
  } = useColorMatchStore();

  // Timer
  useEffect(() => {
    if (gameMode === 'timer' && gameActive) {
      const timer = setInterval(() => {
        decreaseTime();
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameMode, gameActive]);

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Color Match</Text>
              <View style={styles.scoreContainer}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>Score</Text>
                  <Text style={styles.scoreValue}>{score}</Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>High Score</Text>
                  <Text style={styles.scoreValue}>{highScore}</Text>
                </View>
              </View>
            </View>

            <View style={styles.gameInfo}>
              {gameMode === 'timer' ? (
                <View style={styles.infoBox}>
                  <FontAwesome name="clock-o" size={18} color="#FF5252" />
                  <Text style={styles.infoText}>{timeLeft}s</Text>
                </View>
              ) : (
                <View style={styles.infoBox}>
                  <FontAwesome name="hand-pointer-o" size={18} color="#FF5252" />
                  <Text style={styles.infoText}>{movesLeft} moves</Text>
                </View>
              )}
              {combo > 1 && (
                <View style={styles.infoBox}>
                  <FontAwesome name="bolt" size={18} color="#9C27B0" />
                  <Text style={styles.comboText}>x{combo}</Text>
                </View>
              )}
            </View>

            <View style={styles.gridWrapper}>
              <ColorMatchGrid />
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  gameMode === 'timer' && styles.activeModeButton
                ]}
                onPress={() => handleModeChange('timer')}
              >
                <FontAwesome name="clock-o" size={16} color={gameMode === 'timer' ? "white" : "#555"} style={styles.modeIcon} />
                <Text style={[
                  styles.modeButtonText,
                  gameMode === 'timer' && styles.activeModeText
                ]}>Time Mode</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  gameMode === 'moves' && styles.activeModeButton
                ]}
                onPress={() => handleModeChange('moves')}
              >
                <FontAwesome name="hand-pointer-o" size={16} color={gameMode === 'moves' ? "white" : "#555"} style={styles.modeIcon} />
                <Text style={[
                  styles.modeButtonText,
                  gameMode === 'moves' && styles.activeModeText
                ]}>Moves Mode</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {!gameActive && (
            <View style={styles.gameOverContainer}>
              <View style={styles.gameOverBox}>
                <Text style={styles.gameOverText}>Game Over!</Text>
                <Text style={styles.finalScoreText}>Final Score: {score}</Text>
                <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
                  <FontAwesome name="refresh" size={18} color="white" style={styles.resetIcon} />
                  <Text style={styles.resetButtonText}>Play Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
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
    padding: 16,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
  },
  scoreBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: width * 0.4,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e0e0e0',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 6,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 6,
  },
  comboText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 6,
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  gameOverBox: {
    backgroundColor: '#2F3542',
    borderRadius:
    16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  finalScoreText: {
    fontSize: 22,
    color: '#e0e0e0',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  resetIcon: {
    marginRight: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modeIcon: {
    marginRight: 6,
  },
  activeModeButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e0e0e0',
  },
  activeModeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ColorMatchGame; 