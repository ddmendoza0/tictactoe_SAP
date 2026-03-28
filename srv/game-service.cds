using tictactoe from '../db/schema';

// Exposes entities and actions
service GameService {
  entity Games as projection on tictactoe.Game;
  entity Moves as projection on tictactoe.Move;
  entity History as projection on tictactoe.History;

  action createGame(mode: String, totalMatches: Integer, difficulty: String) returns Games;
  action makeMove(gameID: UUID, position: Integer)       returns Games;
  action newRound(gameID: UUID)                          returns Games;
}