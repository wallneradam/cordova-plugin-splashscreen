var platformSplashscreen = require('cordova/splashscreen');

var SplashScreen = {
    show: function () {
        platformSplashscreen.show();
    },

    hide: function () {
        platformSplashscreen.hide();
    }
};

module.exports = SplashScreen;
require("cordova/exec/proxy").add("SplashScreen", SplashScreen);