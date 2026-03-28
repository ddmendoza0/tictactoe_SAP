# Tic-Tac-Toe — SAP CAP + UI5

## Setup

1. Install dependencies
   `npm install`

2. Deploy the database
   ```cds deploy --to sqlite/tictactoe.db```

3. Start the server
   `cds watch`

4. Open http://localhost:4004

## Environment variables

Copy `.env.example` to `.env` and fill in your OpenAI key.
If no key is provided, the bot falls back to a minimax algorithm.

## Features
- Human vs Human
- Human vs Bot (easy / medium / hard)
- Configurable series length: best of 3, 5, or 7
- Game state persists across browser refreshes