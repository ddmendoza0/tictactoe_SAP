const cds = require('@sap/cds')
const { checkWinner, isBoardFull, boardToString, stringToBoard } = require('./lib/game-logic')
const { getBotMove, getAIMoveFromOpenAI } = require('./lib/bot')

module.exports = cds.service.impl(async function () {
  const { Games, Moves } = this.entities

  // Creates a new game session
  this.on('createGame', async (req) => {
    const { mode, totalMatches } = req.data
    const id = cds.utils.uuid()

    await INSERT.into(Games).entries({
      ID: id,
      mode,
      status: 'active',
      currentPlayer: 'X',
      board: boardToString(Array(9).fill('')),
      totalMatches,
      player1Score: 0,
      player2Score: 0,
      createdAt: new Date()
    })

    // Explicitly select and return the created game
    const game = await SELECT.one(Games).where({ ID: id })
    return game
  })

  // Processes move and triggers bot if needed
  this.on('makeMove', async (req) => {
    const { gameID, position } = req.data

    // Load current game state
    const game = await SELECT.one(Games).where({ ID: gameID })
    if (!game) return req.error(404, 'Game not found')
    if (game.status === 'finished') return req.error(400, 'Game is already finished')

    const board = stringToBoard(game.board)

    // Validate move
    if (board[position] !== '') return req.error(400, 'Position already taken')

    // Apply move
    board[position] = game.currentPlayer
    await INSERT.into(Moves).entries({
      ID: cds.utils.uuid(),
      game_ID: gameID,
      player: game.currentPlayer,
      position,
      moveNumber: (await SELECT.from(Moves).where({ game_ID: gameID })).length + 1,
      createdAt: new Date()
    })

    // Check result after player move
    const winner = checkWinner(board)
    const draw = !winner && isBoardFull(board)

    if (winner || draw) {
      return await handleRoundEnd(Games, game, board, winner)
    }

    // Switch turn
    let nextPlayer = game.currentPlayer === 'X' ? 'O' : 'X'
    await UPDATE(Games).set({ board: boardToString(board), currentPlayer: nextPlayer }).where({ ID: gameID })

    // Bot move if HvB mode and it's bot's turn
    if (game.mode === 'HvB' && nextPlayer === 'O') {
      const difficulty = game.difficulty || 'medium'
      const botPosition = process.env.OPENAI_API_KEY
        ? await getAIMoveFromOpenAI(board, difficulty)
        : getBotMove(board, difficulty)

      board[botPosition] = 'O'
      await INSERT.into(Moves).entries({
        ID: cds.utils.uuid(),
        game_ID: gameID,
        player: 'O',
        position: botPosition,
        moveNumber: (await SELECT.from(Moves).where({ game_ID: gameID })).length + 1,
        createdAt: new Date()
      })

      const botWinner = checkWinner(board)
      const botDraw = !botWinner && isBoardFull(board)

      if (botWinner || botDraw) {
        return await handleRoundEnd(Games, game, board, botWinner)
      }

      await UPDATE(Games).set({ board: boardToString(board), currentPlayer: 'X' }).where({ ID: gameID })
    }

    return SELECT.one(Games).where({ ID: gameID })
  })

  //Resets the board for a new round keeping scores
  this.on('newRound', async (req) => {
    const { gameID } = req.data
    const game = await SELECT.one(Games).where({ ID: gameID })
    if (!game) return req.error(404, 'Game not found')

    await UPDATE(Games).set({
      board: boardToString(Array(9).fill('')),
      status: 'active',
      currentPlayer: 'X'
    }).where({ ID: gameID })

    return SELECT.one(Games).where({ ID: gameID })
  })
})

// Handles end of a round
async function handleRoundEnd(Games, game, board, winner) {
  let { player1Score, player2Score, totalMatches } = game

  if (winner === 'X') player1Score++
  if (winner === 'O') player2Score++

  // Check if someone won
  const winsNeeded = Math.ceil(totalMatches / 2)
  const seriesOver = player1Score >= winsNeeded || player2Score >= winsNeeded

  await UPDATE(Games).set({
    board: boardToString(board),
    status: seriesOver ? 'finished' : 'roundOver',
    currentPlayer: 'X',
    player1Score,
    player2Score
  }).where({ ID: game.ID })

  return SELECT.one(Games).where({ ID: game.ID })
}

