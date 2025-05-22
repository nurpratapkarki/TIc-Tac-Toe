import { create } from 'zustand';

export type PlayerSymbol = 'X' | 'O'; // Renamed from Player for clarity
export type CellValue = PlayerSymbol | '';
export type Board = CellValue[][];
export type TileCoordinate = { row: number; col: number };

export interface Move {
  playerSymbol: PlayerSymbol; // Renamed
  row: number;
  col: number;
  moveNumber: number;
}

export interface RollingTicTacToeState {
  // Player and Score state
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  // Game board state
  board: Board;
  currentPlayerSymbol: PlayerSymbol; // Renamed
  movesHistory: Move[];
  currentMoveNumber: number;
  nextTileToRemove: TileCoordinate | null;
  // Round/Match status
  roundWinnerSymbol: PlayerSymbol | null; 
  matchWinnerName: string | null;
  isGameOver: boolean; 
  gameMessage: string;
  // Winning line coordinates for visual effects
  winningLine: TileCoordinate[] | null;

  // Actions
  setPlayerNames: (name1: string, name2: string) => void;
  makeMove: (row: number, col: number) => void;
  checkWinCondition: () => void; 
  startNextRound: () => void;   
  startNewMatch: () => void;   
}

const createInitialBoard = (): Board => [
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];


// This will be the state to reset to for a brand new match (e.g., after "Play Again")
const initialMatchStateValues: Omit<RollingTicTacToeState, 'setPlayerNames' | 'makeMove' | 'checkWinCondition' | 'startNextRound' | 'startNewMatch'> = {
  player1Name: 'Player 1', 
  player2Name: 'Player 2', 
  player1Score: 0,
  player2Score: 0,
  board: createInitialBoard(),
  currentPlayerSymbol: 'X',
  movesHistory: [],
  currentMoveNumber: 0,
  roundWinnerSymbol: null,
  matchWinnerName: null,
  isGameOver: false,
  gameMessage: 'Enter player names to start!', 
  nextTileToRemove: null,
  winningLine: null,
};

// This state is for starting a new round within an ongoing match
const getNewRoundState = (currentPlayerSymbol: PlayerSymbol, p1Name: string, p1Score: number, p2Name: string, p2Score: number ): Partial<RollingTicTacToeState> => ({
    board: createInitialBoard(),
    currentPlayerSymbol: currentPlayerSymbol,
    movesHistory: [],
    currentMoveNumber: 0,
    roundWinnerSymbol: null,
    matchWinnerName: null, // Match winner determined by scores
    isGameOver: false, // isGameOver is per match
    gameMessage: `Round Start! ${currentPlayerSymbol === 'X' ? p1Name : p2Name}'s turn.`,
    nextTileToRemove: null,
    winningLine: null,
});


export const useRollingTicTacToeStore = create<RollingTicTacToeState>((set, get) => ({
  ...initialMatchStateValues,

  setPlayerNames: (name1, name2) => {
    const p1 = name1.trim() || initialMatchStateValues.player1Name; // Fallback to default if empty
    const p2 = name2.trim() || initialMatchStateValues.player2Name; // Fallback to default if empty
    
    
    // This logic means if a user *tries* to name themselves "Player 1", it will still effectively be the "unset" state.
    // A more robust way might be a separate flag like `areNamesSet: boolean`.
    const areNamesEffectivelySet = p1 !== initialMatchStateValues.player1Name || p2 !== initialMatchStateValues.player2Name;

    set({
      ...initialMatchStateValues, // Reset everything for a new match with new names
      player1Name: p1,
      player2Name: p2,
      gameMessage: areNamesEffectivelySet 
        ? `Match Start! ${p1} (X) vs ${p2} (O). ${p1}'s turn.` 
        : initialMatchStateValues.gameMessage, // Keep "Enter player names" if names are still default
      currentPlayerSymbol: 'X',
      isGameOver: false, // Ensure game isn't over if starting with default names
      roundWinnerSymbol: null,
      matchWinnerName: null,
    });
  },

  makeMove: (row: number, col: number) => {
    const state = get();
    // Prevent moves if player names are still the default ones
    if (state.player1Name === initialMatchStateValues.player1Name && 
        state.player2Name === initialMatchStateValues.player2Name &&
        state.gameMessage === initialMatchStateValues.gameMessage) { // Extra check for the specific message
      return; 
    }

    if (state.board[row][col] !== '' || state.roundWinnerSymbol || state.isGameOver) {
      return; // Cell taken, round over, or game over
    }

    const newMoveNumber = state.currentMoveNumber + 1;
    const newMove: Move = { playerSymbol: state.currentPlayerSymbol, row, col, moveNumber: newMoveNumber };
    const newMovesHistory = [...state.movesHistory, newMove];
    
    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = state.currentPlayerSymbol;

    let tileActuallyRemovedMessage = "";
    let oldestTileOfCurrentWindow: Move | undefined = undefined;

    if (newMoveNumber > 6) {
      const tileToRemove = newMovesHistory.find(move => move.moveNumber === (newMoveNumber - 6));
      if (tileToRemove) {
        newBoard[tileToRemove.row][tileToRemove.col] = '';
        tileActuallyRemovedMessage = ` Tile at (${tileToRemove.row},${tileToRemove.col}) removed.`;
      }
    }
    
    if (newMoveNumber >= 6) {
        oldestTileOfCurrentWindow = newMovesHistory.find(move => move.moveNumber === (newMoveNumber - 5));
    }

    const nextPlayerSymbol = state.currentPlayerSymbol === 'X' ? 'O' : 'X';
    const nextPlayerName = nextPlayerSymbol === 'X' ? state.player1Name : state.player2Name;

    set({
      board: newBoard,
      currentPlayerSymbol: nextPlayerSymbol,
      movesHistory: newMovesHistory,
      currentMoveNumber: newMoveNumber,
      nextTileToRemove: oldestTileOfCurrentWindow ? {row: oldestTileOfCurrentWindow.row, col: oldestTileOfCurrentWindow.col } : null,
      gameMessage: `${nextPlayerName}'s turn.${tileActuallyRemovedMessage}`,
      roundWinnerSymbol: null, // Reset round winner when a new move is made successfully
    });

    get().checkWinCondition();
  },

  checkWinCondition: () => {
    const { board, currentPlayerSymbol, nextTileToRemove, player1Name, player2Name, player1Score, player2Score, isGameOver, gameMessage } = get();
    
    // Don't check for wins if names are not set
    if (player1Name === initialMatchStateValues.player1Name && 
        player2Name === initialMatchStateValues.player2Name &&
        gameMessage === initialMatchStateValues.gameMessage) {
      return;
    }
    
    const lastPlayerSymbol = currentPlayerSymbol === 'X' ? 'O' : 'X';
    const lastPlayerName = lastPlayerSymbol === 'X' ? player1Name : player2Name;

    const lines = [
      [[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]],
      [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]],
      [[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]],
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      const valA = board[a[0]][a[1]];
      const valB = board[b[0]][b[1]];
      const valC = board[c[0]][c[1]];

      if (valA && valA === valB && valA === valC && valA === lastPlayerSymbol) {
        let isDoomedWin = false;
        if (nextTileToRemove) {
          if ( (line.some(pos => pos[0] === nextTileToRemove.row && pos[1] === nextTileToRemove.col)) ) {
            isDoomedWin = true;
          }
        }

        if (isDoomedWin) {
          set({ gameMessage: `${lastPlayerName} win attempt foiled by doomed tile! (${nextTileToRemove?.row},${nextTileToRemove?.col})` });
          return; 
        } else {
          // Create winning line coordinates for visual effects
          const winningLineCoordinates = line.map(pos => ({ row: pos[0], col: pos[1] }));
          
          let newP1Score = player1Score;
          let newP2Score = player2Score;
          if (lastPlayerSymbol === 'X') newP1Score++;
          else newP2Score++;

          if (newP1Score >= 3 || newP2Score >= 3) {
            const matchWinner = newP1Score >= 3 ? player1Name : player2Name;
            set({
              player1Score: newP1Score,
              player2Score: newP2Score,
              roundWinnerSymbol: lastPlayerSymbol, 
              matchWinnerName: matchWinner,
              isGameOver: true,
              gameMessage: `${matchWinner} wins the match ${newP1Score}-${newP2Score}!`,
              winningLine: winningLineCoordinates,
            });
          } else {
            set({
              player1Score: newP1Score,
              player2Score: newP2Score,
              roundWinnerSymbol: lastPlayerSymbol,
              gameMessage: `${lastPlayerName} wins the round! Score: ${player1Name} ${newP1Score} - ${player2Name} ${newP2Score}. Next round in 3s...`,
              winningLine: winningLineCoordinates,
            });
            if (!isGameOver) { // Check if game isn't already over from a previous state before setting timeout
                setTimeout(() => {
                    if (!get().isGameOver) {
                        get().startNextRound();
                    }
                }, 3000);
            }
          }
          return; 
        }
      }
    }
    const isBoardFull = board.every(row => row.every(cell => cell !== ''));
    if (isBoardFull && !get().roundWinnerSymbol && !get().isGameOver) {
        set({
            gameMessage: "Round is a Tie! No winner. Next round in 3s...",
            roundWinnerSymbol: null, 
            winningLine: null,
        });
        if (!get().isGameOver) {
            setTimeout(() => {
                if (!get().isGameOver) { 
                    get().startNextRound();
                }
            }, 3000);
        }
    }
  },

  startNextRound: () => {
    const state = get();
    if (state.isGameOver) return;
    if (state.player1Name === initialMatchStateValues.player1Name && 
        state.player2Name === initialMatchStateValues.player2Name) {
        // If names are default, reset to initial setup message instead of starting a round.
        set({ gameMessage: initialMatchStateValues.gameMessage, roundWinnerSymbol: null }); 
        return;
    }

    let nextRoundStarter = state.currentPlayerSymbol; 
    if(state.roundWinnerSymbol === 'X') nextRoundStarter = 'O';
    else if (state.roundWinnerSymbol === 'O') nextRoundStarter = 'X';
    
    const nextPlayerName = nextRoundStarter === 'X' ? state.player1Name : state.player2Name;

    set((currentState) => ({
        ...getNewRoundState(nextRoundStarter, currentState.player1Name, currentState.player1Score, currentState.player2Name, currentState.player2Score),
        gameMessage: `Next round! ${nextPlayerName} (${nextRoundStarter}) starts.`,
        // Scores and player names are preserved from currentState by getNewRoundState
        player1Score: currentState.player1Score, 
        player2Score: currentState.player2Score,
        player1Name: currentState.player1Name,
        player2Name: currentState.player2Name,
        roundWinnerSymbol: null, // Clear previous round winner before new round starts
    }));
  },

  startNewMatch: () => { 
    set(initialMatchStateValues); 
  },
}));

// For components, ensure they import from this store, e.g.:
// import { useRollingTicTacToeStore, RollingTicTacToeState } from '../../game-logic/ticTacToeStore'; 