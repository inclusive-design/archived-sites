/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery, window*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};
(function ($, fluid) {

    /**
     * Initialize Preference Editor. This version of Preferences Editor uses the
     * page itself as a live preview.
     *
     * Makes use of a schema to configure Preferences Editor
     */
    demo.initPrefsEditor = function (container) {
        return fluid.prefs.create(container, {
            build: {
                gradeNames: ["fluid.prefs.auxSchema.starter"],
                auxiliarySchema: {
                    "templatePrefix": "../../../framework/preferences/html/",
                    "messagePrefix": "../../../framework/preferences/messages/"
                }
            }
        });
    };

})(jQuery, fluid);
