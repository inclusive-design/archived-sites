/**
 * Copyright (c) 2009 University of Toronto.  All rights reserved.
 * @author Joseph Scheuhammer.
 */

function EditorDemo() {
	
	var that = {};
	
	// Some keycodes.
	//
	var UP_ARROW = 38;
	var DOWN_ARROW = 40;
	var LEFT_ARROW = 37;
	var RIGHT_ARROW = 39;
	var SPACE_BAR = 32;
	var ENTER = 13;
	var RETURN = 13;
	
	// For DHTML check boxes when "clicked", swap the check vs. unchecked
	// img.
	//
	var handleClickGraphic = function (evt) {
		var checkbox = jQuery (evt.target);
		var checkGraphic = jQuery ("img", checkbox);
		if ((evt.type == "click") ||
			((evt.type == "keypress") && (evt.charCode == 32 /*SPACE*/))) {
			var isChecked = checkbox.attr ("aria-checked");
			if (isChecked) {
				checkbox.removeAttr ("aria-checked");
				checkGraphic.attr ("src", "unchecked.gif");
			}
			else {
				checkbox.attr ("aria-checked", "true");
				checkGraphic.attr ("src", "checked.gif");
			}
			evt.preventDefault();
			evt.stopPropagation();
		}
		
	};	// end handleClickGraphic().
	
	
	//.Attach above handler to each DHTML checkbox.
	//
	that.checkBoxGraphicHandler = function() {
		jQuery ("span[role='checkbox']").each (function (idx, aCheckBox) {
			jQuery (aCheckBox).click (handleClickGraphic);
			jQuery (aCheckBox).keypress (handleClickGraphic);
		});
	
	};	// end that.checkBoxClickHandler()/.
	
	// Handler for "view source" checkbox.
	// (Copied straight from the original).
	//
	var viewSource = function (/*checkbox*/ jCheckbox) {
	  var html;
	  if (jCheckbox.attr ("aria-checked") == "true") {
		html = document.createTextNode(document.getElementById('edit').contentWindow.document.body.innerHTML);
		document.getElementById('edit').contentWindow.document.body.innerHTML = "";
		html = document.getElementById('edit').contentWindow.document.importNode(html,false);
		document.getElementById('edit').contentWindow.document.body.appendChild(html);
		document.getElementById("toolbar1").style.visibility="hidden";
		document.getElementById("toolbar2").style.visibility="hidden";  
	  } else {
		html = document.getElementById('edit').contentWindow.document.body.ownerDocument.createRange();
		html.selectNodeContents(document.getElementById('edit').contentWindow.document.body);
		document.getElementById('edit').contentWindow.document.body.innerHTML = html.toString();
		document.getElementById("toolbar1").style.visibility="visible";
		document.getElementById("toolbar2").style.visibility="visible";  
	  }
	};
	
	that.handleViewSource = function() {
		var jCheckbox = jQuery ("#viewsource");
		
		jCheckbox.click (function() {
			viewSource (jCheckbox);
		});
		jCheckbox.keypress (function() {
			viewSource (jCheckbox);
		});
		
	};	// end handleViewSource().
	
	// Handle "use CSS" checkbox.
	//
	var useCss = function (/*checkbox*/ jCheckbox) {
		var checked = jCheckbox.attr ("aria-checked") == "true";
		jQuery ("#edit")[0].contentWindow.document.execCommand ("useCSS", false, !(checked));
	
	};	// end useCssI().
	
	that.handleUseCss = function () {
		var jCheckbox = jQuery ("#usecss");
		
		jCheckbox.click (function() {
			useCss (jCheckbox);
		});
		jCheckbox.keypress (function() {
			useCss (jCheckbox);
		});
	
	};	// end that.handleUseCss()
	
	// Handle "readonly" checkbox.
	//
	var readonly = function (/*checkbox*/ jCheckbox) {
		var checked = jCheckbox.attr ("aria-checked") == "true";
		jQuery ("#edit")[0].contentWindow.document.execCommand ("readonly", false, !(checked));
	
	};	// end readonly().
	
	that.handleReadOnly = function() {
		var jCheckbox = jQuery ("#readonly");
		
		jCheckbox.click (function() {
			useCss (jCheckbox);
		});
		jCheckbox.keypress (function() {
			useCss (jCheckbox);
		});
	
	};	// end that.handleReadOnly()
	
// ===================
// Toolbar navigation
// ===================
	
	// Special case:  the "comboboxes".
	// If LEFT or RIGHT key stroke, return index of next tool bar "button"
	// to put focus on.  Otherwise, return -1.
	//
	var handleComboboxNav = function (evt, toolBarButtons) {
	
//		console.debug ("......handleComboboxNav (" + evt.target + "," + toolBarButtons);
		
		var index = -1;
		var leftRight = evt.which == LEFT_ARROW || evt.which == RIGHT_ARROW;
//		console.debug ("......leftRight is " + leftRight);
		
		// If UP and DOWN, allow "native" handling.  Just handle moving
		// LEFT and RIGHT within the <toolBarButtons>.
		//
		if (leftRight) {
		
			// Get the combobox itself.
			//
			var jCombo = jQuery (evt.target);
			if (jCombo.attr ("role") == "menuitem") {
//				console.debug ("......handleComboboxNav() target isa menuitem");
				jCombo = jCombo.parent();
			}
			if (jCombo.attr ("role") != "combobox") {
//				console.debug ("......handleComboboxNav() target is nota combobox, bailing");
//				console.debug ("");
				return;
			}
			
			index = jQuery.inArray (jCombo[0], toolBarButtons);
			if (evt.which == RIGHT_ARROW) {
				index++;
				if (index >= toolBarButtons.size())
					index = toolBarButtons.size() - 1;
			}
			else if (evt.which == LEFT_ARROW) {
				index--;
				if (index < 0)
					index = 0;
			}
//			console.debug ("......handleComboboxNav() target isa combobox, index is " + index);
		}
		return index;
		
	};	// end handleCombobox().
	
	// Toolbar button navigation/activation.
	//
	that.keyNavActivateToolbar= function (/*Element*/ toolBar) {

		if (toolBar) {
			var toolBarButtons = jQuery ("[tabindex='-1']", toolBar);
		
			// Toolbar button navigation.
			//
			var arrowKeyNav = function (evt) {
			
//				console.debug ("evt [" + evt.target + "," + evt.which + "]");

				// Only handle cursor keys.
				//
				var prev = (evt.which == UP_ARROW || evt.which == LEFT_ARROW);
				var next = (evt.which == DOWN_ARROW || evt.which == RIGHT_ARROW);
				if (prev || next) {
					
//					console.debug ("...prev or next is true");
					var index;
				
					// If the target is a combobox, or one of its children,
					// skip it.
					//
					var targetRole = jQuery (evt.target).attr ("role");
					if (targetRole == "combobox" || targetRole == "menuitem") {
						index = handleComboboxNav (evt, toolBarButtons, next);
					}
				
					// If the even target is the toolbar, then assume focus is on
					// the toolbar itself, and we need to move it to the first
					// toolbar button.
					//
					else if (targetRole == "toolbar") {
//						console.debug ("...evt.target is the toolbar");
						index = 0;
					}
					
					// Otherwise, assume the target is one of the buttons
					// and starte moving among them.
					//
					else {
						index = jQuery.inArray (evt.target, toolBarButtons);
						if (prev) {
//							console.debug ("...UP or LEFT arrow");
							index--;
							if (index < 0) {
								index = 0;
							}
						}
						else if (next) {
//							console.debug ("...DOWN or RIGHT arrow");
							index++;
							if (index >= toolBarButtons.size()) {
								index = toolBarButtons.size() - 1;
							}
						}
					}
//					console.debug ("...index is " + index);
					if (index >= 0) {
//						console.debug ("...attempting to focus on " + index + "'th button, namely, " + toolBarButtons[index] + "#" + toolBarButtons[index].id);
						var toolBarItem = toolBarButtons[index];
						setTimeout (function () { toolBarItem.focus(); }, 0);
						setTimeout (function () { toolBarItem.focus(); }, 0);
						evt.preventDefault();
						evt.stopPropagation();
					}
				}
//				console.debug ("");
				
			};	// end arrowKeyNav().
			
			// Handle activation by space bar.
			//
			var spaceBarActivate = function (evt) {
				
				// Handle SPACE_BAR.
				//
				var isButton = jQuery (evt.target).attr ("role") == "button";
				if (evt.which == SPACE_BAR) {
//					console.debug ("SPACE_BAR on [" + evt.target + "#" + evt.target.id + "]");
					var jTarget = jQuery (evt.target);
					var aRole = jTarget.attr ("role");
					
					// If a button, click() it.
					//
					if (aRole == "button") {
						jQuery (evt.target).click();
						evt.preventDefault();
						evt.stopPropagation();
					}
					
					// If a select, use alt+down arrow.
					//
					else if (aRole == "combobox") {
						var altArrowEvent = {};
						for (var aProp in evt) {
							altArrowEvent[aProp] = evt[aProp];
						}
						altArrowEvent.altKey = true;
						altArrowEvent.charCode = 0;
						altArrowEvent.keyCode = DOWN_ARROW;
						altArrowEvent.which = DOWN_ARROW;
						evt.preventDefault();
						evt.stopPropagation();
						jTarget.trigger (altArrowEvent);
					}
				}
			};	// end spaceBarActivate().
			
			jQuery (toolBar).keydown (arrowKeyNav);
			jQuery.each (toolBarButtons, function (idx) {
				jQuery (toolBarButtons[idx]).keydown (spaceBarActivate);
			});
		}
		
	};	// end that.keyNavToolbar().	
	
	return that;

}	// end EditorDemo().