/**
 * Copyright (c) 2009 University of Toronto.  All rights reserved.
 * @author Joseph Scheuhammer.
 */

var aegis = aegis || {};
aegis.atrc = aegis.atrc || {};
aegis.atrc.prefs = aegis.atrc.prefs || {};

(function() {
	
	// Some keycodes.
	// TODO:  get this from some other standard .js
	//
	var UP_ARROW = 38;
	var DOWN_ARROW = 40;
	var LEFT_ARROW = 37;
	var RIGHT_ARROW = 39;
	var SPACE_BAR = 32;
	var ENTER = 13;
	var RETURN = 13;
	var ESCAPE = 27;
	
	// Styles for the list-of-role-items "window".
	//
	var theRoleListWinId = "roleListWin";
	var theRoleListControlsId = "controlPanel";
	var theRoleListPanelId = "roleListPanel";
	var theRoleListWinStyles = {
		width:				"33%",
		marginRight:		"66%",
		position:			"fixed",
		backgroundColor:	"darkgray"
	};	
	var theRoleListPanelStyles = {
		height:				"60%",
		width:				"33%",
		backgroundColor:	"darkgray",
		overflow:			"auto",
		position:			"fixed"
	};	
	
	// "Suffix" for font sizes.
	//
	var theSizeSuffix = /px|%|pt|em|ex/;
	
	// "Standard" styles for magnified view.  The first set
	// is static and simply set.  The second is animated.
	//
	var theStaticMagStyles = {
		borderLeftStyle:	"outset",
		borderTopStyle:		"outset",
		borderRightStyle:	"outset",
		borderBottomStyle:	"outset",
		borderLeftColor:	"#808080",
		borderTopColor:		"#808080",
		borderRightColor:	"#808080",
		borderBottomColor:	"#808080",
		backgroundColor:	"#ffff00",		// place holder, set by role
		color:				"#0000ff"		// place holder, set by role
	};
	
	var theAnimMagStyles = {
		borderLeftWidth:	"4px",
		borderTopWidth:		"4px",
		borderRightWidth:	"4px",
		borderBottomWidth:	"4px",
		fontSize:			"100%"			// placeholder, set by role.
	};
	
	// Id's of size/color inputs in contorl panel.
	// see loadRoleListWin()
	//
	var theMenuMagFactor		= "#menuMagFactor";
	var theMenuColour			= "#menuColour";
	var theMenuBgColour			= "#menuBgColour";
	
	var theToolbarMagFactor		= "#toolbarMagFactor";
	var theToolbarColour		= "#toolbarColour";
	var theToolbarBgColour		= "#toolbarBgColour";
	
	var theCheckboxMagFactor	= "#checkboxMagFactor";
	var theCheckboxColour		= "#checkboxColour";
	var theCheckboxBgColour		= "#checkboxBgColour";
	
	var theTextboxMagFactor		= "#textboxMagFactor";
	var theTextboxColour		= "#textboxColour";
	var theTextboxBgColour		= "#textboxBgColour";
	
	// Checkboxes in the control panel
	// see loadRoleListWin()
	//
	var theFollowFocus;
	var theFollowMouse;
	var theOverlayMag;
	var	theMagMenus;
	var theMagToolbars;
	var theMagCheckboxes;
	
	// The animation time out.
	//
	var ANIM_DELAY = 150;	// msec.
	
	// The current overlay, if any.
	//
	var theCloneOverlay = null;
	
	// Device for controlling magnification of a toolbar
	//
	var theMagnifiedToolbar = null;
	
	// Initialize the list of things with roles.
	//
	var theRoleItems = [];
	aegis.atrc.theRoles = theRoleItems;
	aegis.atrc.getRoles = function (/*boolean?*/ force) {
		if (theRoleItems.length == 0 ||  force){
			theRoleItems = jQuery.makeArray (jQuery ("[role]"));
			
			// Handle iframes.
			//
			var frames = jQuery ("iframe");
			jQuery.each (frames, function (i) {
				var aFrame = frames[i];
				var moreRoles = jQuery.makeArray (jQuery ("[role]", aFrame.contentDocument));
				jQuery.merge (theRoleItems, moreRoles);
			});
			aegis.atrc.theRoles = jQuery (theRoleItems);
		}
		return theRoleItems;
	
	}	// end getRoles().
	
	aegis.atrc.getName = function (/*Element*/ anEl) {
		var jEl = jQuery (anEl);
		var byLabel = jEl.attr ("aria-labelledby");
		var name = ( byLabel ? jQuery (byLabel).text() : null );

		if (!name) {
			name = jEl.attr ("aria-label");
			if (!name) {
				name = jEl.attr ("alt");
				if (!name) {
					name = jEl.attr ("title");
					if (!name) {
						name = jEl.text();
						if (!name) {
							name = "anonymous";
						}
					}
				}
			}
		}
		return name;
	
	}	// end getName().
	
	// Effect the style changes.
	//
	var doInputStyleChanges = function (/*String*/ inId) {
		var newStyles = {};
		var magFactor = Number (jQuery (inId+"MagFactor").attr ("value"));
		if (isNaN (magFactor))
			magFactor = 150;
			
		newStyles.fontSize = magFactor;
		newStyles.color = jQuery (inId+"Colour").attr ("value");
		newStyles.backgroundColor = jQuery (inId+"BgColour").attr ("value");
		
		if (inId == "#textbox") {
			var jEditBody = jQuery (jQuery ("#edit")[0].contentWindow.document.body);
			if (jEditBody) {
				newStyles.fontSize += "%";
				jEditBody.css (newStyles);
			}
		}
		else {
			var role = "";
			if (inId == "#toolbar") {
				role = "toolbar";
			}
			else if (inId == "#menu") {
				role = "combobox";
			}
			else if (inId == "#checkbox") {
				role = "checkbox";
			}
			jQuery.each (aegis.atrc.theOrigRoleStyles, function (idx) {
				var anOrigStyles = aegis.atrc.theOrigRoleStyles[idx];
				if (anOrigStyles.jRoleEl.attr ("role") == role) {
					 aegis.atrc.magnifyEl (anOrigStyles, newStyles);
				}
/*				
				if (role == "combobox") {
					if (anOrigStyles.jRoleEl.attr ("role") == "menuitem") {
						setTimeout (function() { aegis.atrc.magnifyEl (anOrigStyles, newStyles); }, ANIM_DELAY);
					}
				}
				if (role == "toolbar") {
					if (anOrigStyles.jRoleEl.attr ("role") == "button") {
						setTimeout (function() { aegis.atrc.magnifyEl (anOrigStyles, newStyles); }, ANIM_DELAY);
					}
				}
*/
			});
		}
		
	};	// end handleInputStyleChanges().
	
	// Change listener for the edit pane styles.
	//
	var handleInputStyleChanges = function (evt) {
		var givenId = jQuery (evt.target).attr ("id");
		if (givenId) {
			givenId = givenId.replace (/MagFactor|Colour|BgColour/, "");
			var doMag = jQuery ("#"+givenId).attr ("checked");
			if ((givenId == "textbox") || doMag || (!theFollowFocus.attr ("checked"))) {
				doInputStyleChanges ("#"+givenId);
			}
		}

	};	// end handleInputStyleChanges().
	
	// Clear all the given magnified role, except the text box.
	// If no roles are given, all are reset, except the text box.
	//
	var resetRoleElements = function (/*String?*/ role) {
		jQuery.each (aegis.atrc.theOrigRoleStyles, function (idx) {
			var aPrevStyles = aegis.atrc.theOrigRoleStyles[idx];
			var aPrevRole = aPrevStyles.jRoleEl.attr ("role");
			if (role) {
				if (aPrevRole == role && aPrevRole != "textbox") {
					aegis.atrc.magnifyEl (aPrevStyles, 100);
				}
			}
			else if (aPrevRole != "textbox") {
				aegis.atrc.magnifyEl (aPrevStyles, 100);
			}
		});
	
	};	// end resetRoleElements
	
	// Show roles in a window.
	//
	var theRolesWindow;
	var theListItemRoles = [];	// array of <li>

	var loadRoleListWin = function() {
		var roleListWin = jQuery ("<div id='" + theRoleListWinId + "'>");
		roleListWin.append ((jQuery ("<h3 tabinindex='0'>Magnifier</h3>").css ({textAlign: "left", marginLeft: "1em"})));
		
		var controlPanel = jQuery ("<div id='" + theRoleListControlsId + "'>");
		roleListWin.append (controlPanel[0]);
		
		// Controls.
		//
		var fieldSet = jQuery ("<fieldset>");
		fieldSet.css ( {
			textAlign: "left",
			marginLeft: "1em",
			marginRight: "6px"
		});
		fieldSet.append ("<legend>Control Panel</legend>");
		// fieldSet.append ("<label for='magFactor'>Magnification factor(%) <input id='magFactor' name='magFactor' value='150' size='9'></label><br>");
		fieldSet.append ("<label for='followFocus'><input id='followFocus' type='checkbox' name='followFocus' checked='checked'>Apply magnification upon focus</label><br><br>");
		var table = jQuery ("<table>");
		
		table.append ("<tr><th> </th><th>Size<br/>(%)</th><th>Color</th><th>Bkgrd</th></tr>");
		
		table.append ("<tr><td><input id='menu' type='checkbox'><label for='menu'>Menus</label></td><td><input id='menuMagFactor' name='menuMagFactor' value='200' size='4'></td><td><input id='menuColour' name='menuColour' value='blue' size='5''></td><td><input id='menuBgColour' name='menuBgColour' value='yellow' size='5'></td></tr>");
		
		table.append ("<tr><td><input id='toolbar' type='checkbox'><label for='toolbar'>Toolbar</label></td><td><input id='toolbarMagFactor' name='toolbarMagFactor' value='400' size='4'></td><td><input id='toolbarColour' name='toolbarColour' value='black' size='5''></td><td><input id='toolbarBgColour' name='toolbarBgColour' value='#00eeff' size='5'></td></tr>");
		
		table.append ("<tr><td><input id='checkbox' type='checkbox'><label for='checkbox'>Checkbox</td><td><input id='checkboxMagFactor' name='checkboxMagFactor' value='500' size='4'></td><td><input id='checkboxColour' name='checkboxColour' value='white' size='5''></td><td><input id='checkboxBgColour' name='checkboxBgColour' value='black' size='5'></td></tr>");
		
		table.append ("<tr><td>Edit Pane</td><td><input id='textboxMagFactor' name='textboxMagFactor' value='200' size='4'></td><td><input id='textboxColour' name='textboxColour' value='yellow' size='5'></td><td><input id='textboxBgColour' name='textboxBgColour' value='black' size='5'></td></tr>");
		fieldSet.append (table);
		
		// Elements no longer shown, but needed for the machinery (hack, hack, hack).
		//
		var oldControls = jQuery ("<div style='display: none;'>");
		oldControls.append ("<label for='followMouse'><input id='followMouse' type='checkbox' name='followMouse'>Magnification follows mouse</label><br>");
		oldControls.append ("<label for='magByOverlay'><input id='magByOverlay' type='checkbox' name='magByOverlay'>Overlay magnification</label><br>");
		oldControls.append ("<label for='showHidePresentation'><input id='showHidePresentation' type='checkbox' name='showHidePres' checked='checked'>Hide role=presentation</label><br>");
		fieldSet.append (oldControls);
		fieldSet.append ("<br>");

		var refreshButton = jQuery ("<div><button id='refreshButton'>Refresh Role List</button></div>");
		refreshButton.css ("text-align", "right");
		fieldSet.append (refreshButton);
		
		theFollowFocus = jQuery ("#followFocus", fieldSet);
		theFollowMouse = jQuery ("#followMouse", fieldSet);
		theOverlayMag = jQuery ("#magByOverlay", fieldSet);
		theMagMenus = jQuery ("#menu", fieldSet);
		theMagToolbars = jQuery ("#toolbar", fieldSet);
		theMagCheckboxes = jQuery ("#checkbox", fieldSet);
		
		controlPanel.append (fieldSet);
		controlPanel.append (jQuery ("<hr>").css ("width", "90%"));
		
		aegis.atrc.prefs.init (roleListWin);
		return roleListWin;
	
	}	// end loadRoleListWin().
	
	var createRoleListWin = function() {
		var mainWin = jQuery ("#"+theRoleListWinId);
		var listDiv;
		if (!mainWin[0]) {
			mainWin = loadRoleListWin();
			mainWin.css (theRoleListWinStyles);
			listDiv = jQuery ("#"+theRoleListPanelId, mainWin[0]);
			listDiv.css (theRoleListPanelStyles);
		}
		
		// Attach a listener to the header of the "window" to show/hide its contents.
		//
		var showHide = function (jElement) {
			if (jElement.css ("display") == "none") {
				jElement.css ("display", "block");
			}
			else {
				jElement.css ("display", "none");
			}
		}
		jQuery ("h3", mainWin).click (function() {
			showHide (jQuery ("#"+theRoleListControlsId));
			showHide (jQuery ("#"+theRoleListPanelId));
		});
		
		return mainWin;
	
	}	// end createRoleListWin().
	
	// Bind click listeners to the "control panel" elements.
	// - Button to refresh the list of roles.
	// - Checkbox for magnification to track focus.
	// - Checkbox for magnification to track mouse.
	// - Show/hide items with role="presentation
	//
	aegis.atrc.prefs.init = function(/*Object?*/ mainWin) {
		var roleListWin = mainWin || loadRoleListWin();
		if (roleListWin) {
			jQuery ("#refreshButton", roleListWin).click (aegis.atrc.showRolesWindow);
			jQuery ("#showHidePresentation", roleListWin).click (aegis.atrc.showHidePresentation);
		}
	}

	// Utility to see if an item is visible.
	//
	aegis.atrc.isVisible = function (index) {
		return jQuery (theListItemRoles[index]).css ("display") != "none";
	}
	
	// Searching down, find first list item with display != "none",
	// starting at the given index.
	//
	var findVisibleDown = function (index) {
		var itemIndex = -1;
		for (var i = index; i < theListItemRoles.length; i++) {
			if (aegis.atrc.isVisible (i)) {
				itemIndex = i;
				break;
			}
		}
		return itemIndex;
	}
	
	// Searching up, find first list item with display != "none",
	// starting at the given index.
	//
	var findVisibleUp = function (index) {
		var itemIndex = -1;
		for (var i = index; i > -1; i--) {
			if (aegis.atrc.isVisible (i)) {
				itemIndex = i;
				break;
			}
		}
		return itemIndex;
	}
	
	// Find the "accessible" parent.
	// Given an Element as the starting point, searches up the DOM until
	// an Element is found that has a non-presentation role.  Returns
	// that Element as a jQuery object, or "null" if no accessible
	// parent is found.
	//
	aegis.atrc.findAccParent = function (/*Element*/ accChild) {
		var jChild = (accChild ? jQuery (accChild) : null);
		var jAccParent = null;
		
		while (jChild) {
			var jParent = jChild.parent();
			if (jParent[0] instanceof Document) {
				break;
			}
			
			var parentRole = jParent.attr ("role");
			if (parentRole && parentRole != "presentation") {
				jAccParent = jParent;
				break;
			}
			
			jChild = jParent;		// loop again to get next parent.
		}
		return jAccParent;
		
	}	// end findAccParent().
	
	// Create and return "backup" of current styles.
	//
	aegis.atrc.elementCurrentStyles = function (/*Element|$*/ jElement, /*boolean?*/ isMagnified) {
		var elAndStyles;
		if (jElement) {
			if (jElement instanceof Element) jElement = jQuery (jElement);
			
			elAndStyles = {};
			elAndStyles.jRoleEl = jElement;
			elAndStyles.isMagnified = (isMagnified ? isMagnified : false);
			elAndStyles.hasFocus = false;
			
			elAndStyles.staticResetStyles = {};
			elAndStyles.staticResetStyles.borderLeftColor = jElement.css ("border-left-color");
			elAndStyles.staticResetStyles.borderTopColor = jElement.css ("border-top-color");
			elAndStyles.staticResetStyles.borderRightColor = jElement.css ("border-right-color");
			elAndStyles.staticResetStyles.borderBottomColor = jElement.css ("border-bottm-color");
			elAndStyles.staticResetStyles.borderLeftStyle = jElement.css ("border-left-style");
			elAndStyles.staticResetStyles.borderTopStyle = jElement.css ("border-top-style");
			elAndStyles.staticResetStyles.borderRightStyle = jElement.css ("border-right-style");
			elAndStyles.staticResetStyles.borderBottomStyle = jElement.css ("border-bottom-style");
			elAndStyles.staticResetStyles.backgroundColor = jElement.css ("background-color");
			elAndStyles.staticResetStyles.color = jElement.css ("color");
			
			elAndStyles.animResetStyles = {};
			elAndStyles.animResetStyles.borderLeftWidth = jElement.css ("border-left-width");
			elAndStyles.animResetStyles.borderTopWidth = jElement.css ("border-top-width");
			elAndStyles.animResetStyles.borderRightWidth = jElement.css ("border-right-width");
			elAndStyles.animResetStyles.borderBottomWidth = jElement.css ("border-bottom-width");
			if (jElement[0].style && jElement[0].style.fontSize) {
				elAndStyles.animResetStyles.fontSize = jElement[0].style.fontSize;
			}
			else {
				elAndStyles.animResetStyles.fontSize = "100%";
			}
			elAndStyles.oldStyleVal = jElement.attr ("style");			
		}
		return elAndStyles;
		
	}	// end aegis.atrc.elementCurrentStyles().

	// Get the roles, show a list of them, and add
	// (1) key listeners for the list to mag/min each role while navigating thru list,
	// (2) focus/blur listeners on the roles to mag/min as they are focussed,
	// (3) hover listener to mag on hover.
	//
	aegis.atrc.theOrigRoleStyles = [];
	aegis.atrc.showRolesWindow = function() {
		aegis.atrc.getRoles (true);		// refresh
		aegis.atrc.theOrigRoleStyles.length = 0;
		
		// List navigation via arrow keys.
		// TODO:  handle case when focus is on a role=presentation when user
		// hides them.
		//
		var arrowKeyNav = function (evt) {
			var index = jQuery.inArray (evt.target, theListItemRoles);
			var oldIndex = index;
			
			if (evt.which == UP_ARROW || evt.which == LEFT_ARROW) {
				index = findVisibleUp (index-1);
				if (index < 0) {
					index = oldIndex;
				}
				evt.preventDefault();
				evt.stopPropagation();
			}
			else if (evt.which == DOWN_ARROW || evt.which == RIGHT_ARROW) {
				index = findVisibleDown (index+1);
				if (index < 0) {
					index = oldIndex;
				}
				evt.preventDefault();
				evt.stopPropagation();
			}
			theListItemRoles[index].focus();
		}
		
		// Create an html list of roles.
		//
		var listDiv = jQuery ("<div id='" + theRoleListPanelId + "'>");
		listDiv.css (theRoleListPanelStyles);
		var list = jQuery ("<ul>");
		theListItemRoles.length = 0;
		jQuery (theRoleItems).each (function (i) {
			var jRoleElement = jQuery (theRoleItems[i]);
			var roleElId = jRoleElement.attr ("id");
			var jListItem = jQuery ("<li tabindex='-1'>" +
				jRoleElement.attr ("role") + 
				" [" + aegis.atrc.getName (jRoleElement[0]) + "]" +
				(roleElId ? " #" + roleElId : "") +
				"</li>"
			);
			theListItemRoles.push (jListItem[0]);
			
			// Record current static and to-be-animated styles.
			//
			var roleElementAndStyles = aegis.atrc.elementCurrentStyles (jRoleElement);
			aegis.magnify.initImagesInfo (roleElementAndStyles);

			// Add "click" and keyboard listeners to list items.
			//
			aegis.atrc.addMagOnClick (jListItem, roleElementAndStyles);
			jListItem.keydown (arrowKeyNav);
			jListItem.appendTo (list[0]);
			
			// Focus/blur and hover listeners for non-presentational roles elements.
			//
			if (roleElementAndStyles.jRoleEl.attr ("role") != "presentation") {
				aegis.atrc.magOnFocus (roleElementAndStyles);
				aegis.atrc.resetOnBlur (roleElementAndStyles);
				aegis.atrc.magOnHover (roleElementAndStyles);
			}
			
			aegis.atrc.theOrigRoleStyles.push (roleElementAndStyles);
		});
		jQuery (list).css ("fontSize", "100%");
		list.appendTo (listDiv[0]);
		
		// Create a window to display the html list.
		//
		var mainWin = createRoleListWin();
		listDiv.appendTo (mainWin);
		
		// Move the right margin left for the main content.  Look for main content
		// <div> element.
		jQuery ("div#mainContent").css ({left: "auto", right: "auto", marginLeft: "34%", width: "66%", overflow: "auto"});
		
		// TODO:  clean up <theRolesWindow> without breaking the refresh button.
		// Possible do the remove() only on the old list, not the entire
		// control-panel + role-list <div>
		// 
//		if (theRolesWindow) theRolesWindow.remove();
		theRolesWindow = mainWin;
		theRolesWindow.prependTo ("body");
		aegis.atrc.showHidePresentation();
		
		// Attach change listener to Edit Pane style inputs.
		//
		jQuery (theMenuMagFactor).change (handleInputStyleChanges);
		jQuery (theMenuColour).change (handleInputStyleChanges);
		jQuery (theMenuBgColour).change (handleInputStyleChanges);
		jQuery (theToolbarMagFactor).change (handleInputStyleChanges);
		jQuery (theToolbarColour).change (handleInputStyleChanges);
		jQuery (theToolbarBgColour).change (handleInputStyleChanges);
		jQuery (theCheckboxMagFactor).change (handleInputStyleChanges);
		jQuery (theCheckboxColour).change (handleInputStyleChanges);
		jQuery (theCheckboxBgColour).change (handleInputStyleChanges);
		jQuery (theTextboxMagFactor).change (handleInputStyleChanges);
		jQuery (theTextboxColour).change (handleInputStyleChanges);
		jQuery (theTextboxBgColour).change (handleInputStyleChanges);
		
		// Magnify menubars on demand.
		//
		jQuery (theMagMenus).click (function (evt) {
			if (theMagMenus.attr ("checked")) {
				doInputStyleChanges ("#menu");
			}
			else {
				resetRoleElements ("combobox");
			}
		});

		// Magnify toolbars on demand.
		//
		jQuery (theMagToolbars).click (function (evt) {
			if (theMagToolbars.attr ("checked")) {
				doInputStyleChanges ("#toolbar");
			}
			else {
				resetRoleElements ("toolbar");
			}
		});
		
		// Magnify check boxes on demand.
		//
		jQuery (theMagCheckboxes).click (function (evt) {
			if (theMagCheckboxes.attr ("checked")) {
				doInputStyleChanges ("#checkbox");
			}
			else {
				resetRoleElements ("checkbox");
			}
		});
		
		// Magnify everything.
		//
		jQuery (theFollowFocus).click (function (evt) {
			if (theFollowFocus.attr ("checked")) {
				resetRoleElements();
			}
			else {
				doInputStyleChanges ("#menu");
				doInputStyleChanges ("#toolbar");
				doInputStyleChanges ("#checkbox");
			}
		});
		
		return theRolesWindow;
	
	}	// end showRolesWindow().
	
	// Get the current magnification factor
	// Default return value is as given, or, if absent, 150%.
	// If <role> argument present, gets the magnification factor from the
	// appropriate role text field.
	//
	var getMagFactor = function (/*Number?*/ defaultMag, /*String?*/ role) {
		var retVal = Number (defaultMag) || 150;
		var magFactor = Number (jQuery ("#magFactor").attr ("value"));
		if (role) {
			if (role == "menu" || role == "combobox" || role == "menuitem") {
				magFactor = Number (jQuery (theMenuMagFactor).attr ("value"));
			}
			else if (role == "toolbar" || role == "button") {
				magFactor = Number (jQuery (theToolbarMagFactor).attr ("value"));
			}
			else if (role == "checkbox") {
				magFactor = Number (jQuery (theCheckboxMagFactor).attr ("value"));
			}				
		}
		if (!isNaN (magFactor))
			retVal = magFactor;
		
		return retVal;
	
	}	// end getMagFactor().
	
	// Get the current magnification styles as an object in the form:
	//
	//	{ fontSize: 150, color: "yellow", backgroundColor: "#00ffee" }
	//
	// Where the values in quotes will be the contents of the various UI
	// inputs fields.
	//
	// Note: that this object format is set up for use by jQuery.css() or
	// jQuery.animate().
	//
	var getMagStyles = function (/*String*/ role) {
		var retVal = {};
				
		if (role == "menu" || role == "combobox" || role == "menuitem") {
			retVal.fontSize = getMagFactor (150, role);
			retVal.color = jQuery (theMenuColour).attr ("value");
			retVal.backgroundColor = jQuery (theMenuBgColour).attr ("value");
		}
		else if (role == "toolbar" || role == "button") {
			retVal.fontSize = getMagFactor (150, role);
			retVal.color = jQuery (theToolbarColour).attr ("value");
			retVal.backgroundColor = jQuery (theToolbarBgColour).attr ("value");
		}
		else if (role == "checkbox") {
			retVal.fontSize = getMagFactor (150, role);
			retVal.color = jQuery (theCheckboxColour).attr ("value");
			retVal.backgroundColor = jQuery (theCheckboxBgColour).attr ("value");
		}
		else {
			retVal.fontSize = getMagFactor (150);
			retVal.color = theStaticMagStyles.color;
			retVal.backgroundColor = theStaticMagStyles.backgroundColor;
		}
		return retVal;
		
	};	// end getMagStyles

		
	// Magnify an element
	// First...a private function that executes the magnification "algorithm".
	// It also calls aegis.magnify.image() to magnify any contained images (non-presentational).
	// TODO:  make this pluggable, somehow.
	//
	var doMagnifyEl = function (/*$+styles*/ prevMagStyles, /*Number?|Object?*/ percent) {
		var localPercent;
		var jMagnifiedEl = (prevMagStyles && prevMagStyles.jRoleEl);
		if (jMagnifiedEl) {
			
			// Set up <localPercent> depending on type and value of <percent>
			//
			if (!percent) {
				localPercent = 100;	// Assume "back to normal"
			}
			else if (typeof percent == 'object') {
				localPercent = percent.fontSize;
			}
			else {
				localPercent = percent;
			}
			
			// Reset back to "normal" magnification.
			//
			if (localPercent == 100) {
				jMagnifiedEl.css (prevMagStyles.staticResetStyles).animate (prevMagStyles.animResetStyles, ANIM_DELAY);
				if (prevMagStyles.oldStyleVal) {
					jMagnifiedEl.attr ("style", prevMagStyles.oldStyleVal);
				}
				else {
					jMagnifiedEl.removeAttr ("style");
				}
				prevMagStyles.isMagnified = false;
			}
			
			// Magnify.
			//
			else {
				if (typeof percent == 'object') {
					var oldColour = theStaticMagStyles.color;
					var oldBgColour = theStaticMagStyles.backgroundColor;
					
					theAnimMagStyles.fontSize = percent.fontSize + "%";
					theStaticMagStyles.color = percent.color;
					theStaticMagStyles.backgroundColor = percent.backgroundColor;
					jMagnifiedEl.css (theStaticMagStyles).animate (theAnimMagStyles, ANIM_DELAY);
					
					theStaticMagStyles.color = oldColour;
					theStaticMagStyles.backgroundColor = oldBgColour;
				}
				else {
					theAnimMagStyles.fontSize = localPercent + "%";
					jMagnifiedEl.css (theStaticMagStyles).animate (theAnimMagStyles, ANIM_DELAY);
				}
				prevMagStyles.isMagnified = true;
			}
			
			// Handle any images.
			//
			var loop2MagnifyImages = function() {
				jQuery (prevMagStyles.imageInfos).each (function (index) {
					aegis.magnify.image (prevMagStyles.imageInfos[index], localPercent);
				});
			}
			if (prevMagStyles.imageInfos) {
				setTimeout (loop2MagnifyImages, ANIM_DELAY);
/*
				jQuery (prevMagStyles.imageInfos).each (function (index) {
					aegis.magnify.image (prevMagStyles.imageInfos[index], percent);
				});
*/			}
		}
	}  // end doMagnifyEl().
	
	// Magnify an element
	// Second...a public function that executes the private magnification "algorithm".
	// but with a time delay.  The purpose is to let the GUI update itself as it normally
	// would before magnifying it.
	// TODO:  does the delay always do what it is supposed to?
	// See also:  doMagnifyEl().
	//
	aegis.atrc.magnifyEl = function (/*$+border*/ prevMagStyles, /*Number?|Object?*/ percent) {

		// Magnify in place, or create a clone to overlay?
		//
//		console.debug (prevMagStyles.jRoleEl);
		if (theOverlayMag.attr ("checked")) {
			
			// If resetting, then there already is a clone, it's magnificed, and its original matches the
			// element that is being "reset".
			//
			var cloneOverlay = prevMagStyles.theCloneOverlay;
			if (cloneOverlay && prevMagStyles.isMagnified) {
				cloneOverlay.magnifyClone (100);
				doMagnifyEl (cloneOverlay.prevMagStyles, 100);
				cloneOverlay.tearDown();
				delete prevMagStyles.theCloneOverlay;
				prevMagStyles.theCloneOverlay = null;
				prevMagStyles.isMagnified = false;
			}
			else {
				cloneOverlay = aegis.magnify.CloneAndMagnify (prevMagStyles, true);
				cloneOverlay.magnifyClone (percent);
				doMagnifyEl (cloneOverlay.prevMagStyles, percent);
				prevMagStyles.isMagnified = cloneOverlay.prevMagStyles = true;
				prevMagStyles.theCloneOverlay = cloneOverlay;
			}
		}
		
		// Magnify in place.
		//
		else {
/*
			var magnifyToolbar = aegis.magnify.Toolbar (prevMagStyles, aegis.atrc.theOrigRoleStyles);
			if (magnifyToolbar) {
				if (magnifyToolbar.isToolbar()) {
					if (!prevMagStyles.isMagnified) {
						magnifyToolbar.magnify (doMagnifyEl, percent);
					}
				}
				else {
					magnifyToolbar.magnify (doMagnifyEl, percent);
				}
			}
			else {
*/
				doMagnifyEl (prevMagStyles, percent);
//			}
		}

	}	// end aegis.atrc.magnifyEl().
	
	// Toggle the magnified state of the element.
	// See also:  aegis.atrc.magnifyEl().
	//
	aegis.atrc.toggleMagEl = function (/*$+border*/ prevMagStyles) {
		if (prevMagStyles) {
			if (prevMagStyles.isMagnified) {
				aegis.atrc.magnifyEl (prevMagStyles, 100);
			}
			else {
//				aegis.atrc.magnifyEl (prevMagStyles, getMagFactor (150, prevMagStyles.jRoleEl.attr ("role")));
				aegis.atrc.magnifyEl (prevMagStyles, getMagStyles (prevMagStyles.jRoleEl.attr ("role")));
			}
		}
	}	// end aegis.atrc.toggleMagEl().
	
	// Event handling
	//
	aegis.atrc.addMagOnClick = function (/*$*/ jRoleItem, /*$+border*/ prevMagStyles) {
		jRoleItem.keypress (function (evt) {
			if (evt.which == SPACE_BAR || evt.which == RETURN) {
				aegis.atrc.toggleMagEl (prevMagStyles);
				evt.preventDefault();
				evt.stopPropagation();
			}
		});
		jRoleItem.focus (function (evt) {
				jQuery (evt.target).attr ("tabindex", "0");
				aegis.atrc.toggleMagEl (prevMagStyles);
		});
		jRoleItem.blur (function (evt) {
				jQuery (evt.target).attr ("tabindex", "-1");
				if (prevMagStyles.isMagnified) {
					aegis.atrc.toggleMagEl (prevMagStyles);
				}
		});
	}
	aegis.atrc.magOnFocus = function (/*Object*/ prevMagStyles) {
		var jEl = prevMagStyles && prevMagStyles.jRoleEl;
		if (jEl) {
			jEl.focus (function (evt) {
				prevMagStyles.hasFocus = true;
				if (theFollowFocus.attr ("checked")) {
//						aegis.atrc.magnifyEl (prevMagStyles, getMagFactor (150, prevMagStyles.jRoleEl.attr ("role")));
					aegis.atrc.magnifyEl (prevMagStyles, getMagStyles (prevMagStyles.jRoleEl.attr ("role")));
				}
			});
		}
	}	// end aegis.atrc.magOnFocus()
	
	aegis.atrc.resetOnBlur = function (/*Object*/ prevMagStyles) {
		var jEl = prevMagStyles && prevMagStyles.jRoleEl;
		if (jEl) {
			jEl.blur (function (evt) {
				prevMagStyles.hasFocus = false;
				if (theFollowFocus.attr ("checked")) {
					aegis.atrc.magnifyEl (prevMagStyles, 100);
				}
			});
		}
	}	// end aegis.atrc.resetOnBlur().
	
	// Magnify the element when the mouse is over it, and
	// reset it when the mouse leaves, but only if
	// it does not have focus.
	//
	var magIfFollowMouse = function (prevMagStyles) {
		if (theFollowMouse.attr ("checked") && !prevMagStyles.hasFocus) {
//			aegis.atrc.magnifyEl (prevMagStyles, getMagFactor (150, prevMagStyles.jRoleEl.attr ("role")));
			aegis.atrc.magnifyEl (prevMagStyles, getMagStyles (prevMagStyles.jRoleEl.attr ("role")));
		}
	};
	
	var resetIfFollowMouse = function (prevMagStyles) {
		if (theFollowMouse.attr ("checked") && !prevMagStyles.hasFocus) {
			aegis.atrc.magnifyEl (prevMagStyles, 100);
		}
	};
	
	aegis.atrc.magOnHover = function (prevMagStyles) {
		var jEl = prevMagStyles && prevMagStyles.jRoleEl;
		if (jEl) {
			jEl.mouseenter (function (evt) {
				magIfFollowMouse (prevMagStyles);
			});
			jEl.click (function (evt) {
				if (evt.altKey) {
					resetIfFollowMouse (prevMagStyles);
					evt.preventDefault();
					evt.stopPropagation();
				}
			});
			jQuery (window).click (function (evt) {
//				console.debug ("key down, [" + evt.target.tagname + "#" + evt.target.id + "]");
				if (evt.altKey && prevMagStyles.isMagnified) {
					aegis.atrc.magnifyEl (prevMagStyles, 100);
					aegis.atrc.clearAllClones();
					evt.preventDefault();
					evt.stopPropagation();
				}
			});
		}
	}	// end aegis.atrc.magOnHover().
	
	// Show/hide list items representing elements with
	// role = presentation.
	//
	aegis.atrc.showHidePresentation = function() {
		if (jQuery ("#showHidePresentation").attr ('checked')) {
			jQuery ("li:contains('presentation')").css ("display", "none");
		}
		else {
			jQuery ("li:contains('presentation')").css ("display", "list-item");
		}
	}
	
	// For "clone" bug -- get rid of extraneous clones.
	//
	aegis.atrc.clearAllClones = function() {
		jQuery ("[id*='Clone']").remove();
		
	};	// end aegis.atrc.clearAllClones().
	
})();


