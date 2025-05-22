import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useColorMatchStore } from '../game_logic/colorMatchStore';

// Available colors for the tiles
const COLORS = ['#FF5252', '#4CAF50', '#2196F3', '#FFEB3B', '#9C27B0'];
const GRID_SIZE = 6; // 6x6 grid

const ColorMatchGrid = () => {
  const {
    grid,
    score,
    combo,
    timeLeft,
    movesLeft,
    gameMode,
    initializeGame,
    checkForMatches,
    clearMatches,
    dropTiles,
    addScore,
    decreaseMoves
  } = useColorMatchStore();

  const [selectedTiles, setSelectedTiles] = useState<{row: number, col: number}[]>([]);
  const [animations] = useState<Animated.Value[][]>(
    Array(GRID_SIZE).fill(0).map(() => 
      Array(GRID_SIZE).fill(0).map(() => new Animated.Value(1))
    )
  );

  useEffect(() => {
    initializeGame(GRID_SIZE, COLORS.length);
  }, []);

  const handleTilePress = (row: number, col: number) => {
    // Only process clicks if we have moves left or not in moves mode
    if (gameMode === 'moves' && movesLeft <= 0) return;
    
    const currentColor = grid[row][col];
    if (currentColor === null) return; // Empty tile
    
    // Check if we're starting a new selection
    if (selectedTiles.length === 0) {
      setSelectedTiles([{row, col}]);
      return;
    }
    
    // Check if the new tile matches the color of the first selection
    const firstTile = selectedTiles[0];
    if (grid[firstTile.row][firstTile.col] !== currentColor) {
      // Color doesn't match, start a new selection
      setSelectedTiles([{row, col}]);
      return;
    }
    
    // Check if the new tile is already selected
    if (selectedTiles.some(tile => tile.row === row && tile.col === col)) {
      return;
    }
    
    // Add the new tile to selection
    const newSelection = [...selectedTiles, {row, col}];
    setSelectedTiles(newSelection);
    
    // If we have 3 or more of the same color, clear them
    if (newSelection.length >= 3) {
      // Animate the disappearing tiles
      newSelection.forEach(tile => {
        Animated.sequence([
          Animated.timing(animations[tile.row][tile.col], {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true
          }),
          Animated.timing(animations[tile.row][tile.col], {
            toValue: 0,
            duration: 150,
            useNativeDriver: true
          })
        ]).start();
      });
      
      // Process the match after animation
      setTimeout(() => {
        // Reset scales
        newSelection.forEach(tile => {
          animations[tile.row][tile.col].setValue(1);
        });
        
        // Process the match in the store
        clearMatches(newSelection);
        addScore(newSelection.length);
        dropTiles();
        if (gameMode === 'moves') {
          decreaseMoves();
        }
        setSelectedTiles([]);
      }, 300);
    }
  };

  const { width } = Dimensions.get('window');
  const tileSize = (width * 0.9) / GRID_SIZE;

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((color, colIndex) => (
              <Animated.View
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.tileWrapper,
                  { 
                    width: tileSize, 
                    height: tileSize,
                    transform: [{ scale: animations[rowIndex][colIndex] }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.tile,
                    { backgroundColor: color || '#e0e0e0' },
                    selectedTiles.some(tile => 
                      tile.row === rowIndex && tile.col === colIndex
                    ) && styles.selectedTile
                  ]}
                  onPress={() => handleTilePress(rowIndex, colIndex)}
                  disabled={color === null}
                />
              </Animated.View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
  },
  tileWrapper: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tile: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTile: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});

export default ColorMatchGrid; 