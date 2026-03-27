sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
  "use strict";

  return Controller.extend("tictactoe.controller.Game", {

    // Navigate back to home screen
    onNavBack: function () {
      UIComponent.getRouterFor(this).navTo("home");
    },

    // Triggered when a board cell is pressed
    onCellPress: function (oEvent) {
      const oSource = oEvent.getSource();
      const iPosition = parseInt(oSource.data("position"));
      const oModel = this.getView().getModel("game");
      const sGameID = oModel.getProperty("/gameID");

      // Call backend to process the move
      const oODataModel = this.getView().getModel();
      oODataModel.bindContext("/makeMove(...)").invoke({
        gameID: sGameID,
        position: iPosition
      }).then((oResult) => {
        this._updateGameModel(oResult);
      }).catch((oError) => {
        console.error("Error making move:", oError);
      });
    },

    // Starts a new round keeping the same game session
    onNewRound: function () {
      const oModel = this.getView().getModel("game");

      // Reset board and status but keep scores
      oModel.setProperty("/board", ["", "", "", "", "", "", "", "", ""]);
      oModel.setProperty("/currentPlayer", "X");
      oModel.setProperty("/status", "active");
      oModel.setProperty("/resultMessage", "");
    },

    // Updates the local game model with data from the backend
    _updateGameModel: function (oResult) {
      const oModel = this.getView().getModel("game");
      const aBoard = oResult.board.split(",");

      oModel.setProperty("/board", aBoard);
      oModel.setProperty("/currentPlayer", oResult.currentPlayer);
      oModel.setProperty("/status", oResult.status);
      oModel.setProperty("/player1Score", oResult.player1Score);
      oModel.setProperty("/player2Score", oResult.player2Score);

      // Set result message when game ends
      if (oResult.status === "finished") {
        if (oResult.player1Score > oResult.player2Score) {
          oModel.setProperty("/resultMessage", "Player X wins the series!");
        } else if (oResult.player2Score > oResult.player1Score) {
          const sWinner = oModel.getProperty("/mode") === "HvB" ? "Bot" : "Player O";
          oModel.setProperty("/resultMessage", sWinner + " wins the series!");
        } else {
          oModel.setProperty("/resultMessage", "It's a draw!");
        }
      }
    }

  });
});