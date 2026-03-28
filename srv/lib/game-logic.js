
// WINCONDITIONS
const WINNING_COMBINATIONS = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // center column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal
  [2, 4, 6], // reverse diagonal
]

// Checks win conditions
function checkWinner(board) {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

// Check for draw
function isBoardFull(board) {
  return board.every(cell => cell !== '')
}

// ******* DB CONVERSION *******
// To db
function boardToString(board) {
  return board.join(',')
}

// from db
function stringToBoard(str) {
  return str.split(',')
}

module.exports = { checkWinner, isBoardFull, boardToString, stringToBoard }