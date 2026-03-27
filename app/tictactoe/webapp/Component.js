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
      if (sGameID) {
        const oModel = this.getModel("game");
        oModel.setProperty("/gameID", sGameID);
      }
    }

  });
});