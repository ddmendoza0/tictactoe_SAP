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
      const oModel = this.getOwnerComponent().getModel("game");
      const sGameID = oModel.getProperty("/gameID");
      const aBoard = oModel.getProperty("/board");
      const sStatus = oModel.getProperty("/status");

      if (sStatus !== "active" || aBoard[iPosition]) return;

      fetch("/odata/v4/game/makeMove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameID: sGameID, position: iPosition })
      })
      .then(res => res.json())
      .then(oResult => {
        this._updateGameModel(oResult);
      })
      .catch(oError => console.error("Error making move:", oError));
    },

    // Starts a new round keeping the same game session
    onNewRound: function () {
      const oModel = this.getOwnerComponent().getModel("game");
      const sGameID = oModel.getProperty("/gameID");

      fetch("/odata/v4/game/newRound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameID: sGameID })
      })
      .then(res => res.json())
      .then(oResult => {
        oModel.setProperty("/resultMessage", "");
        this._updateGameModel(oResult);
      })
      .catch(oError => console.error("Error starting new round:", oError));
    },

    // Updates the local game model with data from the backend
    _updateGameModel: function (oResult) {
      if (!oResult || !oResult.board) return;

      const oModel = this.getOwnerComponent().getModel("game");
      const aBoard = oResult.board.split(",");

      let sResultMessage = "";
      if (oResult.status === "finished" || oResult.status === "roundOver") {
        if (oResult.isDraw) {
          sResultMessage = "It's a draw!";
        } else if (oResult.player1Score > oResult.player2Score) {
          sResultMessage = oResult.status === "finished" ? "Player X wins the series!" : "Player X wins the round!";
        } else {
          const sName = oModel.getProperty("/mode") === "HvB" ? "Bot" : "Player O";
          sResultMessage = oResult.status === "finished" ? sName + " wins the series!" : sName + " wins the round!";
        }
      }

      oModel.setProperty("/board", aBoard);
      oModel.setProperty("/currentPlayer", oResult.currentPlayer);
      oModel.setProperty("/player1Score", oResult.player1Score);
      oModel.setProperty("/player2Score", oResult.player2Score);
      oModel.setProperty("/totalMatches", oResult.totalMatches);
      oModel.setProperty("/resultMessage", sResultMessage);
      // Set status last to trigger visibility bindings
      oModel.setProperty("/status", oResult.status);
    }

  });
});