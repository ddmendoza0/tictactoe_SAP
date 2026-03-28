sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
  "use strict";

  return Controller.extend("tictactoe.controller.Game", {

    // Navigate back to home screen
    onNavBack: function () {
      localStorage.setItem("tictactoe_route", "home");
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

      const oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      const oModel  = this.getOwnerComponent().getModel("game");
      const aBoard  = oResult.board.split(",");

      // Set current player message
      oModel.setProperty("/currentPlayerMessage", oBundle.getText("playerTurn", [oResult.currentPlayer]));

      let sResultMessage = "";
      if (oResult.status === "finished" || oResult.status === "roundOver") {
        const bIsFinished = oResult.status === "finished";
        const sMode = oModel.getProperty("/mode");

        if (oResult.isDraw) {
          sResultMessage = oBundle.getText("drawMessage");
        } else if (oResult.player1Score > oResult.player2Score) {
          sResultMessage = oBundle.getText(bIsFinished ? "playerXWinsSeries" : "playerXWinsRound");
        } else {
          if (sMode === "HvB") {
            sResultMessage = oBundle.getText(bIsFinished ? "botWinsSeries" : "botWinsRound");
          } else {
            sResultMessage = oBundle.getText(bIsFinished ? "playerOWinsSeries" : "playerOWinsRound");
          }
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