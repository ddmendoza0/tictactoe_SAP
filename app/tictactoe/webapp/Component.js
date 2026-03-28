sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("tictactoe", {

    metadata: {
      manifest: "json"
    },

    init: function () {
      // Call parent init first
      UIComponent.prototype.init.apply(this, arguments);

      // Initialize router
      this.getRouter().initialize();

      // Restore game session from localStorage if available
      const sGameID = localStorage.getItem("tictactoe_gameID");
      const sRoute  = localStorage.getItem("tictactoe_route");
      if (sGameID && sRoute === "game") {
        const oModel = this.getModel("game");
        oModel.setProperty("/gameID", sGameID);

        // Fetch current game state from backend
        fetch("/odata/v4/game/Games(" + sGameID + ")").then(res => res.json())
        .then(oResult => {
        if (oResult && oResult.board) {
          oModel.setProperty("/board", oResult.board.split(","));
          oModel.setProperty("/currentPlayer", oResult.currentPlayer);
          oModel.setProperty("/status", oResult.status);
          oModel.setProperty("/player1Score", oResult.player1Score);
          oModel.setProperty("/player2Score", oResult.player2Score);
          oModel.setProperty("/totalMatches", oResult.totalMatches);
          oModel.setProperty("/mode", oResult.mode);
          oModel.setProperty("/difficulty", oResult.difficulty);

          // Rebuild result message if round/series is over
          const bIsDraw = oResult.status === "roundOver" && 
            oResult.player1Score === oResult.player2Score && 
            !oResult.board.split(",").includes(""); 

          if (oResult.status === "roundOver" || oResult.status === "finished") {
            let sResultMessage = "";
            if (bIsDraw) {
              sResultMessage = "It's a draw!";
            } else if (oResult.player1Score > oResult.player2Score) {
              sResultMessage = oResult.status === "finished" ? "Player X wins the series!" : "Player X wins the round!";
            } else {
              const sName = oResult.mode === "HvB" ? "Bot" : "Player O";
              sResultMessage = oResult.status === "finished" ? sName + " wins the series!" : sName + " wins the round!";
            }
            oModel.setProperty("/resultMessage", sResultMessage);
          }

          // Navigate directly to game screen
          this.getRouter().navTo("game");
          }
        })
        .catch(() => {
          // Game not found — clear localStorage
          localStorage.removeItem("tictactoe_gameID");
          localStorage.removeItem("tictactoe_route");
        });
      }
    }
  });
});