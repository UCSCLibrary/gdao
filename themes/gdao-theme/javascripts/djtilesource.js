(function( $ ){
    
/**
 * An OpenSeadragon interface for the freelib-djatoka JP2 server.  It is based
 * on Doug Reside's DjatokaSeadragon, but modified to work with the newer fork
 * of OpenSeadragon that's being developed by Chris Thatcher at LoC.
 * 
 * https://github.com/dougreside/DjatokaSeadragon
 * https://github.com/thatcher/openseadragon
 * 
 * @class
 * @extends OpenSeadragon.TileSource
 * @param {string} djatoka
 * @param {string} imageID
 */ 
$.DjTileSource = function(djatoka, imageID) {
    var iiifNS = 'http://library.stanford.edu/iiif/image-api/ns/';
    var xml, wNode, hNode, width, height;
    var tileOverlap = 0;
    var tileSize = 256;
    var minLevel, maxLevel; // handled in TileSource
    var http;

    this.baseURL = djatoka + "zoom/";
    this.imageID = imageID;

    if (typeof XDomainRequest != 'undefined' && !window.atob) { /** IE < 10 **/
      http = new XDomainRequest();
      http.open('GET', djatoka + "image/" + imageID + "/info.xml");
    }
    else { /** We're using a real browser **/
      http = new XMLHttpRequest();
      http.open('GET', djatoka + "image/" + imageID + "/info.xml", false);
    }

    http.send();
    text = http.responseText;

    /** XDomainRequest can't be synchronous; the below is a temporary hack **/
    if (text == '') {
      alert('Older versions of Internet Explorer are only partially supported.\nPlease consider upgrading your browser.');
      http.open('GET', djatoka + "image/" + imageID + "/info.xml", false);
      http.send();
      text = http.responseText;
    }

    parser=new DOMParser();
    xml=parser.parseFromString(text,"text/xml");
    wItems = xml.getElementsByTagName('width')[0];
    wNode = wItems.childNodes[0];
    hItems = xml.getElementsByTagName('height')[0];
    hNode = hItems.childNodes[0];
    width = parseInt(wNode.nodeValue);
    height = parseInt(hNode.nodeValue);
    
    $.TileSource.call(this, width, height, tileSize, tileOverlap, minLevel, maxLevel);
};

$.extend($.DjTileSource.prototype, $.TileSource.prototype, {
	
    /**
     * @function
     * @name OpenSeadragon.DjTileSource.prototype.getTileUrl
     * @param {Number} level
     * @param {Number} x
     * @param {Number} y
     */
    getTileUrl: function(level, x, y) {
    	var newScale = Math.pow(2, this.maxLevel) / Math.pow(2, level);
    	var tileSize = parseInt(newScale * 256);
    	var tileSizeX, tileSizeY, region;
    	var scale = Math.pow(2, level);

    	if (level > 8) {
    		var myX = parseInt(x);
    		var myY = parseInt(y);

    		if (myX == 0) {
    			tileSizeX = tileSize - 1;
    		}
    		else {
    			tileSizeX = tileSize;
    		}

    		if ((startX + tileSizeX) > this.dimensions.x) {
    			tileSizeX = this.dimensions.x - startX;
    		}

    		if (myY == 0) {
    			tileSizeY = tileSize - 1;
    		}
    		else {
    			tileSizeY = tileSize;
    		}

    		if ((startY + tileSizeY) > this.dimensions.y) {
    			tileSizeY = this.dimensions.y - startY;
    		}
     	
    		var startX = parseInt(myX * tileSize);
    		var startY = parseInt(myY * tileSize);    	
    	
    		region = startY + "," + startX + "," + tileSizeY + "," + tileSizeX;
    	}
    	else {
    		region = "all";
    	}

    	return this.baseURL + this.imageID + "/" + region + "/" + scale;
    }
});

}(OpenSeadragon));
