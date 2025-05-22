import { create } from 'zustand';

// Tetromino shapes defined with their rotation states
export type TetrominoType = 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z';
export type GameState = 'idle' | 'playing' | 'paused' | 'gameOver';

export interface Position {
  row: number;
  col: number;
}

export interface Tetromino {
  type: TetrominoType;
  position: Position;
  rotation: number;
  shape: boolean[][];
}

// Define game board dimensions
export const BOARD_ROWS = 20;
export const BOARD_COLS = 10;

// Define max level
export const MAX_LEVEL = 10;

// The different tetromino shapes and their rotations
export const TETROMINO_SHAPES: Record<TetrominoType, boolean[][][]> = {
  I: [
    [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false],
    ],
    [
      [false, false, true, false],
      [false, false, true, false],
      [false, false, true, false],
      [false, false, true, false],
    ],
    [
      [false, false, false, false],
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
    ],
    [
      [false, true, false, false],
      [false, true, false, false],
      [false, true, false, false],
      [false, true, false, false],
    ],
  ],
  O: [
    [
      [true, true],
      [true, true],
    ],
    [
      [true, true],
      [true, true],
    ],
    [
      [true, true],
      [true, true],
    ],
    [
      [true, true],
      [true, true],
    ],
  ],
  T: [
    [
      [false, true, false],
      [true, true, true],
      [false, false, false],
    ],
    [
      [false, true, false],
      [false, true, true],
      [false, true, false],
    ],
    [
      [false, false, false],
      [true, true, true],
      [false, true, false],
    ],
    [
      [false, true, false],
      [true, true, false],
      [false, true, false],
    ],
  ],
  L: [
    [
      [false, false, true],
      [true, true, true],
      [false, false, false],
    ],
    [
      [false, true, false],
      [false, true, false],
      [false, true, true],
    ],
    [
      [false, false, false],
      [true, true, true],
      [true, false, false],
    ],
    [
      [true, true, false],
      [false, true, false],
      [false, true, false],
    ],
  ],
  J: [
    [
      [true, false, false],
      [true, true, true],
      [false, false, false],
    ],
    [
      [false, true, true],
      [false, true, false],
      [false, true, false],
    ],
    [
      [false, false, false],
      [true, true, true],
      [false, false, true],
    ],
    [
      [false, true, false],
      [false, true, false],
      [true, true, false],
    ],
  ],
  S: [
    [
      [false, true, true],
      [true, true, false],
      [false, false, false],
    ],
    [
      [false, true, false],
      [false, true, true],
      [false, false, true],
    ],
    [
      [false, false, false],
      [false, true, true],
      [true, true, false],
    ],
    [
      [true, false, false],
      [true, true, false],
      [false, true, false],
    ],
  ],
  Z: [
    [
      [true, true, false],
      [false, true, true],
      [false, false, false],
    ],
    [
      [false, false, true],
      [false, true, true],
      [false, true, false],
    ],
    [
      [false, false, false],
      [true, true, false],
      [false, true, true],
    ],
    [
      [false, true, false],
      [true, true, false],
      [true, false, false],
    ],
  ],
};

// Tetromino colors
export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#00FFFF', // Cyan
  O: '#FFFF00', // Yellow
  T: '#800080', // Purple
  L: '#FF7F00', // Orange
  J: '#0000FF', // Blue
  S: '#00FF00', // Green
  Z: '#FF0000', // Red
};

// Brighter colors for active pieces for better visibility
export const ACTIVE_TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#40FFFF', // Brighter Cyan
  O: '#FFFF40', // Brighter Yellow
  T: '#D040D0', // Brighter Purple
  L: '#FFA040', // Brighter Orange
  J: '#4040FF', // Brighter Blue
  S: '#40FF40', // Brighter Green
  Z: '#FF4040', // Brighter Red
};

export interface BlockBuildingState {
  board: (string | null)[][];
  currentPiece: Tetromino | null;
  nextPiece: Tetromino | null;
  gameState: GameState;
  score: number;
  highScore: number;
  level: number;
  startLevel: number; // New field for starting level selection
  linesCleared: number;

  // Game actions
  setupGame: () => void;     // Setup board and pieces but don't start
  startGame: () => void;     // Start game from idle state
  resetGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  rotate: () => void;
  hardDrop: () => void;
  togglePause: () => void;
  tick: () => void;          // Called on each game tick
  lockPiece: () => void;     // Lock the current piece in place
  generateNewPiece: () => void; // Generate a new tetromino
  checkLines: () => number;  // Check for completed lines and remove them
  isColliding: (piece: Tetromino, position?: Position) => boolean; // Check if piece collides
  setStartLevel: (level: number) => void; // Set starting level
  increaseStartLevel: () => void; // Increase starting level
  decreaseStartLevel: () => void; // Decrease starting level
}

export const useBlockBuildingStore = create<BlockBuildingState>((set, get) => ({
  board: Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null)),
  currentPiece: null,
  nextPiece: null,
  gameState: 'idle',
  score: 0,
  highScore: 0,
  level: 1,
  startLevel: 1,
  linesCleared: 0,

  setupGame: () => {
    const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
    
    // Generate the first two pieces
    const tetrominoTypes: TetrominoType[] = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
    const currentType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
    const nextType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
    
    const currentPiece: Tetromino = {
      type: currentType,
      position: { row: 0, col: Math.floor((BOARD_COLS - 4) / 2) }, // Center the piece
      rotation: 0,
      shape: TETROMINO_SHAPES[currentType][0]
    };
    
    const nextPiece: Tetromino = {
      type: nextType,
      position: { row: 0, col: Math.floor((BOARD_COLS - 4) / 2) },
      rotation: 0,
      shape: TETROMINO_SHAPES[nextType][0]
    };

    // Use the startLevel
    const { startLevel } = get();

    set({
      board,
      currentPiece,
      nextPiece,
      gameState: 'idle',
      score: 0,
      level: startLevel,
      linesCleared: 0,
    });
  },

  startGame: () => {
    // Start from idle state or restart from game over state
    const { gameState } = get();
    if (gameState === 'idle' || gameState === 'gameOver') {
      set({ gameState: 'playing' });
    }
  },

  resetGame: () => {
    const { highScore, score } = get();
    const newHighScore = Math.max(highScore, score);
    
    set(state => ({
      ...state,
      highScore: newHighScore,
    }));
    
    get().setupGame();
  },

  // Modified function for level selection - allows changing during gameplay
  setStartLevel: (level) => {
    if (level >= 1 && level <= MAX_LEVEL) {
      const gameState = get().gameState;
      
      // Update both startLevel and current level
      set({ 
        startLevel: level,
        level: level 
      });
      
      // If game is in idle, we'll update the level when game starts
      // For paused state, level is already updated above
    }
  },

  increaseStartLevel: () => {
    const { level } = get();
    if (level < MAX_LEVEL) {
      get().setStartLevel(level + 1);
    }
  },

  decreaseStartLevel: () => {
    const { level } = get();
    if (level > 1) {
      get().setStartLevel(level - 1);
    }
  },

  moveLeft: () => {
    if (get().gameState !== 'playing') return;

    const { currentPiece } = get();
    if (!currentPiece) return;

    const newPosition = {
      ...currentPiece.position,
      col: currentPiece.position.col - 1
    };

    if (!get().isColliding({...currentPiece, position: newPosition})) {
      set(state => ({
        ...state,
        currentPiece: {
          ...state.currentPiece!,
          position: newPosition
        }
      }));
    }
  },

  moveRight: () => {
    if (get().gameState !== 'playing') return;

    const { currentPiece } = get();
    if (!currentPiece) return;

    const newPosition = {
      ...currentPiece.position,
      col: currentPiece.position.col + 1
    };

    if (!get().isColliding({...currentPiece, position: newPosition})) {
      set(state => ({
        ...state,
        currentPiece: {
          ...state.currentPiece!,
          position: newPosition
        }
      }));
    }
  },

  moveDown: () => {
    if (get().gameState !== 'playing') return;

    const { currentPiece } = get();
    if (!currentPiece) return;

    const newPosition = {
      ...currentPiece.position,
      row: currentPiece.position.row + 1
    };

    if (!get().isColliding({...currentPiece, position: newPosition})) {
      set(state => ({
        ...state,
        currentPiece: {
          ...state.currentPiece!,
          position: newPosition
        }
      }));
    } else {
      // If we cannot move down, lock the piece
      get().lockPiece();
    }
  },

  rotate: () => {
    if (get().gameState !== 'playing') return;

    const { currentPiece } = get();
    if (!currentPiece) return;

    const newRotation = (currentPiece.rotation + 1) % 4;
    const newShape = TETROMINO_SHAPES[currentPiece.type][newRotation];

    const rotatedPiece = {
      ...currentPiece,
      rotation: newRotation,
      shape: newShape
    };

    // Check if the rotation is valid
    if (!get().isColliding(rotatedPiece)) {
      set(state => ({
        ...state,
        currentPiece: rotatedPiece
      }));
    }
  },

  hardDrop: () => {
    if (get().gameState !== 'playing') return;

    const { currentPiece } = get();
    if (!currentPiece) return;

    // Drop the piece as far down as it can go
    let dropRow = currentPiece.position.row;
    while (!get().isColliding({
      ...currentPiece,
      position: { ...currentPiece.position, row: dropRow + 1 }
    })) {
      dropRow++;
    }

    set(state => ({
      ...state,
      currentPiece: {
        ...state.currentPiece!,
        position: { ...state.currentPiece!.position, row: dropRow }
      }
    }));

    get().lockPiece();
  },

  togglePause: () => {
    const { gameState } = get();
    if (gameState === 'playing') {
      set({ gameState: 'paused' });
    } else if (gameState === 'paused') {
      set({ gameState: 'playing' });
    }
  },

  tick: () => {
    if (get().gameState !== 'playing') return;
    get().moveDown();
  },

  lockPiece: () => {
    const { currentPiece, board } = get();
    if (!currentPiece) return;

    // Create a new board with the piece locked in place
    const newBoard = [...board.map(row => [...row])];
    const { type, position, shape } = currentPiece;
    
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardRow = position.row + r;
          const boardCol = position.col + c;
          
          // Check if the piece is out of bounds at the top
          if (boardRow < 0) {
            set({ gameState: 'gameOver' });
            return;
          }
          
          newBoard[boardRow][boardCol] = TETROMINO_COLORS[type];
        }
      }
    }
    
    // Update the board
    set({ board: newBoard });
    
    // Check for completed lines
    const linesCleared = get().checkLines();
    
    // Update score based on lines cleared
    if (linesCleared > 0) {
      const basePoints = [0, 40, 100, 300, 1200]; // Points for 0, 1, 2, 3, 4 lines
      const { score, level, linesCleared: totalLines } = get();
      
      const newScore = score + basePoints[linesCleared] * level;
      const newTotalLines = totalLines + linesCleared;
      
      // Level calculation: Each 10 lines advances the level by 1, starting from the startLevel
      // But we don't reduce level if lines are less - we keep current level or go higher
      const currentLevel = get().level;
      const calculatedLevel = Math.floor(newTotalLines / 10) + get().startLevel;
      const newLevel = Math.max(currentLevel, calculatedLevel);
      
      set({
        score: newScore,
        level: newLevel,
        linesCleared: newTotalLines,
        highScore: Math.max(newScore, get().highScore)
      });
    }
    
    // Generate a new piece
    get().generateNewPiece();
  },

  generateNewPiece: () => {
    const { nextPiece } = get();
    if (!nextPiece) return;
    
    // Move the next piece to current
    const currentPiece = {
      ...nextPiece,
      position: { row: 0, col: Math.floor((BOARD_COLS - 4) / 2) } // Center the piece
    };
    
    // Generate a new next piece
    const tetrominoTypes: TetrominoType[] = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
    const nextType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
    
    const newNextPiece: Tetromino = {
      type: nextType,
      position: { row: 0, col: Math.floor((BOARD_COLS - 4) / 2) },
      rotation: 0,
      shape: TETROMINO_SHAPES[nextType][0]
    };
    
    // Check if the new piece collides immediately - if so, game over
    if (get().isColliding(currentPiece)) {
      set({ gameState: 'gameOver' });
      return;
    }
    
    set({
      currentPiece,
      nextPiece: newNextPiece
    });
  },

  checkLines: () => {
    const { board } = get();
    const newBoard = [...board];
    const completedLines: number[] = [];
    
    // Find completed lines
    for (let row = 0; row < BOARD_ROWS; row++) {
      if (newBoard[row].every(cell => cell !== null)) {
        completedLines.push(row);
      }
    }
    
    // Remove completed lines and add empty lines at the top
    completedLines.forEach(row => {
      // Remove the completed line
      newBoard.splice(row, 1);
      // Add an empty line at the top
      newBoard.unshift(Array(BOARD_COLS).fill(null));
    });
    
    if (completedLines.length > 0) {
      set({ board: newBoard });
    }
    
    return completedLines.length;
  },

  isColliding: (piece, position = piece.position) => {
    const { board } = get();
    const { shape } = piece;
    
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardRow = position.row + r;
          const boardCol = position.col + c;
          
          // Check boundaries
          if (
            boardCol < 0 || 
            boardCol >= BOARD_COLS || 
            boardRow >= BOARD_ROWS || 
            (boardRow >= 0 && board[boardRow][boardCol] !== null)
          ) {
            return true; // Collision detected
          }
        }
      }
    }
    
    return false; // No collision
  }
})); 