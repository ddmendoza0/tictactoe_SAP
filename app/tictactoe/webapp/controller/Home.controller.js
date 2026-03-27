sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
  "use strict";

  return Controller.extend("tictactoe.controller.Home", {

    // Triggered when the user clicks "Start Game"
    onStartGame: function () {
      const oModel = this.getView().getModel("game");
      const sMode = oModel.getProperty("/mode");
      const iTotalMatches = parseInt(oModel.getProperty("/totalMatches"));
      const sDifficulty = oModel.getProperty("/difficulty");

      // Call backend to create a new game
      const oODataModel = this.getView().getModel();
      oODataModel.bindContext("/createGame(...)").invoke({
        mode: sMode,
        totalMatches: iTotalMatches
      }).then((oResult) => {
        const sGameID = oResult.ID;

        // Store game ID and settings in local model
        oModel.setProperty("/gameID", sGameID);
        oModel.setProperty("/board", ["", "", "", "", "", "", "", "", ""]);
        oModel.setProperty("/currentPlayer", "X");
        oModel.setProperty("/status", "active");
        oModel.setProperty("/player1Score", 0);
        oModel.setProperty("/player2Score", 0);
        oModel.setProperty("/resultMessage", "");

        // Navigate to game screen
        UIComponent.getRouterFor(this).navTo("game");
      }).catch((oError) => {
        console.error("Error creating game:", oError);
      });
    }

  });
});