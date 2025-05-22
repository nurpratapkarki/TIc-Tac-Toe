import { create } from 'zustand';

export type GameMode = 'timer' | 'moves';

export interface ColorMatchState {
  grid: (string | null)[][];
  score: number;
  highScore: number;
  combo: number;
  timeLeft: number;
  movesLeft: number;
  gameMode: GameMode;
  gameActive: boolean;
  
  // Actions
  initializeGame: (size: number, colorCount: number) => void;
  setGameMode: (mode: GameMode) => void;
  checkForMatches: () => { row: number, col: number }[];
  clearMatches: (tiles: { row: number, col: number }[]) => void;
  dropTiles: () => void;
  addScore: (matchSize: number) => void;
  decreaseTime: () => void;
  decreaseMoves: () => void;
  resetGame: () => void;
}

export const useColorMatchStore = create<ColorMatchState>((set, get) => ({
  grid: [],
  score: 0,
  highScore: 0,
  combo: 0,
  timeLeft: 60, // 60 seconds for timer mode
  movesLeft: 20, // 20 moves for moves mode
  gameMode: 'timer',
  gameActive: false,
  
  initializeGame: (size, colorCount) => {
    const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFEB3B', '#9C27B0'];
    const grid = Array(size).fill(0).map(() => 
      Array(size).fill(0).map(() => 
        colors[Math.floor(Math.random() * Math.min(colorCount, colors.length))]
      )
    );
    
    set({ 
      grid, 
      score: 0, 
      combo: 0,
      timeLeft: 60,
      movesLeft: 20,
      gameActive: true
    });
  },
  
  setGameMode: (mode) => {
    set({ gameMode: mode });
  },
  
  checkForMatches: () => {
    const { grid } = get();
    const matches: { row: number, col: number }[] = [];
    
    // Implementation would detect matching groups of 3+ in rows and columns
    // This is a placeholder for the actual implementation
    
    return matches;
  },
  
  clearMatches: (tiles) => {
    const { grid } = get();
    const newGrid = [...grid];
    
    // Mark matched tiles as null (empty)
    tiles.forEach(({ row, col }) => {
      newGrid[row][col] = null;
    });
    
    set({ grid: newGrid });
  },
  
  dropTiles: () => {
    const { grid } = get();
    const size = grid.length;
    const newGrid = [...grid];
    
    // Process column by column
    for (let col = 0; col < size; col++) {
      // Move all non-null tiles down
      let emptyRow = size - 1;
      for (let row = size - 1; row >= 0; row--) {
        if (newGrid[row][col] !== null) {
          // Swap with the lowest empty position
          if (emptyRow !== row) {
            newGrid[emptyRow][col] = newGrid[row][col];
            newGrid[row][col] = null;
          }
          emptyRow--;
        }
      }
      
      // Fill empty top slots with new colors
      for (let row = emptyRow; row >= 0; row--) {
        const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFEB3B', '#9C27B0'];
        newGrid[row][col] = colors[Math.floor(Math.random() * colors.length)];
      }
    }
    
    set({ grid: newGrid });
  },
  
  addScore: (matchSize) => {
    const { score, combo, highScore } = get();
    
    // Base score for match size
    let points = matchSize * 10;
    
    // Add combo bonus
    points += combo * 5;
    
    const newScore = score + points;
    const newCombo = combo + 1;
    const newHighScore = Math.max(newScore, highScore);
    
    set({ 
      score: newScore, 
      combo: newCombo,
      highScore: newHighScore
    });
  },
  
  decreaseTime: () => {
    const { timeLeft, gameMode } = get();
    if (gameMode !== 'timer' || timeLeft <= 0) return;
    
    const newTimeLeft = timeLeft - 1;
    set({ timeLeft: newTimeLeft, gameActive: newTimeLeft > 0 });
  },
  
  decreaseMoves: () => {
    const { movesLeft, gameMode } = get();
    if (gameMode !== 'moves') return;
    
    const newMovesLeft = movesLeft - 1;
    set({ movesLeft: newMovesLeft, gameActive: newMovesLeft > 0 });
  },
  
  resetGame: () => {
    const { gameMode } = get();
    
    set({ 
      score: 0, 
      combo: 0,
      timeLeft: gameMode === 'timer' ? 60 : 60,
      movesLeft: gameMode === 'moves' ? 20 : 20,
      gameActive: true
    });
    
    // Re-initialize the grid
    const size = get().grid.length;
    get().initializeGame(size, 5);
  }
})); 