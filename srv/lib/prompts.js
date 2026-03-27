const PROMPTS = {
  system: {
    easy: 'You are a terrible tic-tac-toe player. You play as O. Try to lose the game while making it look like you are trying to win.',
    medium: 'You are a casual tic-tac-toe player. You play as O. Choose a reasonable but not perfect move.',
    hard: 'You are an expert tic-tac-toe player. You play as O. Analyze the board and choose the optimal move to win or prevent losing.'
  },

  user: (board, emptyPositions) => `
Current board state (positions 0-8):
${board[0]||0} | ${board[1]||1} | ${board[2]||2}
---------
${board[3]||3} | ${board[4]||4} | ${board[5]||5}
---------
${board[6]||6} | ${board[7]||7} | ${board[8]||8}

Available empty positions: ${emptyPositions.join(', ')}
Reply ONLY with a single number between 0 and 8 that is an available empty position. No explanation.
  `
}

module.exports = { PROMPTS }