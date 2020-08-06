/**
 * Copyright (c) 2009 University of Toronto.  All rights reserved.
 */

var aegis = aegis || {};
aegis.atrc = aegis.atrc || {};
aegis.atrc.prefs = {};

(function() {

	var showPresentation = true;
	var showPresentationCheckbox;
	var theCheckboxId = "showPresentation";
	
	// Show/hide presentation roles.
	//
	var showHidePresentation = function (evt) {
		if (evt.target.checked) {
			// TODO: does jQuery search by content?
			aegis.atrc.hidePresentation();
		}
		else {
			aegis.atrc.showPresntation();
		}
		evt.preventDefault();
		evt.stopPropagation();
	}
	
	// Bind listeners to widgets.
	//
	aegis.atrc.prefs.init = function() {
		showPresentationCheckbox = jQuery (theCheckboxId);
		if (showPresentationCheckbox) {
			showPresentationCheckbox.click (function (evt) {
				showHidePresentation (evt);
			}
		}
	}
})();

