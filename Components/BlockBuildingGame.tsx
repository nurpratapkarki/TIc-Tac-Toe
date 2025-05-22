import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
    MAX_LEVEL,
    TETROMINO_COLORS,
    TetrominoType,
    useBlockBuildingStore
} from '../game_logic/blockBuildingStore';
import BlockBuildingBoard from './BlockBuildingBoard';

export default function BlockBuildingGame() {
  const {
    gameState,
    setupGame,
    startGame,
    resetGame,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    togglePause,
    tick,
    score,
    highScore,
    level,
    linesCleared,
    increaseStartLevel,
    decreaseStartLevel,
    nextPiece
  } = useBlockBuildingStore();

  // Handle timer for game ticks
  const gameTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
    // Setup the initial game state when component mounts
    setupGame();
    
    return () => {
      if (gameTickRef.current) {
        clearInterval(gameTickRef.current);
      }
    };
  }, []);

  // Update game tick speed based on level
  useEffect(() => {
    if (gameTickRef.current) {
      clearInterval(gameTickRef.current);
      gameTickRef.current = null;
    }
    
    if (gameState === 'playing') {
      // Speed increases with level: starting at 800ms at level 1, down to ~100ms at level 10
      const speed = Math.max(100, 800 - (level - 1) * 70);
      gameTickRef.current = setInterval(tick, speed);
    }
    
    return () => {
      if (gameTickRef.current) {
        clearInterval(gameTickRef.current);
      }
    };
  }, [gameState, level]);

  // Handle level changes
  const handleLevelChange = (change: 'increase' | 'decrease') => {
    // Allow level changes only when game is idle or paused
    if (gameState === 'idle' || gameState === 'paused') {
      if (change === 'increase') {
        increaseStartLevel();
      } else {
        decreaseStartLevel();
      }
    }
  };

  // Check if level adjustment is allowed
  const canAdjustLevel = gameState === 'idle' || gameState === 'paused';
  
  // Render the next piece preview
  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    const { type, shape } = nextPiece;
    const color = TETROMINO_COLORS[type as TetrominoType];
    
    return (
      <View style={styles.nextPiecePreview}>
        <View style={styles.nextPieceGrid}>
          {shape.map((row: boolean[], rowIndex: number) => (
            <View key={rowIndex} style={styles.nextPieceRow}>
              {row.map((isBlock: boolean, colIndex: number) => (
                <View 
                  key={colIndex} 
                  style={[
                    styles.nextPieceCell,
                    {
                      width: 12,
                      height: 12,
                      backgroundColor: isBlock ? color : 'transparent'
                    }
                  ]} 
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render main game button (Start/Pause/Resume/New Game)
  const renderMainButton = () => {
    if (gameState === 'idle') {
      return (
        <Pressable style={styles.mainButton} onPress={startGame}>
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>
      );
    } else if (gameState === 'playing') {
      return (
        <Pressable style={styles.mainButton} onPress={togglePause}>
          <Text style={styles.buttonText}>P</Text>
        </Pressable>
      );
    } else if (gameState === 'paused') {
      return (
        <Pressable style={styles.mainButton} onPress={togglePause}>
          <Text style={styles.buttonText}>Re</Text>
        </Pressable>
      );
    } else {
      return (
        <Pressable style={styles.mainButton} onPress={resetGame}>
          <Text style={styles.buttonText}>New</Text>
        </Pressable>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Stats Bar - Compact top row */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>High</Text>
          <Text style={styles.statValue}>{highScore}</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.levelContainer}>
            <Text style={styles.statLabel}>Level</Text>
            {canAdjustLevel && (
              <View style={styles.levelControls}>
                <Pressable 
                  style={[styles.levelButton, level <= 1 && styles.disabledButton]} 
                  onPress={() => handleLevelChange('decrease')}
                  disabled={level <= 1}
                >
                  <Ionicons name="remove" size={14} color={level <= 1 ? "#888" : "#fff"} />
                </Pressable>
                
                <Text style={styles.statValue}>{level}</Text>
                
                <Pressable 
                  style={[styles.levelButton, level >= MAX_LEVEL && styles.disabledButton]} 
                  onPress={() => handleLevelChange('increase')}
                  disabled={level >= MAX_LEVEL}
                >
                  <Ionicons name="add" size={14} color={level >= MAX_LEVEL ? "#888" : "#fff"} />
                </Pressable>
              </View>
            )}
            {!canAdjustLevel && (
              <Text style={styles.statValue}>{level}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Lines</Text>
          <Text style={styles.statValue}>{linesCleared}</Text>
        </View>
        
        {nextPiece && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Next</Text>
            {renderNextPiece()}
          </View>
        )}
      </View>

      {/* Game Board with Side Button */}
      <View style={styles.gameAreaContainer}>
        <View style={styles.boardWrapper}>
          <BlockBuildingBoard />
        </View>
        
        <View style={styles.sidePanelContainer}>
          {renderMainButton()}
        </View>
      </View>
      
      {/* Game Play Controls at the bottom (above tab bar) */}
      {gameState === 'playing' && (
        <View style={styles.playControls}>
          <Pressable 
            style={styles.controlButton}
            onPress={moveLeft}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          
          <Pressable 
            style={styles.controlButton}
            onPress={rotate}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </Pressable>
          
          <Pressable 
            style={styles.controlButton}
            onPress={hardDrop}
          >
            <Ionicons name="arrow-down" size={24} color="#fff" />
          </Pressable>
          
          <Pressable 
            style={styles.controlButton}
            onPress={moveRight}
          >
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 8,
    paddingBottom: 60, // Extra padding at the bottom to avoid tab bar overlap
    backgroundColor: '#121212',
  },
  statsBar: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    backgroundColor: '#1e1e1e',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  gameAreaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sidePanelContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  disabledButton: {
    backgroundColor: '#444',
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    width: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 'auto', // Push to the bottom of the container
  },
  controlButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0, 123, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPiecePreview: {
    marginTop: 2,
  },
  nextPieceGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    padding: 2,
    borderRadius: 4,
  },
  nextPieceRow: {
    flexDirection: 'row',
  },
  nextPieceCell: {
    borderWidth: 1,
    borderColor: '#333',
  },
});