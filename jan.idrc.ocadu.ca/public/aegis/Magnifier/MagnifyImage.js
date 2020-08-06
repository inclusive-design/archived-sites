/**
 * Copyright (c) 2009 University of Toronto.  All rights reserved.
 * @author Joseph Scheuhammer.
 */

var aegis = aegis || {};

// "Suffix" for CSS sizes.
//
aegis.magnify = aegis.magnify || {};
aegis.magnify.theSizeSuffix = /px|%|pt|em|ex/;

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
		jImg.css ({width: newWidth, height: newHeight}, 150);
//		jImg.css ("height", newHeight + imgInfo.heightUnits);
	}
}	// end aegis.magnify.image()

// Create object that contains the given img element, and that images
// current width and height, and their units.
//
aegis.magnify.getImgSize = function (/*Element*/ imgEl, /*imaginfo?*/ origImgInfo) {
	
	var info = null;
	if (imgEl) {
		info = {};
		info.img = imgEl;
		var dim;
		if (origImgInfo && origImgInfo.origWidth) {
			dim = origImgInfo.origWidth;
		}
		else {
			dim = jQuery (imgEl).width();
		}
		info.origWidth = dim;
		info.widthUnits = "px";
		
		if (origImgInfo && origImgInfo.origHeight) {
			dim = origImgInfo.origHeight;
		}
		else {
			dim = jQuery (imgEl).height();
		}
		info.origHeight = dim;
		info.heightUnits = "px";
	}
	return info;
	
}	// end aegis.magnify.image()

// Initialize all the images at a given root Element.
// The second arg is optional, and contains the desired sizes (width, height)
// of the images
//
aegis.magnify.initImagesInfo = function (/*$+styles*/ rootElAndStyles, /*imageInfos[]?*/ inOrigInfos) {
	var jRoot = (rootElAndStyles && rootElAndStyles.jRoleEl);
	if (jRoot) {
		delete rootElAndStyles.imageInfos;
		rootElAndStyles.imageInfos = [];
		var jImgs = jQuery ("img", jRoot);
		jImgs.each (function (index) {
			var anImg = jImgs[index];
			var origImgInfo = inOrigInfos && inOrigInfos[index];
			if (!aegis.magnify.isImgPresentational (anImg)) {
				rootElAndStyles.imageInfos.push (aegis.magnify.getImgSize (anImg, origImgInfo));
			}
		});
	}
}	// end aegis.magnify.initImagesInfo().

// Utility to determine if an <img> is presentational.
// return "true" if:
// - is an <img> element, AND
// -- has @role="presentation", OR
// -- has @alt=""
//
aegis.magnify.isImgPresentational = function (/*Element*/ imgEl) {
	var result = false;
	if (imgEl && (imgEl.tagName == "img" || imgEl.tagName == "IMG")) {
		var role = jQuery (imgEl).attr ("role");
		var alt = jQuery (imgEl).attr ("alt");
		if ((role && role == "presentation") || (alt && alt == "")) {
			result = true;
		}
	}
	return result;
	
}	// end aegis.magnify.isImgPresentational().

