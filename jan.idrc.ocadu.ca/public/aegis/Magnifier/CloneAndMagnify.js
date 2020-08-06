/**
 * Copyright (c) 2009 University of Toronto.  All rights reserved.
 */

var aegis = aegis || {};
aegis.magnify = aegis.magnify || {};


aegis.magnify.CloneAndMagnify = function (/*$+currentStyles*/ inElAndStyles, /*boolean?*/ deepCloneFlag) {
	var that = {};
	that.jOrigStyles = null;
	that.jClone = null;
	
	// Utility for copying fields from one object to another (recursive).
	//
	var copyObjectFields = function (/*Object*/ from, /*Object*/ to) {
	
		if (from && typeof (from) == "object") {
			if (!to) to = {};
			
			for (var aField in from) {
				if (typeof (aField) == "object") {
					to[aField] = copyObjectFields (aField);
				}
				else {
					to[aField] = from[aField];
				}
			}
		}
		return to;
		
	};	// end copyObjectFields().
	
	// (Private) Utility for cloning the "element+currentStyles" structure.
	//
	var cloneCurrentStyles = function (/*$+currentStyles*/ inStructToClone) {
		var clone = {};
		clone.isMagnified = inStructToClone.isMagnified;
		clone.hasFocus = inStructToClone.hasFocus;
		clone.staticResetStyles = copyObjectFields (inStructToClone.staticResetStyles);
		clone.animResetStyles = copyObjectFields (inStructToClone.animResetStyles);
		clone.oldStyleVal = inStructToClone.oldStyleVal;
		return clone;
		
	};	// end cloneCurrentStyles().

	// Create a clone
	//
	that.setup = function (/*Element*/ inEl, /*boolean?*/ deepClone) {
		var jOrig = (inEl ? jQuery (inEl) : null);
		var aClone = null;
		if (jOrig) {
			
			// Create the clone.
			//
			aClone = jOrig.clone (deepClone);
			var origId = jOrig.attr ("id");
			if (origId) {
				aClone.attr ("id", origId + "Clone");
			}
			aClone.theOrig = jOrig;
			aClone.css ({position: "absolute", display: "none"});
			aClone.insertBefore (jOrig);			
			
			// Store everything in "this".
			//
			that.jOrigStyles = inElCurrentStyles;
			that.jClone = aClone;
//			that.prevMagStyles = aegis.atrc.elementCurrentStyles (aClone);	
			that.prevMagStyles = aegis.atrc.elementCurrentStyles (jOrig);
			that.prevMagStyles.jRoleEl = aClone;
			aClone.css ({position: "absolute", display: "none"});
			aClone.insertBefore (jOrig);			
		}
		return aClone;
	
	};	// end that.setup().
	
	// Create a clone
	//
	that.setup2 = function (/*$+Styles*/ inElCurrentStyles, /*boolean?*/ deepClone) {
		var jOrig = (inElCurrentStyles ? inElCurrentStyles.jRoleEl : null);
		var aClone = null;
		if (jOrig) {
			
			// Create the clone.
			//
			aClone = jOrig.clone (deepClone);
			var origId = jOrig.attr ("id");
			if (origId) {
				aClone.attr ("id", origId + "Clone");
			}
			var clonedStyles = cloneCurrentStyles (inElCurrentStyles);
			clonedStyles.jRoleEl = aClone;
			aegis.magnify.initImagesInfo (clonedStyles, inElCurrentStyles.imageInfos);
			
			aClone.theOrig = jOrig;
			aClone.css ({position: "absolute", display: "none"});
			aClone.insertBefore (jOrig);			
			
			// Store everything in "this".
			//
			that.jOrigStyles = inElCurrentStyles;
			that.jClone = aClone;
			that.prevMagStyles = clonedStyles;
		}
		return aClone;
	
	};	// end that.setup2().
	
	// "Constructor" calls setup() as convenience.
	//
//	that.setup (inElement, deepCloneFlag);
	that.setup2 (inElAndStyles, deepCloneFlag);
	
	// Set up position information for placing the clone over the original.
	// TODO:  pass in magnification function?
	//
	that.magnifyClone = function  (/*Number?*/ percent) {
		if (!percent) percent = 100;
		var orig = that.jOrigStyles.jRoleEl;
		var aPoint = orig.offset();
		var staticStyles = {
			left: aPoint.left,
			top: aPoint.top,
			width: "auto", 	//orig.width(),
			height: "auto", //orig.height().
			display: "block",
		};
		
		// <aPoint> is set to centre...
		//
		aPoint.left = aPoint.left + (orig.width() / 2);
		aPoint.top = aPoint.top + (orig.height() / 2);
		var magWidth = orig.width() * (percent / 100);
		var magHeight = orig.height() * (percent / 100);
		var positionAnimStyles = {
			left: aPoint.left - (magWidth / 2),
			top: aPoint.top - (magHeight / 2),
		};
		if (positionAnimStyles.left < 0) positionAnimStyles.left = 0;
		if (positionAnimStyles.top < 0) positionAnimStyles = 0;
		that.jClone.css (staticStyles);
		that.jClone.css (positionAnimStyles);
		var origImgInfos = that.jOrigStyles.imageInfos;
		jQuery.each (origImgInfos, function (idx) {
			console.debug (origImgInfos[idx].img);
			jQuery (origImgInfos[idx].img).css ("visibility", "hidden");
		});
			
	}	// end magnifyClone().
	
	// "Flush" this clone.  In essence, get rid of the magnified version of the
	// original element.
	// NOTE: should delete this clone after calling this.
	//
	that.tearDown = function () {
		var origImgInfos = that.jOrigStyles.imageInfos;
		jQuery.each (origImgInfos, function (idx) {
			jQuery (origImgInfos[idx].img).css ("visibility", "");
		});
		that.jClone.remove();
		that.jClone = null;
		that.jOrigStyles = null;
		delete that.prevMagStyles;
	}
	
	return that;

};	// end aegis.magnify.CloneAndMagnify().

// (Static) Utility for cloning the "element+currentStyles" structure.
//
aegis.magnify.clonePrevStyles = function (/*$+prevStyles*/ inPrevStylesToClone) {
	var clone = {};
	clone.isMagnified = inPrevStylesToClone.isMagnified;
	clone.hasFocus = inPrevStylesToClone.hasFocus;
	clone.staticResetStyles = aegis.magnify.copyObjectFields (inPrevStylesToClone.staticResetStyles);
	clone.animResetStyles = aegis.magnify.copyObjectFields (inPrevStylesToClone.animResetStyles);
	clone.oldStyleVal = inPrevStylesToClone.oldStyleVal;
	return clone;
	
};	// end aegis.magnify.clonePrevStyles().

// (Static) Utility for copying fields from one object to another (recursive).
//
aegis.magnify.copyObjectFields = function (/*Object*/ from, /*Object*/ to) {

	if (from && typeof (from) == "object") {
		if (!to) to = {};
		
		for (var aField in from) {
			if (typeof (aField) == "object") {
				to[aField] = aegis.magnify.copyObjectFields (aField);
			}
			else {
				to[aField] = from[aField];
			}
		}
	}
	return to;
	
};	// end aegis.magnify.copyObjectFields().
	



