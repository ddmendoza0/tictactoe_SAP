sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
  "use strict";

  return Controller.extend("tictactoe.controller.Home", {

    // Triggered when the user clicks "Start Game"
    onStartGame: function () {
      const oModel        = this.getOwnerComponent().getModel("game");
      const sMode         = oModel.getProperty("/mode");
      const sDifficulty   = oModel.getProperty("/difficulty");
      const iTotalMatches = parseInt(oModel.getProperty("/totalMatches"));

      // Pre-set the current player message
      const oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      oModel.setProperty("/currentPlayerMessage", oBundle.getText("playerTurn", ["X"]));

      // Call CAP action directly via OData
      fetch("/odata/v4/game/createGame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: sMode, difficulty: sDifficulty, totalMatches: iTotalMatches })
      })
      .then(res => res.json())
      .then(oResult => {
        const sGameID = oResult.ID;

        // Initialize the game model with a clean state
        oModel.setProperty("/gameID", sGameID);
        oModel.setProperty("/board", ["", "", "", "", "", "", "", "", ""]);
        oModel.setProperty("/currentPlayer", "X");
        oModel.setProperty("/status", "active");
        oModel.setProperty("/player1Score", 0);
        oModel.setProperty("/player2Score", 0);
        oModel.setProperty("/resultMessage", "");

        // Persist the session in localStorage
        localStorage.setItem("tictactoe_gameID", sGameID);
        localStorage.setItem("tictactoe_route", "game");
        UIComponent.getRouterFor(this).navTo("game");
      })
      .catch(oError => console.error("Error creating game:", oError));
    }
  });
});