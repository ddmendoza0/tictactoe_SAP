namespace tictactoe;

entity Game {
  key ID        : UUID;
  mode          : String enum { HvH; HvB; };
  status        : String enum { active; rounOver; finished; };
  currentPlayer : String;
  board         : String;
  totalMatches  : Integer;
  player1Score  : Integer default 0;
  player2Score  : Integer default 0;
  createdAt     : Timestamp;
}

entity Move {
  key ID       : UUID;
  game         : Association to Game;
  player       : String;
  position     : Integer;
  moveNumber   : Integer;
  createdAt    : Timestamp;
}

entity History {
  key ID        : UUID;
  mode          : String;
  totalMatches  : Integer;
  player1Score  : Integer;
  player2Score  : Integer;
  winner        : String;
  createdAt     : Timestamp;
}