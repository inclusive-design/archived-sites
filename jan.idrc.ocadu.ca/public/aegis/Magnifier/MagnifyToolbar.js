/**
 * Copyright (c) 2009 University of Toronto.  All rights reserved.
 */

var aegis = aegis || {};
aegis.magnify = aegis.magnify || {};

/**
 * An object to handle (1) magnification of a tool bar and, (2) magnification of a toolbar
 * button within.  The idea is to keep the entire toolbar "magnified" when one of its
 * tools is magnified, giving a slightly large magnification factor to the tool with
 * focus.
 * @param	inElAndStyles		The "prevStyles" object for the element to magnify.
 * @param	inOrigStylesArray	An array of prevStyles for all of the elements that could
 *								be magnified, including the styles of the toolbar that
 *								may be the parent of <inElAndStyles>.
 */
aegis.magnify.Toolbar = function (/*$+currentStyles*/ inElAndStyles, /*$+Styles Array*/ inOrigStylesArray) {
	var magnified = false;
	var givenElAndStyles = inElAndStyles;
	var origToolBarStyles = null;
	var jGivenEl = inElAndStyles && inElAndStyles.jRoleEl;
	
	// Get the parent tool bar.
	//
	var jToolbar = null;
	if (jGivenEl) {
		if (jGivenEl.attr ("role") == "toolbar") {
			jToolbar = jGivenEl;
		}
		else {
			var jAccParent = aegis.atrc.findAccParent (jGivenEl);
			if (jAccParent && jAccParent.attr ("role") == "toolbar") {
				jToolbar = jAccParent;
			}
		}
	}
	
	// If no parent, return "null".
	//
	if (jToolbar == null) {
		return null;
	}
	
	// Got a toolbar or tool within a toolbar, proceed...
	//
	self = {};
	
	// Get the original styles of the toolbar.
	//
	for (var i=0; i < inOrigStylesArray.length; i++) {
		var anOrigStyles = inOrigStylesArray[i];
		if (anOrigStyles.jRoleEl === jToolbar) {
			origToolBarStyles = anOrigStyles;
			console.debug ("got origToolbarStyles");
			break;
		}
	}			
	
	self.isMagnified  = function() {
		return (magnified);
	};
	
	self.isToolbar = function() {
		return (jGivenEl === jToolbar);
	};	
	
	// Magnify the toolbar, "or" the tool and its toolbar parent.
	// @param	basicMagFunction	The function that takes a "prevStyles" object
	//								and magnifies the object designated.
	//
	self.magnify = function (/*Function*/ basicMagFunction, /*Number*/ percent) {
	
		// Case:  the thing to magnify is just the toolbar itself.
		//
		if (jGivenEl === jToolbar) {
			console.debug ("magnify tool bar [" + percent +"], isMagnified = " + givenElAndStyles.isMagnified);
			if (percent == 100) {
				basicMagFunction (origToolBarStyles, percent);
			}
			else {
				basicMagFunction (givenElAndStyles, percent);
			}
		}
		
		// Case:  a tool within the toolbar.
		//
		else {
			console.debug ("magnify tool [" + percent +"]");
			basicMagFunction (givenElAndStyles, (percent == 100 ? percent : percent+15));
//			basicMagFunction (origToolBarStyles, percent);
		}
		magnified = (percent == 100 ? false : true);
	
	};	// end self.magnify().
	
	// Get the prevStyles of the current element.
	//
	self.getToolbarPrevStyles = function() {
		return (givenElAndStyles);
	};
	
	// Get the prevStyles of the toolbar parent.
	//
	self.getOrigToolbarStyles = function() {
		return (origToolBarStyles());
	};
	
	return self;

};	// end aegis.magnify.MagnifyToolbar().
