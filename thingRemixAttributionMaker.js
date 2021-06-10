// ==UserScript==
// @name         Thing Remix Attribution Maker
// @namespace    http://poikilos.org/
// @version      2.0.2
// @description  Format the license information from a thing page
// @author       Poikilos (Jake Gustafson)
// @include      https://www.thingiverse.com/thing:*
// @grant        none
// @run-at          document-end
// ==/UserScript==

(function() {
  // formerly @match        https://www.thingiverse.com/thing:*
  var checkTimer = null;
  var madeDivClassName = "ThingPage__madeBy";
  var licenseClauseImgPrefix = "License__img";
  var licenseAnchorPrefix = "License__link"; // INFO: it could be author OR license link
  var titlePrefix = "ThingPage__modelName";
  var headingCreatedPrefix = "ThingPage__createdBy";
  var doneDivPrefixes = [titlePrefix, headingCreatedPrefix];
  var clausesContainerPrefix = "License__ccLicense";
  var doneDivPrefixesMain = [clausesContainerPrefix];
  var verbose = false;
  function getElementsWhereClassStartsWith(str) {
    if (verbose) {
      console.log("");
      console.log("getElementsWhereClassStartsWith(\""+str+"\")...");
    }
    var els = [];
    var all = document.getElementsByTagName("*");
    for (var i=0, max=all.length; i < max; i++) {
      var el = all[i];
      if (el.className.startsWith(str)) {
        els.push(el);
      }
    }
    if (verbose) {
      console.log("- FOUND " + els.length);
    }
    return els;
  }
  function getDivsWhereClassStartsWith(str) {
    if (verbose) {
      console.log("");
      console.log("FIND getDivsWhereClassStartsWith(\"" + str + "\")...");
    }
    var els = [];
    var all = document.getElementsByTagName("div");
    for (var i=0, max=all.length; i < max; i++) {
      var el = all[i];
      if (el.className.startsWith(str)) {
        els.push(el);
        // console.log("- FOUND (" + els.length + ")");
      }
      else {
        // console.log("- " + el.className + " does not start with it.");
      }
    }
    if (verbose) {
      // console.log("Div count: " + all.length);
      console.log("- FOUND " + els.length);
    }
    return els;
  }
  function getWhereClassStartsWithIn(el, str) {
    if (el === undefined) {
	  console.log("[getWhereClassStartsWithIn] Error: el is undefined.");
      return [];
    }
    if (verbose) {
      console.log("");
      console.log("DETECT getWhereClassStartsWithIn(el, \""+str+"\")...");
      // console.log("  el: " + JSON.stringify(el)); // DON'T do (could be circular)
      console.log("  el.className: "+el.className);
      console.log("  el.childNodes.length:"+el.childNodes.length+"...");
    }
    var els = [];
    var all = el.childNodes;
    for (var i=0, max=all.length; i < max; i++) {
      var thisEl = all[i];
      if (thisEl.className.startsWith(str)) {
        els.push(thisEl);
        // console.log("- FOUND");
      }
      else {
        // console.log("- "+el.className+" does not start with it.");
      }
    }
    if (verbose) {
      console.log("- FOUND " + els.length);
      // console.log("- done (div count: " + all.length + ")");
    }
    return els;
  }
  function hasAllDivPrefixes(prefixes) {
    var found = 0;
    for (var i=0, max=prefixes.length; i < max; i++) {
      if (getDivsWhereClassStartsWith(prefixes[i]).length > 0) {
        found++;
      }
    }
    return found >= prefixes.length;
  }
  function elementHasAllPrefixes(el, prefixes) {
    var found = 0;
    for (var i=0, max=prefixes.length; i < max; i++) {
      if (getWhereClassStartsWithIn(el, prefixes[i]).length > 0) {
        found++;
      }
    }
    return found >= prefixes.length;
  }
  function getImgsWhereClassStartsWith(str) {
    var els = [];
    var all = document.images; // document.getElementsByTagName("img");
    for (var i=0, max=all.length; i < max; i++) {
      var el = all[i];
      if (el.className.startsWith(str)) {
        els.push(el);
      }
    }
    return els;
  }
  function getAnchorsWhereClassStartsWith(str) {
    var els = [];
    var all = document.getElementsByTagName("a");
    for (var i=0, max=all.length; i < max; i++) {
      var el = all[i];
      if (el.className.startsWith(str)) {
        els.push(el);
      }
    }
    return els;
  }


  function addButton() {
    'use strict';
    // This should run when ThingPage_galleryHeader* gets filled in, but only once to prevent an infinite loop.
    var info = {};
    // var pageInfoEs = document.getElementsByClassName("item-page-info");
    // NOTE: now ThingiVerse is a React app, so you must use inspect to see the HTML.
    // "ThingPage__madeBy*" includes parts such as:
    // - `ThingPage__modelName*`
    // - `<div class="ThingPage__createdBy*">by <a ...>UserName</a>MON D, YYYY`

    var pageInfoEs = getDivsWhereClassStartsWith(madeDivClassName);
    if (pageInfoEs.length >= 1) {
      var pageInfoE = pageInfoEs[0];
      // There should only be one.
      // pageInfoE.innerHTML += "<button onclick=\"getRemixLicense()\">Copy License for Remix</button>";
      //or:
      // See https://www.w3schools.com/jsref/met_document_createelement.asp
      var btn = document.createElement("BUTTON"); // Create a <button> element
      btn.setAttribute("class", "button button-secondary");
      btn.setAttribute("style", "background-color: rgb(50%, 50%, 50%)");
      var btnText = "Copy License for Remix";
      btn.innerHTML = btnText; // Insert text

      btn.addEventListener("click", function(){
        btn.innerHTML = btnText;
        // var licenseTextE = document.getElementsByClassName("license-text");
        // var licenseTextE = getDivsWhereClassStartsWith(clausesContainerPrefix);
        var outputStr = "";
        // var pageInfoEs = document.getElementsByClassName("item-page-info");
        // var pageInfoEs = getDivsWhereClassStartsWith(madeDivClassName);
        // console.log("Checking "+madeDivClassName+"* elements: " + JSON.stringify(pageInfoEs));
        var headingParts = getDivsWhereClassStartsWith(titlePrefix);
        var headingCreatedParts = getDivsWhereClassStartsWith(headingCreatedPrefix);
        if (headingParts.length > 0) {
        	info.title = headingParts[0].textContent;
        }
        else {
          console.warn("The title is missing. There are no divs with a class starting with " + titlePrefix);
        }
        var createdStr = null;
        if (headingCreatedParts.length > 0) {
        	createdStr = headingCreatedParts[0].textContent;
        }
        else {
          console.warn("The date is missing. There are no divs with a class starting with " + headingCreatedParts);
        }
        info.titleHref = window.location.href;
        // console.log("info.title: " + info.title);
        // console.log("info.titleHref: " + info.titleHref);
        console.log("createdStr: " + createdStr);
        if (createdStr !== null) {
          var createdParts = createdStr.split(" ");
          if (createdParts.length >= 3) {
            var yI = createdParts.length - 1;
            var dI = createdParts.length - 2;
            var mI = createdParts.length - 3;
            var yStr = createdParts[yI];
            var dStr = createdParts[dI];
            var mStr = createdParts[mI];
            if (dStr.endsWith(",")) {
              info.month = mStr;
              info.day = dStr.slice(0, -1);
              info.year = yStr;
            }
            else {
              console.warn("A date such as MON, D, YYYY was expected at the end of: \""+createdStr+"\"");
            }
          }
        }
        var aspects = [];
        aspects = getImgsWhereClassStartsWith(licenseClauseImgPrefix);
        var ai;
        if (aspects.length > 0) {
          info.license = "";
        }
        else {
          console.error("The license had zero clauses (img tags with "+licenseClauseImgPrefix+"* class)!")
        }
        var sep = " - ";
        for (ai = 0; ai < aspects.length; ai++) {
          var aspectImg = aspects[ai];
          if (aspectImg.src.endsWith("cc.svg")) {
            info.license += "Creative Commons";
          }
          else if (aspectImg.src.endsWith("nc.svg")) {
            info.license += sep + "Non-Commercial";
          }
          else if (aspectImg.src.endsWith("nd.svg")) {
            info.license += sep + "No Derivatives";
          }
          else if (aspectImg.src.endsWith("by.svg")) {
            info.license += sep + "Attribution";
          }
          else if (aspectImg.src.endsWith("sa.svg")) {
            info.license += sep + "ShareAlike"; // It has a space on ThingiVerse, but that is not correct.
          }
          else if (aspectImg.src.endsWith("zero.svg")) {
             // It is preceded by by.svg on ThingiVerse, but that is not correct.
            info.license = "Creative Commons Zero";
          }
          else {
            console.error("The license symbol list has an unknown clause symbol: " + aspectImg.src);
          }
        }
        if (info.license != undefined) {
        	console.log("The symbols indicate the following license: " + info.license);
        }

        // Format the info and copy it to the clipboard:
        outputStr = "## License";
        var licenseShortStr = "";
        var licenseAnchors = getAnchorsWhereClassStartsWith(licenseAnchorPrefix);
        var exactLicenseVersion = null;
        if (licenseAnchors.length > 0) {
          console.log("Checking " + licenseAnchors.length + " license anchors...");
          for (var lai=0, max=licenseAnchors.length; lai < max; lai++) {
            var licenseA = licenseAnchors[lai];
            // console.log("  checking " + licenseA.className + "...");
            // NOTE: .getAttribute("href") gets the raw value, but .href gets the resulting full URL.
            // console.log("  licenseA.href: " + typeof licenseA.href);
            // console.log("  licenseA.href.toString: " + typeof licenseA.href.toString);
            // console.log("  licenseA.href.toString().includes: " + typeof licenseA.href.toString().includes);
            if (licenseA.href === undefined) {
              console.warn("A license a.href is undefined.");
            }
            // else if (typeof licenseA.href.toString !== 'function') {
            //   console.warn("A license a.href.toString is not a function.");
            // }
            else if (typeof licenseA.href.includes !== 'function') {
              // NOTE: Firefox 48 removes the "contains" prototype--you must use includes!
              // console.warn("A license a.getAttribute(\"href\").includes is not a function.");
              console.warn("A license a.href.toString.includes is not a function.");
            }
            else if (!licenseA.href.includes("thingiverse.com")) {
              // console.log("licenseA.href: ");
              // console.log("'",licenseA.href, "'");
              info.licenseHref = licenseA.href;
              if (info.licenseHref.slice(-3, -2) == ".") {
              	exactLicenseVersion = licenseA.href.slice(-4, -1);
              }
              else {
                console.warn("slice at -3 is not .: " + info.licenseHref.slice(-3, -2));
              }
            }
            else {
              info.author = licenseA.textContent;
              info.authorHref = licenseA.href;
              // console.log("unused[]: " + licenseA.href);
              // console.log("author: " + info.author);
              // console.log("authorHref: " + info.authorHref);
            }
          }
        }
        else {
          console.warn("There is no anchor with a class like "+licenseAnchorPrefix+"*");
        }
        if (info.license) {
          var versionIsFound = false;
          var licenseLower = info.license.toLowerCase();
          outputStr += "\n- ";
          if (info.license.startsWith("Creative Commons") || info.license.startsWith("CC")) {
            if (info.license.startsWith("CC0 1.0") || info.license.startsWith("Creative Commons 0 1.0") || info.license.startsWith("Creative Commons Zero 1.0")) {
              if (!info.licenseHref) {
                info.licenseHref = "https://creativecommons.org/publicdomain/zero/1.0/";
              }
              licenseShortStr = "CCO 1.0";
            }
            else if ((info.license == "Creative Commons 0") || (info.license == "Creative Commons Zero")) {
              licenseShortStr = "CCO";
            }
            else {
              console.log("Looking for license clauses in license name \""+licenseLower+"\"...");
              licenseShortStr = "CC ";
              if (licenseLower.includes("attribution")) {
                licenseShortStr += "BY";
              }
              if (licenseLower.includes("non-commercial") || licenseLower.includes("noncommercial") || licenseLower.includes("non commercial")) {
                licenseShortStr += "-NC";
              }
              if (licenseLower.includes("no derivatives") || licenseLower.includes("noderivs") || licenseLower.includes("no-derivatives") || licenseLower.includes("noderivatives")) {
                licenseShortStr += "-ND";
              }
              if (licenseLower.includes("sharealike") || licenseLower.includes("share-alike") || licenseLower.includes("share alike") ) {
                licenseShortStr += "-SA";
              }

              if (info.license.includes("1.0")) {
                licenseShortStr += " 1.0";
                versionIsFound = true;
              }
              else if (info.license.includes("2.0")) {
                licenseShortStr += " 2.0";
                versionIsFound = true;
              }
              else if (info.license.includes("3.0")) {
                licenseShortStr += " 3.0";
                versionIsFound = true;
              }
              else if (info.license.includes("4.0")) {
                licenseShortStr += " 4.0";
                versionIsFound = true;
              }
              else if (exactLicenseVersion !== null) {
                licenseShortStr += " " + exactLicenseVersion;
                versionIsFound = true;
              }
            }
          }
          console.log("licenseShortStr: " + licenseShortStr);
          if (!info.licenseHref) {
            var parts = licenseShortStr.split(" ");
            if (parts.length == 3) {
              var partialHref = null;
              // such as ["CC", "BY-SA", "3.0"]
              if (parts[1] == "BY") {
                partialHref = "http://creativecommons.org/licenses/by/";
              }
              else if (parts[1] == "BY-SA") {
                partialHref = "http://creativecommons.org/licenses/by-sa/";
              }
              else if (parts[1] == "BY-NC-SA") {
                partialHref = "http://creativecommons.org/licenses/by-nc-sa/";
              }
              else if (parts[1] == "BY-NC-ND") {
                partialHref = "http://creativecommons.org/licenses/by-nc-nd/";
              }
              // NOTE: by-nc-nd-sa is NOT a valid license
              if (partialHref != null) {
                info.licenseHref = partialHref + parts[2] + "/";
              }
            }
          }
          if (info.licenseHref) {
            outputStr += "[" + info.license + "](" + info.licenseHref + ")";
          }
          else {
            outputStr += info.license;
          }
          if (licenseShortStr.length > 0) {
            outputStr += "\n  (" + licenseShortStr + ")";
          }
        }
        else {
          console.warn("The license abbreviation cannot be generated for an unknown license: " + info.license);
        }
        if (info.author) {
          outputStr += "\n- by " + info.author + " and <insert remixer's name here>";
        }
        if (info.title) {
          outputStr += "\n- based on";
          if (info.titleHref) {
            outputStr += " [" + info.title + "](" + info.titleHref + ")";
          }
          else {
            outputStr += " " + info.title;
          }
          if (info.author) {
            if (info.authorHref) {
              outputStr += " by [" + info.author + "](" + info.authorHref + ")";
            }
            else {
              outputStr += " by " + info.author;
            }
          }
          if (info.year) {
            outputStr += " ";
            if (info.month) {
              outputStr += info.month + " ";
              if (info.day) {
                outputStr += info.day + ", "
              }
            }
            outputStr += info.year;
          }
        }
        var msg = "(ERROR: Your browser API is unknown.)";
        var okMsg = " &#10003;";
        // See https://stackoverflow.com/questions/52177405/clipboard-writetext-doesnt-work-on-mozilla-ie
        if (navigator.clipboard != undefined) { // Chrome
          navigator.clipboard.writeText(outputStr).then(
            function () {
              console.log('Async: Copying to clipboard was successful!');
              btn.innerHTML += okMsg;
            }, function (err) {
              console.error('Async: Could not copy text: ', err);
              btn.innerHTML += '<br/> (ERROR: Accessing the clipboard failed.)';
            }
          );
          msg = null;
        }
        else if (window.clipboardData) { // Internet Explorer
          window.clipboardData.setData("Text", outputStr);
          msg = okMsg;
        }
        if (msg != null) {
          btn.innerHTML += msg;
        }
      });
      pageInfoE.appendChild(btn); // Append <button> to <body>
    }
    else {
      console.log('The '+madeDivClassName+' class was not found!');
    }
  }//end addButton
  function checkIfComplete() {
    // console.log("Monitoring page loading...");
		var ready = true;
    var containers = getDivsWhereClassStartsWith(madeDivClassName);
    // console.log("Checking for completed page content...");
    if (containers.length == 1) {
      if (!elementHasAllPrefixes(containers[0], doneDivPrefixes)) {
        ready = false;
        // console.log("The "+containers[0].className+" container is not complete:");
        // console.log("The document is not ready yet ("+containers[0].className+" does not contain the classes with the prefixes \""+JSON.stringify(doneDivPrefixes)+"\").");
      }
    }
    else {
      ready = false;
      // console.log("The page is not formatted as expected:");
      // console.log(containers.length + " is an unexpected count for divs with a class named like " + madeDivClassName + "*.");
    }
    if (!hasAllDivPrefixes(doneDivPrefixesMain)) {
      ready = false;
      // console.log("The document is not complete:");
      // console.log("The document is not ready yet (the document does not contain the class(es) with the prefix(es) \""+JSON.stringify(doneDivPrefixesMain)+"\").");
    }
    if (ready) {
      // console.log("The page has loaded.");
      clearInterval(checkTimer);
      addButton();
      console.log("The license detection will resume after a user clicks the copy license button.");
    }
    else {
      console.log("The document is not ready (or is missing required fields)...");
    }
  }
  checkTimer = setInterval(checkIfComplete, 2000);
})();
