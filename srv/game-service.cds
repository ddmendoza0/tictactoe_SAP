using tictactoe from '../db/schema';

service GameService {
  entity Games as projection on tictactoe.Game;
  entity Moves as projection on tictactoe.Move;
  entity History as projection on tictactoe.History;

  action createGame(mode: String, totalMatches: Integer) returns Games;
  action makeMove(gameID: UUID, position: Integer)       returns Games;
  action newRound(gameID: UUID)                          returns Games;
}