import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import {
    ACTIVE_TETROMINO_COLORS,
    BOARD_COLS,
    BOARD_ROWS,
    TetrominoType,
    useBlockBuildingStore
} from '../game_logic/blockBuildingStore';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// We want our blocks to be exactly 64x64 pixels as specified by the user
const BLOCK_SIZE = 64; 

const BlockBuildingBoard = () => {
  // Use individual selectors to prevent unnecessary re-renders
  const board = useBlockBuildingStore(state => state.board);
  const currentPiece = useBlockBuildingStore(state => state.currentPiece);
  const gameState = useBlockBuildingStore(state => state.gameState);

  // Calculate the responsive size for the board
  const boardDimensions = useMemo(() => {
    // Calculate available height (accounting for other UI elements)
    const headerHeight = 60; // Estimated height for header/title
    const controlsHeight = 150; // Estimated height for controls
    const statusHeight = 60; // Estimated height for status messages
    const otherUIElements = headerHeight + controlsHeight + statusHeight;
    
    const availableHeight = screenHeight - otherUIElements;
    const availableWidth = screenWidth * 0.6; // The board takes about 60% of screen width (info panel takes the rest)
    
    // Calculate scale based on available space and actual pixel size
    const desiredBoardWidth = BLOCK_SIZE * BOARD_COLS;
    const desiredBoardHeight = BLOCK_SIZE * BOARD_ROWS;
    
    // Scale factor to fit the board in the available space
    const widthScale = availableWidth / desiredBoardWidth;
    const heightScale = availableHeight / desiredBoardHeight;
    const scale = Math.min(widthScale, heightScale, 1); // Don't scale up, only down if needed
    
    // Scale the block size to fit the board in the available space
    const scaledBlockSize = BLOCK_SIZE * scale;
    
    return {
      blockSize: scaledBlockSize,
      width: scaledBlockSize * BOARD_COLS,
      height: scaledBlockSize * BOARD_ROWS
    };
  }, [screenWidth, screenHeight]);
  
  // Render the board cells and current piece
  const renderBoard = useMemo(() => {
    // Create a copy of the board to render the current piece
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to the display board
    if (currentPiece && gameState !== 'idle') {
      const { shape, position, type } = currentPiece;
      
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const boardRow = position.row + r;
            const boardCol = position.col + c;
            
            // Only render if within the board bounds
            if (boardRow >= 0 && boardRow < BOARD_ROWS && 
                boardCol >= 0 && boardCol < BOARD_COLS) {
              displayBoard[boardRow][boardCol] = `active-${type}`;
            }
          }
        }
      }
    }
    
    return displayBoard.map((row, rowIndex) => (
      <View key={`row-${rowIndex}`} style={styles.row}>
        {row.map((cell, colIndex) => {
          // Parse cell - could be normal color or active piece
          let color = cell;
          let isActivePiece = false;
          let borderStyle = {};
          
          if (cell && typeof cell === 'string' && cell.startsWith('active-')) {
            const type = cell.replace('active-', '') as TetrominoType;
            color = ACTIVE_TETROMINO_COLORS[type];
            isActivePiece = true;
            borderStyle = {
              borderWidth: 2,
              borderColor: 'white',
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 3,
              elevation: 5,
              zIndex: 10
            };
          }
          
          return (
            <View
              key={`cell-${rowIndex}-${colIndex}`}
              style={[
                styles.cell,
                {
                  width: boardDimensions.blockSize,
                  height: boardDimensions.blockSize,
                  backgroundColor: color ? color : 'rgba(0, 0, 0, 0.2)',
                  ...borderStyle
                }
              ]}
            />
          );
        })}
      </View>
    ));
  }, [board, currentPiece, gameState, boardDimensions.blockSize]);

  // Game state overlays
  const renderOverlay = () => {
    if (gameState === 'idle') {
      return (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Press Start</Text>
        </View>
      );
    }
    
    if (gameState === 'paused') {
      return (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>P</Text>
        </View>
      );
    }
    
    if (gameState === 'gameOver') {
      return (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>GAME OVER</Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={[
      styles.boardWrapper,
      {
        width: boardDimensions.width,
        height: boardDimensions.height
      }
    ]}>
      <View style={styles.board}>
        {renderBoard}
      </View>
      {renderOverlay()}
    </View>
  );
};

const styles = StyleSheet.create({
  boardWrapper: {
    position: 'relative',
    alignSelf: 'center',
  },
  board: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  }
});

export default React.memo(BlockBuildingBoard); 