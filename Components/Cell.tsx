import { CellValue } from '@/game_logic/ticTacToeStore';
import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from 'react-native';

interface CellProps {
  value: CellValue;
  onPress: () => void;
  isRemoved: boolean;
  isNextToRemove?: boolean;
  isWinning?: boolean;
  pulseAnim?: Animated.Value;
  style?: ViewStyle;
}

const Cell: React.FC<CellProps> = ({ 
  value, 
  onPress, 
  isRemoved, 
  isNextToRemove = false, 
  isWinning = false,
  pulseAnim,
  style 
}) => {
  // Use useRef to persist animations across renders
  const scaleAnim = useRef(new Animated.Value(isRemoved ? 0 : 1)).current;
  const localPulseAnim = useRef(new Animated.Value(1)).current;
  
  // Track previous value to optimize animations
  const prevValueRef = useRef<CellValue>(value);
  const prevRemovedRef = useRef(isRemoved);
  
  // Handle animations when value or removed state changes
  useEffect(() => {
    // Only run animation if the state actually changed
    if (isRemoved !== prevRemovedRef.current) {
      if (isRemoved) {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.back(2),
          useNativeDriver: true,
        }).start();
      }
      prevRemovedRef.current = isRemoved;
    }
    
    // Only run animation when value changes from empty to a symbol
    if (value && value !== prevValueRef.current) {
      scaleAnim.setValue(0.2);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
      prevValueRef.current = value;
    }
  }, [value, isRemoved, scaleAnim]);

  // Pulse animation for cells that will be removed next
  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;
    
    if (isNextToRemove) {
      // Create the animation loop
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(localPulseAnim, {
            toValue: 1.1,
            duration: 600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(localPulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          })
        ])
      );
      
      // Start the animation
      animationLoop.start();
    } else {
      // Reset animation value but don't trigger a new animation
      localPulseAnim.setValue(1);
    }

    // Clean up the animation when the component unmounts or the next-to-remove state changes
    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [isNextToRemove, localPulseAnim]);

  // Use different renderers for removed vs. active cells to optimize performance
  if (isRemoved) {
    return (
      <Animated.View 
        style={[
          styles.cell, 
          styles.removedCell,
          style,
          { transform: [{ scale: scaleAnim }] }
        ]}
      />
    );
  }

  const animToUse = isWinning && pulseAnim ? pulseAnim : isNextToRemove ? localPulseAnim : scaleAnim;

  return (
    <TouchableOpacity 
      style={[
        styles.cell, 
        isNextToRemove && styles.nextToRemoveCell,
        isWinning && styles.winningCell,
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!!value || isNextToRemove}
    >
      {value && (
        <Animated.Text 
          style={[
            styles.symbol, 
            value === 'X' ? styles.xSymbol : styles.oSymbol,
            isWinning && value === 'X' ? styles.winningXSymbol : null,
            isWinning && value === 'O' ? styles.winningOSymbol : null,
            { 
              transform: [
                { scale: animToUse }
              ] 
            }
          ]}
        >
          {value}
        </Animated.Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    aspectRatio: 1,
    backgroundColor: 'transparent',
  },
  symbol: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  xSymbol: {
    color: '#1E88E5',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  oSymbol: {
    color: '#E53935',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  winningXSymbol: {
    color: '#1565C0',
    textShadowColor: 'rgba(25, 118, 210, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 8,
  },
  winningOSymbol: {
    color: '#C62828',
    textShadowColor: 'rgba(211, 47, 47, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 8,
  },
  removedCell: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderColor: '#DDDDDD',
  },
  nextToRemoveCell: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: '#FFC107',
    borderStyle: 'dashed',
  },
  winningCell: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: '#333333',
  },
});

// Use memo to prevent unnecessary re-renders
export default memo(Cell); 