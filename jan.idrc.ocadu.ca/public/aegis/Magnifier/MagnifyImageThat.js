/**
 * Copyright (c) 2009 University of Toronto.  All rights reserved.
 */

var aegis = aegis || {};

// "Suffix" for CSS sizes.
//
aegis.magnify = aegis.magnify || {};
aegis.magnify.theSizeSuffix = /px|%|pt|em|ex/;

// Magnifier object.
//
aegis.Magnify = function (/*something...*/) {
	var that = {};
	
	// Magnify the given image Element.
	// @param	imgInfo		A structure containing (1) the image Element, (2) its
	//						original width and height.
	// @param	percent		The magnifcation factor expressed as a percentage.  If
	//						absent, 100% is assumed.
	//
	that.magnifyImg = function (/*image properties*/ imgInfo, /*Number?*/ percent) {
		
		var jImg = ((imgInfo && imgInfo.img) ? jQuery (imgInfo.img) : null);
		if (jImg) {
			if (!percent) percent = 100;
			var newWidth = String (imgInfo.origWidth * percent / 100) + imgInfo.widthUnits ;
			var newHeight = String (imgInfo.origHeight * percent / 100 + imgInfo.heightUnits);
			jImg.animate ({width: newWidth, height: newHeight}, 150);
	//		jImg.css ("height", newHeight + imgInfo.heightUnits);
		}
	};	// end magnifyImg()
	
	// Create object that contains the given img element, and that images
	// current width and height, and their units.
	//
	that.getImgSize = function (/*Element*/ imgEl) {
		
		var info = null;
		if (imgEl) {
			info = {};
			info.img = imgEl;
			var dim = jQuery (imgEl).css ("width");
			info.origWidth = dim.replace (aegis.magnify.theSizeSuffix, "");
			info.widthUnits = dim.replace (/[0-9]*/, "");
			
			var dim = jQuery (imgEl).css ("height");
			info.origHeight = dim.replace (aegis.magnify.theSizeSuffix, "");
			info.heightUnits = dim.replace (/[0-9]*/, "");
		}
		return info;
		
	};	// end getImgSize()

	// Initialize all the images at a given root Element.
	// The second arg is 
	//
	that.initImagesInfo = function (/*$+styles*/ rootElAndStyles) {
		var jRoot = (rootElAndStyles && rootElAndStyles.jRoleEl);
		if (jRoot) {
			delete rootElAndStyles.imageInfos;
			rootElAndStyles.imageInfos = [];
			var jImgs = jQuery ("img", jRoot);
			jImgs.each (function (index) {
				rootElAndStyles.imageInfos.push (aegis.magnify.getImgSize (jImgs[index]));
			});
		}
	};	// end initImagesInfo().
	
	// Clone and image and put in in a new <div>
	//
	that.imgMagnifierGlass = function (/*Element*/ imgEl) {
		varjImgEl = ( imgEl ? jQuery (jImgEl) : null);
		if (jImgEl) {
			var stageDiv = jQuery ("<div class='stageDiv'>");
			stageDiv.css ({
				width: jImgEl.css ("width"),
				height: jImgEl.css ("height"),
				overflow: "hidden",
				position: "absolute",
				backgroundImage: "transparent"
			});
			stageDiv.insertBefore (jImgEl);
			
			var winDiv = jQuery ("<div class='winDiv'>");
			winDiv.css ({
				width: "0px",
				height: "0px,"
				overflow: "hidden",
				position: "absolute",
				display: "none"			
			});
			var innerWinDiv = jQuery ("<div class='innerWinDiv'>");
			innerWinDiv.css ({
				overflow: "hidden",
				position: "absolute",
				margin:	"4px 0 0 4px"
			});
		}
	};	// end imgMagnifierGlass().
		
	return that;

};	// end aegis.Magnify().


// Magnify the given image Element.
// @param	imgInfo		A structure containing (1) the image Element, (2) its
//						original width and height.
// @param	percent		The magnifcation factor expressed as a percentage.  If
//						absent, 100% is assumed.
//
aegis.magnify.image = function (/*image properties*/ imgInfo, /*Number?*/ percent) {
	
	var jImg = ((imgInfo && imgInfo.img) ? jQuery (imgInfo.img) : null);
	if (jImg) {
		if (!percent) percent = 100;
		var newWidth = String (imgInfo.origWidth * percent / 100) + imgInfo.widthUnits ;
		var newHeight = String (imgInfo.origHeight * percent / 100 + imgInfo.heightUnits);
		jImg.animate ({width: newWidth, height: newHeight}, 150);
//		jImg.css ("height", newHeight + imgInfo.heightUnits);
	}
}	// end aegis.magnify.image()

// Create object that contains the given img element, and that images
// current width and height, and their units.
//
aegis.magnify.getImgSize = function (/*Element*/ imgEl) {
	
	var info = null;
	if (imgEl) {
		info = {};
		info.img = imgEl;
		var dim = jQuery (imgEl).css ("width");
		info.origWidth = dim.replace (aegis.magnify.theSizeSuffix, "");
		info.widthUnits = dim.replace (/[0-9]*/, "");
		
		var dim = jQuery (imgEl).css ("height");
		info.origHeight = dim.replace (aegis.magnify.theSizeSuffix, "");
		info.heightUnits = dim.replace (/[0-9]*/, "");
	}
	return info;
	
}	// end aegis.magnify.image()

// Initialize all the images at a given root Element.
// The second arg is 
//
aegis.magnify.initImagesInfo = function (/*$+styles*/ rootElAndStyles) {
	var jRoot = (rootElAndStyles && rootElAndStyles.jRoleEl);
	if (jRoot) {
		delete rootElAndStyles.imageInfos;
		rootElAndStyles.imageInfos = [];
		var jImgs = jQuery ("img", jRoot);
		jImgs.each (function (index) {
			rootElAndStyles.imageInfos.push (aegis.magnify.getImgSize (jImgs[index]));
		});
	}
}	// end aegis.magnify.initImagesInfo().

