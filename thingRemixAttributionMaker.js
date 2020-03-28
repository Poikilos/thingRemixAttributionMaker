// ==UserScript==
// @name         Thing Remix Attribution Maker
// @namespace    http://poikilos.org/
// @version      1.0
// @description  Format the license information from a thing page
// @author       Poikilos (Jake Gustafson)
// @include      https://www.thingiverse.com/thing:*
// @grant        none
// ==/UserScript==

(function() {
    // @ m a t c h        https://www.thingiverse.com/thing:*
    'use strict';
    var info = {};
    var pageInfoEs = document.getElementsByClassName("item-page-info");
    if (pageInfoEs.length >= 1) {
        var pageInfoE = pageInfoEs[0];
        // There should only be one.
        // pageInfoE.innerHTML += "<button onclick=\"getRemixLicense()\">Copy License for Remix</button>";
        //or:
        // See https://www.w3schools.com/jsref/met_document_createelement.asp
        var btn = document.createElement("BUTTON");   // Create a <button> element
        btn.setAttribute("class", "grey-button");
        var btnText = "Copy License for Remix"
        btn.innerHTML = btnText;                   // Insert text
        btn.addEventListener("click", function(){
            btn.innerHTML = btnText;
            var licenseTextE = document.getElementsByClassName("license-text");
            var outputStr = "";
            var pageInfoEs = document.getElementsByClassName("item-page-info");
            var elements = [];
            var i;
            for (i = 0; i < licenseTextE.length; i++) {
                elements.push(licenseTextE[i]);
            }
            for (i = 0; i < pageInfoEs.length; i++) {
                elements.push(pageInfoEs[i]);
            }

            // var elements = licenseTextE.concat(pageInfoE); // ERROR: "concat is not a function"

            for (i = 0; i < elements.length; i++) {
                outputStr += "\n\n## License";
                outputStr += "\n- ";
                // There should only be one.
                var children = elements[i].children;
                var basisStr = "";
                for (var j = 0; j < children.length; j++) {
                    var child = children[j];
                    // basisStr += child.textContent.trim() + " ";
                    var grandchildren = child.children;
                    var grandchild0 = null;
                    if (grandchildren && (grandchildren.length > 0)) {
                        grandchild0 = grandchildren[0];
                    }
                    var text = child.textContent.trim();
                    while (text.indexOf("\t") > -1) {
                        text = text.replace("\t", " ");
                    }
                    while (text.indexOf("\n") > -1) {
                        text = text.replace("\n", " ");
                    }
                    while (text.indexOf("  ") > -1) {
                        text = text.replace("  ", " ");
                    }
                    var words = text.split(" ");
                    if (words.length == 3) {
                        if (words[1].endsWith(",")) {
                            info.month = words[0];
                            info.day = words[1].substring(0, words[1].length - 1);
                            info.year = words[2];
                        }
                    }
                    if (!info.year) {
                        // It is not a date, so see if it is something else:
                        if (text.startsWith("by ")) {
                            if (grandchild0 && grandchild0.tagName == "a") {
                                info.author = grandchild0.textContent.trim();
                                info.authorHref = grandchild0.getAttribute("href");
                            }
                            else {
                                info.author = text.substring(3).trim();
                            }
                        }
                        else if (child.getAttribute("property") == "cc:attributionName") {
                            if (grandchild0 && grandchild0.getAttribute("href")) { // This is unexpected.
                                info.author = grandchild0.textContent.trim();
                                info.authorHref = grandchild0.getAttribute("href");
                            }
                            else if (child.getAttribute("href")) {
                                info.author = child.textContent;
                                info.authorHref = child.getAttribute("href");
                            }
                            else
                                info.author = text.trim();
                        }
                        else if (child.getAttribute("rel") == "license") {
                            info.license = text.trim();
                            if (child.getAttribute("href")) {
                                info.licenseHref = child.getAttribute("href");
                            }
                        }
                        else if (grandchild0 && (grandchild0.getAttribute("property") == "dc:title")) {
                            info.title = text.trim();
                            if (child.getAttribute("href")) {
                                info.titleHref = child.getAttribute("href");
                                if (info.titleHref.startsWith("/thing:")) {
                                    info.titleHref = "https://thingiverse.com" + info.titleHref;
                                }
                            }
                        }
                        else if (child.tagName == "h1") {
                            info.title = text.trim();
                        }
                        else {
                            var propertyMsg = "";
                            propertyMsg += "property=" + child.getAttribute("property");
                            if (grandchild0) {
                                //propertyMsg = "grandchild0.property=?";
                                propertyMsg += ", grandchild0.property=" + grandchild0.getAttribute("property");
                            }
                            console.log(`UNPARSED attribution info (${propertyMsg}): '${child.innerHTML}'`);
                        }
                    }
                }
                // outputStr += basisStr;
            }

            // Format the info and copy it to the clipboard:
            outputStr = "## License";
            var licenseShortStr = "";
            if (info.license) {
                var licenseLower = info.license.toLowerCase();
                outputStr += "\n- ";
                if (info.license.indexOf("Creative Commons") || info.license.startsWith("CC")) {
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
                        licenseShortStr = "CC ";
                        if (licenseLower.contains("attribution")) {
                            licenseShortStr += "BY";
                        }
                        if (licenseLower.contains("non-commercial") || licenseLower.contains("noncommercial") || licenseLower.contains("non commercial")) {
                            licenseShortStr += "-NC";
                        }
                        if (licenseLower.contains("no derivatives") || licenseLower.contains("noderivs") || licenseLower.contains("no-derivatives") || licenseLower.contains("noderivatives")) {
                            licenseShortStr += "-ND";
                        }
                        if (licenseLower.contains("sharealike") || licenseLower.contains("share-alike") || licenseLower.contains("share alike") ) {
                            licenseShortStr += "-SA";
                        }

                        if (info.license.contains("1.0")) {
                            licenseShortStr += " 1.0";
                        }
                        else if (info.license.contains("2.0")) {
                            licenseShortStr += " 2.0";
                        }
                        else if (info.license.contains("3.0")) {
                            licenseShortStr += " 3.0";
                        }
                        else if (info.license.contains("4.0")) {
                            licenseShortStr += " 4.0";
                        }
                    }
                }
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
                if (info.licenseHref)
                    outputStr += "[" + info.license + "](" + info.licenseHref + ")";
                else
                    outputStr += info.license;
                if (licenseShortStr.length > 0) {
                    outputStr += "\n  (" + licenseShortStr + ")";
                }
            }
            if (info.author) {
                outputStr += "\n- by " + info.author + " and <insert remixer's name here>";
            }
            if (info.title) {
                outputStr += "\n- based on";
                if (info.titleHref)
                    outputStr += " [" + info.title + "](" + info.titleHref + ")";
                else
                    outputStr += " " + info.title;
                if (info.author) {
                    if (info.authorHref)
                        outputStr += " by [" + info.author + "](" + info.authorHref + ")";
                    else
                        outputStr += " by " + info.author;
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

            i = null
        });
        pageInfoE.appendChild(btn);               // Append <button> to <body>
    }
    else {
        console.log('The item-page-info class was not found!');
    }
    i = null;
    // Your code here...
})();
