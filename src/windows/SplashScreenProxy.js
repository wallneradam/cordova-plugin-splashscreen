/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

/*jslint sloppy:true */
/*global WinJS */

var isPhone = WinJS.Utilities.isPhone,
    isHosted = window.location.protocol.indexOf('http') === 0,
    bgColor = "#464646",
    splashImageSrc = (isHosted ? "ms-appx-web" : "ms-appx") + ":///images/" +
        (isPhone ? "splashscreenphone.png" : "splashscreen.png");


var splashShown = true;

var localSplash = document.createElement("div");
localSplash.style.backgroundColor = bgColor;
localSplash.style.backgroundImage = "url('" + splashImageSrc + "')";
localSplash.style.backgroundPosition = "center center";
localSplash.style.backgroundSize = window.outerWidth + "px auto";
localSplash.style.backgroundSize = "cover";
localSplash.style.backgroundRepeat = "no-repeat";
localSplash.style.position = "fixed";
localSplash.style.bottom = 0;
localSplash.style.right = 0;
localSplash.style.width = window.outerWidth + 'px';
localSplash.style.height = window.outerHeight + 'px';
localSplash.style.zIndex = "10000";

document.body.appendChild(localSplash);

var config;

function Config(xhr) {
    function loadPreferences(xhr) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xhr.responseText, "application/xml");

        var preferences = doc.getElementsByTagName("preference");
        return Array.prototype.slice.call(preferences);
    }

    this.xhr = xhr;
    this.preferences = loadPreferences(this.xhr);
}

function readConfig(success, error) {
    var xhr;

    if (typeof config != 'undefined') {
        success(config);
    }

    function fail(msg) {
        console.error(msg);

        if (error) {
            error(msg);
        }
    }

    var xhrStatusChangeHandler = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200 || xhr.status == 304 || xhr.status === 0 /* file:// */) {
                config = new Config(xhr);
                success(config);
            }
            else {
                fail('[Browser][cordova.js][xhrStatusChangeHandler] Could not XHR config.xml: ' + xhr.statusText);
            }
        }
    };

    xhr = new XMLHttpRequest();
    xhr.addEventListener("load", xhrStatusChangeHandler);

    try {
        xhr.open("get", "config.xml", true);
        xhr.send();
    } catch (e) {
        fail('[Browser][cordova.js][readConfig] Could not XHR config.xml: ' + JSON.stringify(e));
    }
}

/**
 * Reads a preference value from config.xml.
 * Returns preference value or undefined if it does not exist.
 * @param {String} preferenceName Preference name to read */
Config.prototype.getPreferenceValue = function getPreferenceValue(preferenceName) {
    var preferenceItem = this.preferences && this.preferences.filter(function (item) {
            return item.attributes.name && item.attributes.name.value === preferenceName;
        });

    if (preferenceItem && preferenceItem[0] && preferenceItem[0].attributes && preferenceItem[0].attributes.value) {
        return preferenceItem[0].attributes.value.value;
    }
};


var cordova = require('cordova');

readConfig(function (cfg) {
    var bgColor = cfg.getPreferenceValue('SplashScreenBackgroundColor') || bgColor;
    localSplash.style.backgroundColor = bgColor;

    var autoHide = cfg.getPreferenceValue('AutoHideSplashScreen') === 'true';
    var hideDelay = cfg.getPreferenceValue('SplashScreenDelay') || 3000;

    var orientationPortrait = 10,
        orientationUnlocked = 0;

    var SplashScreen = {
        setBGColor: function (cssBGColor) {
            bgColor = cssBGColor;
            localSplash.style.backgroundColor = bgColor;
        },

        show: function () {
            if (splashShown) return;
            document.body.appendChild(localSplash);
            splashShown = true;
        },

        hide: function () {
            if (!splashShown) return;
            document.body.removeChild(localSplash);
            splashShown = false;
        }
    };

    if (autoHide) setTimeout(function () {
        SplashScreen.hide();
    }, hideDelay);

    module.exports = SplashScreen;
    require("cordova/exec/proxy").add("SplashScreen", SplashScreen);
});
