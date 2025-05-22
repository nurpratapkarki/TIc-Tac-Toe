import { useRollingTicTacToeStore } from '@/game_logic/ticTacToeStore';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, View } from 'react-native';
import Cell from './Cell';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Pre-calculate border styles for all 9 cells to avoid recreating these objects on each render
const CELL_BORDER_STYLES = [
  // Row 0
  { borderTopWidth: 0, borderLeftWidth: 0 },                 // 0,0
  { borderTopWidth: 0 },                                     // 0,1
  { borderTopWidth: 0, borderRightWidth: 0 },                // 0,2
  // Row 1
  { borderLeftWidth: 0 },                                    // 1,0
  {},                                                        // 1,1
  { borderRightWidth: 0 },                                   // 1,2
  // Row 2
  { borderLeftWidth: 0, borderBottomWidth: 0 },              // 2,0
  { borderBottomWidth: 0 },                                  // 2,1
  { borderRightWidth: 0, borderBottomWidth: 0 }              // 2,2
];

// Define winning line positions and angles (these are more conceptual now as the render logic handles specifics)
const WINNING_LINES: Record<string, { /* ... */ }> = {
  // Rows
  '0,0-0,1-0,2': {},
  '1,0-1,1-1,2': {},
  '2,0-2,1-2,2': {},
  // Columns
  '0,0-1,0-2,0': {},
  '0,1-1,1-2,1': {},
  '0,2-1,2-2,2': {},
  // Diagonals
  '0,0-1,1-2,2': {},
  '0,2-1,1-2,0': {},
};

const Board = () => {
  const board = useRollingTicTacToeStore(state => state.board);
  const makeMove = useRollingTicTacToeStore(state => state.makeMove);
  const nextTileToRemove = useRollingTicTacToeStore(state => state.nextTileToRemove);
  const roundWinnerSymbol = useRollingTicTacToeStore(state => state.roundWinnerSymbol);
  const winningLine = useRollingTicTacToeStore(state => state.winningLine);

  const lineAnimatedProgress = useRef(new Animated.Value(0)).current; // Represents animation progress 0-1
  const lineOpacity = useRef(new Animated.Value(0)).current;
  const cellsPulseAnim = useRef(new Animated.Value(1)).current;

  const gameActive = !roundWinnerSymbol;

  useEffect(() => {
    if (roundWinnerSymbol && winningLine) {
      Animated.sequence([
        Animated.timing(lineAnimatedProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true, // Use native driver for scale and opacity
        }),
        Animated.parallel([
          Animated.timing(lineOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(lineAnimatedProgress, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          })
        ]),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(cellsPulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cellsPulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      lineOpacity.setValue(0);
      lineAnimatedProgress.setValue(0); // Reset to 0 for scale
      cellsPulseAnim.setValue(1);
    }
  }, [roundWinnerSymbol, winningLine, lineAnimatedProgress, lineOpacity, cellsPulseAnim]);

  const responsiveBoardSize = useMemo(() => {
    const titleHeight = 60;
    const scoreboardHeight = 80;
    const statusHeight = 80;
    const buttonHeight = 70;
    const safeAreaPadding = Platform.OS === 'ios' ? 50 : 30;
    const otherUIElements = titleHeight + scoreboardHeight + statusHeight + buttonHeight + safeAreaPadding;

    const availableHeight = screenHeight - otherUIElements;
    const availableWidth = screenWidth * 0.85;

    return Math.min(availableHeight, availableWidth);
  }, [screenWidth, screenHeight]);

  const createCellPressHandler = useCallback((row: number, col: number) => {
    return () => {
      if (gameActive) {
        makeMove(row, col);
      }
    };
  }, [gameActive, makeMove]);

  const isWinningCell = useCallback((row: number, col: number) => {
    if (!winningLine) return false;
    return winningLine.some(pos => pos.row === row && pos.col === col);
  }, [winningLine]);

  const renderWinningLine = useCallback(() => {
    if (!roundWinnerSymbol || !winningLine) return null;

    const lineKey = winningLine.map(pos => `${pos.row},${pos.col}`).join('-');
    const lineColor = roundWinnerSymbol === 'X' ? '#1E88E5' : '#E53935';
    const lineThickness = 6;

    // The scale value for the animation
    const scaleValue = lineAnimatedProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });

    // Determine line type and render appropriate line
    // Horizontal lines
    if (lineKey.startsWith('0,0-0,1') || lineKey.startsWith('1,0-1,1') || lineKey.startsWith('2,0-2,1')) {
      let topPosition: `${number}%`;
      if (lineKey.startsWith('0,0-0,1')) topPosition = `16.67%`; // Center of first row
      else if (lineKey.startsWith('1,0-1,1')) topPosition = `50%`; // Center of second row
      else topPosition = `83.33%`; // Center of third row

      return (
        <Animated.View
          style={{
            position: 'absolute',
            backgroundColor: lineColor,
            height: lineThickness,
            width: '90%', // Full width relative to board
            left: '5%',
            top: topPosition,
            transform: [
              { translateY: -lineThickness / 2 },
              { scaleX: scaleValue }, // Animate scaleX to make it grow
            ],
            transformOrigin: 'left', // Animate from left to right
            opacity: lineOpacity,
            borderRadius: 3,
            zIndex: 10,
          }}
        />
      );
    }
    // Vertical lines
    else if (lineKey.startsWith('0,0-1,0') || lineKey.startsWith('0,1-1,1') || lineKey.startsWith('0,2-1,2')) {
      // Calculate left position in pixels instead of percentage
      let leftPosition: number;
      if (lineKey.startsWith('0,0-1,0')) leftPosition = responsiveBoardSize * 0.1667; // Center of first column
      else if (lineKey.startsWith('0,1-1,1')) leftPosition = responsiveBoardSize * 0.5; // Center of second column
      else leftPosition = responsiveBoardSize * 0.8333; // Center of third column

      return (
        <Animated.View
          style={{
            position: 'absolute',
            backgroundColor: lineColor,
            width: lineThickness,
            height: responsiveBoardSize * 0.9, // Full height relative to board
            top: responsiveBoardSize * 0.05,
            left: leftPosition,
            transform: [
              { translateX: -lineThickness / 2 },
              { scaleY: scaleValue }, // Animate scaleY to make it grow
            ],
            transformOrigin: 'top', // Animate from top to bottom
            opacity: lineOpacity,
            borderRadius: 3,
            zIndex: 10,
          }}
        />
      );
    }
   
    else if (lineKey === '0,0-1,1-2,2') {
      // The length of the diagonal across 90% of the board
      const diagonalLength = Math.sqrt(2 * (responsiveBoardSize * 0.9)**2);

      return (
        <Animated.View
          style={{
            position: 'absolute',
            backgroundColor: lineColor,
            height: lineThickness, // Fixed height for the line
            width: diagonalLength, // Fixed width (length) of the diagonal line
            left: responsiveBoardSize * 0.05, // Start 5% from left
            top: responsiveBoardSize * 0.05, // Start 5% from top
            opacity: lineOpacity,
            transform: [
              { translateY: -lineThickness / 2 }, // Center line vertically
              { rotateZ: '45deg' }, // Rotate it
              { scaleX: scaleValue }, // Animate scaleX
            ],
            transformOrigin: 'left center', // Rotate and scale from the start point
            borderRadius: 3,
            zIndex: 10,
          }}
        />
      );
    }
    // Diagonal from top-right to bottom-left (0,2-1,1-2,0)
    else if (lineKey === '0,2-1,1-2,0') {
      const diagonalLength = Math.sqrt(2 * (responsiveBoardSize * 0.9)**2);

      return (
        <Animated.View
          style={{
            position: 'absolute',
            backgroundColor: lineColor,
            height: lineThickness,
            width: diagonalLength,
            right: responsiveBoardSize * 0.05, // Start 5% from right
            top: responsiveBoardSize * 0.05, // Start 5% from top
            opacity: lineOpacity,
            transform: [
              { translateY: -lineThickness / 2 }, // Center line vertically
              { rotateZ: '-45deg' }, // Rotate it
              { scaleX: scaleValue }, // Animate scaleX
            ],
            transformOrigin: 'right center', // Rotate and scale from the start point (right)
            borderRadius: 3,
            zIndex: 10,
          }}
        />
      );
    }

    return null;
  }, [roundWinnerSymbol, winningLine, lineAnimatedProgress, lineOpacity, responsiveBoardSize]); // Changed from lineAnimatedWidth

  const boardContent = useMemo(() => {
    return board.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((cellValue, colIndex) => {
          const cellIndex = rowIndex * 3 + colIndex;
          const isNextToRemove = nextTileToRemove &&
                                nextTileToRemove.row === rowIndex &&
                                nextTileToRemove.col === colIndex;
          const isWinner = isWinningCell(rowIndex, colIndex);

          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cellValue}
              onPress={createCellPressHandler(rowIndex, colIndex)}
              isRemoved={false}
              isNextToRemove={!!isNextToRemove && gameActive}
              isWinning={isWinner}
              pulseAnim={isWinner ? cellsPulseAnim : undefined}
              style={CELL_BORDER_STYLES[cellIndex]}
            />
          );
        })}
      </View>
    ));
  }, [board, nextTileToRemove, gameActive, createCellPressHandler, isWinningCell, cellsPulseAnim]);

  return (
    <View style={[styles.board, { width: responsiveBoardSize, height: responsiveBoardSize }]}>
      {boardContent}
      {renderWinningLine()}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#333',
    margin: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});

export default memo(Board);