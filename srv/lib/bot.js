const { checkWinner, isBoardFull } = require('./game-logic')
const { PROMPTS } = require('./prompts')

//EASY - Returns a random empty position on the board
function getRandomMove(board) {
  const empty = board
    .map((cell, index) => cell === '' ? index : null)
    .filter(index => index !== null)
  return empty[Math.floor(Math.random() * empty.length)]
}

// Minimax algorithm — scores every possible outcome recursively
// Returns +10 if bot wins, -10 if human wins, 0 for draw
function minimax(board, isMaximizing) {
  const winner = checkWinner(board)
  if (winner === 'O') return 10
  if (winner === 'X') return -10
  if (isBoardFull(board)) return 0

  if (isMaximizing) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O'
        best = Math.max(best, minimax(board, false))
        board[i] = ''
      }
    }
    return best
  } else {
    let best = Infinity
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'X'
        best = Math.min(best, minimax(board, true))
        board[i] = ''
      }
    }
    return best
  }
}

function getEasyMove(board) {
  let worstScore = Infinity
  let worstMove = null
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'O'
      const score = minimax(board, false)
      board[i] = ''
      if (score < worstScore) {
        worstScore = score
        worstMove = i
      }
    }
  }
  return worstMove
}

// Returns best move based on difficulty
// easy — random, medium — mix, hard — minimax
function getBotMove(board, difficulty) {
  if (difficulty === 'easy') {
    return getEasyMove(board)
  }

  if (difficulty === 'medium') {
    return Math.random() < 0.5 ? getRandomMove(board) : getBotMove(board, 'hard')
  }

  // hard — minimax
  let bestScore = -Infinity
  let bestMove = null
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'O'
      const score = minimax(board, false)
      board[i] = ''
      if (score > bestScore) {
        bestScore = score
        bestMove = i
      }
    }
  }
  return bestMove
}

// Calls OpenAI API to get bot move based on current board state
// Falls back to minimax if API call fails or returns invalid response
async function getAIMoveFromOpenAI(board, difficulty) {
  const OpenAI = require('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const emptyPositions = board
    .map((cell, index) => cell === '' ? index : null)
    .filter(index => index !== null)

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: PROMPTS.system[difficulty] || PROMPTS.system.medium },
        { role: 'user', content: PROMPTS.user(board, emptyPositions) }
      ],
      max_tokens: 10
    })

    const move = parseInt(response.choices[0].message.content.trim())

    // Validate that the returned move is a valid empty position
    if (!isNaN(move) && emptyPositions.includes(move)) {
      return move
    }

    // Invalid response from OpenAI — fall back to minimax
    return getBotMove(board, 'hard')

  } catch (error) {
    // OpenAI unavailable — fall back to minimax
    console.log('OpenAI unavailable, falling back to minimax')
    return getBotMove(board, 'hard')
  }
}

module.exports = { getBotMove, getAIMoveFromOpenAI }