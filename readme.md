# Tic-Tac-Toe — SAP CAP + UI5

## Setup

1. Clone this repository
   `git clone https://github.com/ddmendoza0/tictactoe_SAP.git`
   `cd tictactoe_SAP`

2. Install dependencies
   `npm install`

3. Deploy the database
   `cds deploy --to sqlite:db/tictactoe.db`

4. Start the server
   `cds watch`

5. Open http://localhost:4004/tictactoe/webapp/index.html

## Environment Variables Setup

Copy `.env.example` to `.env` and fill in your OpenAI key.
If no key is provided, the bot falls back to a minimax algorithm.

## Features
- Human vs Human
- Human vs Bot (easy / medium / hard)
- Configurable series length: best of 3, 5, or 7
- Game state persists across browser refreshes
- Match history is persisted to the database and accessible via `/odata/v4/game/History`
- Multilanguage support (English / Spanish)

## Tech Stack
- Backend: SAP CAP (Node.js) with CDS models and OData V4
- Frontend: SAPUI5 (sap_horizon theme)
- Database: SQLite (local development)
- AI: OpenAI gpt-4o-mini with minimax fallback
