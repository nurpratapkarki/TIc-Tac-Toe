import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// @ts-ignore
import background from '../assets/images/Tictae.png';

import { PlayerSymbol, useRollingTicTacToeStore } from '@/game_logic/ticTacToeStore';
import { Audio } from 'expo-av';
import Board from './Board';

// Confetti component for victory celebration
const Confetti = ({ count = 30, duration = 5000, colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'] }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: Animated.Value;
    y: Animated.Value;
    rotate: Animated.Value;
    scale: Animated.Value;
    color: string;
    opacity: Animated.Value;
  }>>([]);

  // Create particles only once when component mounts
  useEffect(() => {
    const particlesArray = Array.from({ length: count }).map((_, i) => {
      const x = new Animated.Value(Math.random() * Dimensions.get('window').width);
      const y = new Animated.Value(-20 - Math.random() * 100);
      const rotate = new Animated.Value(0);
      const scale = new Animated.Value(0.3 + Math.random() * 0.7);
      const opacity = new Animated.Value(0.8);
      
      return {
        id: i,
        x,
        y,
        rotate,
        scale,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity
      };
    });
    
    setParticles(particlesArray);
    
    // Start animations once particles are created
    const animations: Animated.CompositeAnimation[] = [];
    
    particlesArray.forEach(particle => {
      const randomDuration = duration * (0.7 + Math.random() * 0.6);
      const randomDelay = Math.random() * 500;
      const xStartPosition = Math.random() * Dimensions.get('window').width;
      const xEndPosition = xStartPosition + (Math.random() * 200 - 100);
      
      // Animation sequence
      const animation = Animated.sequence([
        // Delay start
        Animated.delay(randomDelay),
        // Run parallel animations
        Animated.parallel([
          // Fall down
          Animated.timing(particle.y, {
            toValue: Dimensions.get('window').height + 50,
            duration: randomDuration,
            useNativeDriver: true
          }),
          // Rotate
          Animated.timing(particle.rotate, {
            toValue: 10 + Math.random() * 10,
            duration: randomDuration,
            useNativeDriver: true
          }),
          // Horizontal swaying
          Animated.timing(particle.x, {
            toValue: xEndPosition,
            duration: randomDuration,
            useNativeDriver: true
          }),
          // Fade out near the end
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: randomDuration,
            delay: randomDuration * 0.7,
            useNativeDriver: true
          })
        ])
      ]);
      
      animation.start();
      animations.push(animation);
    });
    
    // Cleanup animations on unmount
    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [count, duration, colors.length]); 

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(particle => (
        <Animated.View
          key={particle.id}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            backgroundColor: particle.color,
            borderRadius: 5,
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { rotate: particle.rotate.interpolate({
                  inputRange: [0, 10],
                  outputRange: ['0deg', '360deg']
                }) 
              },
              { scale: particle.scale }
            ],
            opacity: particle.opacity
          }}
        />
      ))}
    </View>
  );
};

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TicTacToeGameScreen = () => {
  const insets = useSafeAreaInsets();
  
  // Game over celebration state
  const [showConfetti, setShowConfetti] = useState(false);
  const winTextAnim = useRef(new Animated.Value(0)).current;
  
  // Sound references
  const moveSoundRef = useRef<Audio.Sound | null>(null);
  const winSoundRef = useRef<Audio.Sound | null>(null);
  const gameOverSoundRef = useRef<Audio.Sound | null>(null);
  
  // Use individual selectors to prevent infinite update loops
  const startNewMatch = useRollingTicTacToeStore(state => state.startNewMatch);
  const gameMessage = useRollingTicTacToeStore(state => state.gameMessage);
  const roundWinnerSymbol = useRollingTicTacToeStore(state => state.roundWinnerSymbol);
  const currentPlayerSymbol = useRollingTicTacToeStore(state => state.currentPlayerSymbol);
  const nextTileToRemove = useRollingTicTacToeStore(state => state.nextTileToRemove);
  const player1Name = useRollingTicTacToeStore(state => state.player1Name);
  const player2Name = useRollingTicTacToeStore(state => state.player2Name);
  const player1Score = useRollingTicTacToeStore(state => state.player1Score);
  const player2Score = useRollingTicTacToeStore(state => state.player2Score);
  const matchWinnerName = useRollingTicTacToeStore(state => state.matchWinnerName);
  const currentMoveNumber = useRollingTicTacToeStore(state => state.currentMoveNumber);

  // Game over celebration effect
  useEffect(() => {
    if (matchWinnerName) {
      setShowConfetti(true);
      
      // Animate win text
      Animated.loop(
        Animated.sequence([
          Animated.timing(winTextAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(winTextAnim, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      setShowConfetti(false);
      winTextAnim.setValue(0);
    }
  }, [matchWinnerName, winTextAnim]);

  // Load sound effects with error handling
  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        
        // Use static imports with file extensions to ensure the files are found
        try {
          const moveAudioPath = require('../assets/sounds/move.wav');
          const { sound: moveAudio } = await Audio.Sound.createAsync(moveAudioPath);
          moveSoundRef.current = moveAudio;
        } catch (err) {
          console.log('Failed to load move sound:', err);
        }
        
        try {
          const winAudioPath = require('../assets/sounds/win.wav');
          const { sound: winAudio } = await Audio.Sound.createAsync(winAudioPath);
          winSoundRef.current = winAudio;
        } catch (err) {
          console.log('Failed to load win sound:', err);
        }
        
        try {
          const gameOverAudioPath = require('../assets/sounds/win.wav');
          const { sound: gameOverAudio } = await Audio.Sound.createAsync(gameOverAudioPath);
          gameOverSoundRef.current = gameOverAudio;
        } catch (err) {
          console.log('Failed to load game over sound:', err);
        }
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };
    
    loadSounds();
    
    return () => {
      // Clean up sounds
      const unloadSounds = async () => {
        if (moveSoundRef.current) {
          try {
            await moveSoundRef.current.unloadAsync();
          } catch (err) {
            console.log('Error unloading move sound:', err);
          }
        }
        
        if (winSoundRef.current) {
          try {
            await winSoundRef.current.unloadAsync();
          } catch (err) {
            console.log('Error unloading win sound:', err);
          }
        }
        
        if (gameOverSoundRef.current) {
          try {
            await gameOverSoundRef.current.unloadAsync();
          } catch (err) {
            console.log('Error unloading game over sound:', err);
          }
        }
      };
      
      unloadSounds();
    };
  }, []);

  // Play sound effect when move is made
  useEffect(() => {
    if (currentMoveNumber > 0) {
      const playMoveSound = async () => {
        try {
          if (moveSoundRef.current) {
            // Stop and reset to beginning before playing
            await moveSoundRef.current.stopAsync();
            await moveSoundRef.current.setPositionAsync(0);
            await moveSoundRef.current.playAsync();
          }
        } catch (error) {
          console.log('Error playing move sound:', error);
        }
      };
      
      playMoveSound();
    }
  }, [currentMoveNumber]);

  // Play win sound when round is won
  useEffect(() => {
    if (roundWinnerSymbol) {
      const playWinSound = async () => {
        try {
          if (winSoundRef.current) {
            // Stop and reset to beginning before playing
            await winSoundRef.current.stopAsync();
            await winSoundRef.current.setPositionAsync(0);
            await winSoundRef.current.playAsync();
          }
        } catch (error) {
          console.log('Error playing win sound:', error);
        }
      };
      
      playWinSound();
    }
  }, [roundWinnerSymbol]);

  // Play game over sound when match is won
  useEffect(() => {
    if (matchWinnerName) {
      const playGameOverSound = async () => {
        try {
          if (gameOverSoundRef.current) {
            // Stop and reset to beginning before playing
            await gameOverSoundRef.current.stopAsync();
            await gameOverSoundRef.current.setPositionAsync(0);
            await gameOverSoundRef.current.playAsync();
          }
        } catch (error) {
          console.log('Error playing game over sound:', error);
        }
      };
      
      playGameOverSound();
    }
  }, [matchWinnerName]);

  const getPlayerNameBySymbol = useCallback((symbol: PlayerSymbol | null): string => {
    if (symbol === 'X') return player1Name || 'Player 1';
    if (symbol === 'O') return player2Name || 'Player 2';
    return '';
  }, [player1Name, player2Name]);

  const getStatusMessage = useCallback(() => {
    if (matchWinnerName) {
      return matchWinnerName === 'Tie' 
        ? 'The match is a Tie!' 
        : `${matchWinnerName} wins the match!`;
    }
    if (roundWinnerSymbol) {
      return `${getPlayerNameBySymbol(roundWinnerSymbol)} wins the round!`;
    }
    if (gameMessage) {
      return gameMessage;
    }
    return `${getPlayerNameBySymbol(currentPlayerSymbol)}'s turn`;
  }, [matchWinnerName, roundWinnerSymbol, gameMessage, currentPlayerSymbol, getPlayerNameBySymbol]);

  const handleStartNewMatchPress = useCallback(() => {
    startNewMatch(); // Reset game state in the store
    router.replace('/(tabs)/tictactoe'); // Navigate back to the setup screen
  }, [startNewMatch]);

  // Determine if names are default placeholder names
  const areNamesDefault = player1Name === 'Player 1' && player2Name === 'Player 2';

  // Enhanced responsive calculations
  const responsiveLayout = useMemo(() => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const topInset = insets.top;
    const bottomInset = insets.bottom;
    
    // Available screen real estate
    const availableHeight = screenHeight - topInset - bottomInset - statusBarHeight;
    const isSmallScreen = screenWidth < 375 || availableHeight < 650;
    const isVerySmallScreen = screenWidth < 350 || availableHeight < 600;
    
    // Scale factor based on screen size
    const widthScale = Math.min(screenWidth / 375, 1.2);
    const heightScale = Math.min(availableHeight / 700, 1.2);
    const scale = Math.min(widthScale, heightScale);
    
    // Calculate proportional heights for each section
    const titleSectionHeight = isVerySmallScreen ? availableHeight * 0.08 : availableHeight * 0.1;
    const scoreboardHeight = isVerySmallScreen ? availableHeight * 0.12 : availableHeight * 0.15;
    const boardSectionHeight = availableHeight * 0.55; // Main game area gets most space
    const statusSectionHeight = isVerySmallScreen ? availableHeight * 0.1 : availableHeight * 0.12;
    const buttonSectionHeight = isVerySmallScreen ? availableHeight * 0.08 : availableHeight * 0.1;
    
    return {
      // Layout heights
      titleSectionHeight,
      scoreboardHeight,
      boardSectionHeight,
      statusSectionHeight,
      buttonSectionHeight,
      
      // Font sizes
      titleFontSize: Math.max(20, Math.min(32, 26 * scale)),
      playerNameFontSize: Math.max(11, Math.min(15, 13 * scale)),
      symbolFontSize: Math.max(14, Math.min(20, 17 * scale)),
      scoreFontSize: Math.max(16, Math.min(24, 20 * scale)),
      vsFontSize: Math.max(10, Math.min(14, 12 * scale)),
      statusFontSize: Math.max(14, Math.min(18, 16 * scale)),
      buttonFontSize: Math.max(14, Math.min(18, 16 * scale)),
      hintFontSize: Math.max(11, Math.min(14, 12 * scale)),
      
      // Component sizes
      symbolContainerSize: Math.max(28, Math.min(40, 34 * scale)),
      vsContainerSize: Math.max(28, Math.min(40, 34 * scale)),
      
      // Spacing
      horizontalPadding: Math.max(16, Math.min(24, 20 * widthScale)),
      verticalSpacing: Math.max(8, Math.min(16, 12 * heightScale)),
      
      // Flags
      isSmallScreen,
      isVerySmallScreen,
      scale
    };
  }, [screenWidth, screenHeight, insets]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={background}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.overlay} edges={['top', 'left', 'right', 'bottom']}>
          <View style={[styles.content, { paddingHorizontal: responsiveLayout.horizontalPadding }]}>
            
            {/* Title Section */}
            <View style={[styles.titleSection, { height: responsiveLayout.titleSectionHeight }]}>
              <Text style={[styles.title, { fontSize: responsiveLayout.titleFontSize }]}>
                Tic Tac Toe
              </Text>
            </View>
            
            {/* Scoreboard Section */}
            <View style={[styles.scoreboardSection, { height: responsiveLayout.scoreboardHeight }]}>
              <View style={styles.scoreBoard}>
                <View style={styles.playerScoreCard}>
                  <Text style={[styles.playerName, { fontSize: responsiveLayout.playerNameFontSize }]} numberOfLines={1}>
                    {player1Name || 'Player 1'}
                  </Text>
                  <View style={[
                    styles.symbolContainer, 
                    { 
                      width: responsiveLayout.symbolContainerSize,
                      height: responsiveLayout.symbolContainerSize,
                      borderRadius: responsiveLayout.symbolContainerSize / 2
                    }
                  ]}>
                    <Text style={[styles.symbolText, { fontSize: responsiveLayout.symbolFontSize }]}>X</Text>
                  </View>
                  <Text style={[styles.scoreValue, { fontSize: responsiveLayout.scoreFontSize }]}>
                    {player1Score}
                  </Text>
                </View>
                
                <View style={[
                  styles.vsContainer, 
                  { 
                    width: responsiveLayout.vsContainerSize,
                    height: responsiveLayout.vsContainerSize,
                    borderRadius: responsiveLayout.vsContainerSize / 2 
                  }
                ]}>
                  <Text style={[styles.vsText, { fontSize: responsiveLayout.vsFontSize }]}>VS</Text>
                </View>
                
                <View style={styles.playerScoreCard}>
                  <Text style={[styles.playerName, { fontSize: responsiveLayout.playerNameFontSize }]} numberOfLines={1}>
                    {player2Name || 'Player 2'}
                  </Text>
                  <View style={[
                    styles.symbolContainer, 
                    styles.symbolContainerO,
                    { 
                      width: responsiveLayout.symbolContainerSize,
                      height: responsiveLayout.symbolContainerSize,
                      borderRadius: responsiveLayout.symbolContainerSize / 2
                    }
                  ]}>
                    <Text style={[styles.symbolText, { fontSize: responsiveLayout.symbolFontSize }]}>O</Text>
                  </View>
                  <Text style={[styles.scoreValue, { fontSize: responsiveLayout.scoreFontSize }]}>
                    {player2Score}
                  </Text>
                </View>
              </View>
            </View>

            {/* Game Board Section */}
            <View style={[styles.boardSection, { height: responsiveLayout.boardSectionHeight }]}>
              <Board />
            </View>

            {/* Status Section */}
            <View style={[styles.statusSection, { height: responsiveLayout.statusSectionHeight }]}>
              {matchWinnerName ? (
                <Animated.Text 
                  style={[
                    styles.statusText, 
                    styles.winnerText,
                    { 
                      fontSize: responsiveLayout.statusFontSize * 1.1,
                      transform: [{ scale: winTextAnim }],
                    }
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                >
                  {getStatusMessage()}
                </Animated.Text>
              ) : (
                <Text 
                  style={[styles.statusText, { fontSize: responsiveLayout.statusFontSize }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {getStatusMessage()}
                </Text>
              )}
              {nextTileToRemove && !roundWinnerSymbol && !matchWinnerName && !areNamesDefault && (
                <View style={styles.hintContainer}>
                  <FontAwesome 
                    name="info-circle" 
                    size={responsiveLayout.isVerySmallScreen ? 12 : 14} 
                    color="#FFC107" 
                    style={styles.hintIcon} 
                  />
                  <Text style={[styles.hintText, { fontSize: responsiveLayout.hintFontSize }]}>
                    Next tile will be removed
                  </Text>
                </View>
              )}
            </View>

            {/* Button Section */}
            <View style={[styles.buttonSection, { height: responsiveLayout.buttonSectionHeight }]}>
              <TouchableOpacity style={styles.button} onPress={handleStartNewMatchPress}>
                <FontAwesome 
                  name="refresh" 
                  size={responsiveLayout.isVerySmallScreen ? 14 : 16} 
                  color="white" 
                  style={styles.buttonIcon} 
                />
                <Text style={[styles.buttonText, { fontSize: responsiveLayout.buttonFontSize }]}>
                  New Match
                </Text>
              </TouchableOpacity>
            </View>
            
          </View>

          {/* Celebration Effects */}
          {showConfetti && <Confetti />}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default TicTacToeGameScreen;
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
  },
  content: {
    flex: 1,
  },
  
  // Section containers with fixed heights
  titleSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreboardSection: {
    justifyContent: 'center',
  },
  boardSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  buttonSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Title
  title: {
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5
  },
  
  // Scoreboard
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  playerScoreCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
    flex: 1,
    marginHorizontal: 4,
    maxWidth: 120,
  },
  playerName: {
    fontWeight: '600',
    color: 'white',
    marginBottom: 6,
    textAlign: 'center',
  },
  symbolContainer: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  symbolContainerO: {
    backgroundColor: '#FF5252',
  },
  symbolText: {
    fontWeight: 'bold',
    color: 'white',
  },
  scoreValue: {
    fontWeight: 'bold',
    color: 'white',
  },
  vsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  vsText: {
    fontWeight: 'bold',
    color: 'white',
  },
  
  // Status
  statusText: {
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  winnerText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  hintIcon: {
    marginRight: 4,
  },
  hintText: {
    color: 'white',
    fontWeight: '500',
  },
  
  // Button
  button: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});