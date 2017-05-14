/* global require, phantom, decodeURI */
/**
 * Requirements: casperjs, phantomjs in path
 */
var fs = require("fs");
var config = require("./config");
var csvDelimiter = config.csvDelimiter;
var csvNewLine = config.csvNewLine;
var casper = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false
    }
});
casper.userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36");

// defining label for pagination loop
casper.label = function label(labelname) {
    var step = new Function('"empty function for label: ' + labelname + ' "');
    step.label = labelname;
    this.then(step);
};

// defining goto for pagination loop
casper.goto = function goto(labelname) {
    for (var i = 0; i < this.steps.length; i++) {
        if (this.steps[i].label === labelname) {
            this.step = i;
        }
    }
};

// returns the result number range
function getResultNumRange() {
    return casper.evaluate(function () {
        return jQuery("span.page.current").text().trim() + "th pagination per 10 results";
    });
}

// returns the total number of paginations
function getTotalPaginations() {
    return casper.evaluate(function () {
        var navigation = jQuery(".nav.pagination");
        if (navigation.size() === 0) {
            return 1;
        }
        var gap = navigation.find(".page.gap");
        if (gap.size()) {
            return navigation.find(".page.gap").last().next().text().trim();
        }
        return navigation.children(".page").size();
    });
}

// returns the number of results displayed on a result page
function getNResultsYellowPagesDisplayed() {
    return casper.evaluate(function () {
        if (jQuery("h1").size()) {
            var s = jQuery("h1").text();
            s = s.substring(s.indexOf("- ") + 2, s.length);
            s = s.substring(0, s.indexOf(" "));
            return Number(s);
        } else {
            return 0;
        }
    });
}

function extractPage(cn, sp) {
    return casper.evaluate(function (c, s, csvDelimiter, csvNewLine) {
        var r = "";
        jQuery(".row.local-listing").each(function () {
            var t = jQuery(this);
            var resultNumber = "N/A";
            var yellowUrl = t.find("a.details-entry-title-link").attr("href");
            var name = t.find("a.details-entry-title-link").text().replace(/\s+/g, " ").trim();
            var sa = t.find("span.address").text().replace(/\s+/g, " ").trim();
            //indexOfCommaBeforePostCode
            var iocbpc = sa.lastIndexOf(",");
            if (!sa.charAt(iocbpc + 3).match(/\d/).length) {
                sa = sa.slice(0, iocbpc) + sa.slice(iocbpc+1,sa.length);
            } else {
                sa = sa.substring(0, sa.lastIndexOf(",")) + csvDelimiter + sa.substring(sa.lastIndexOf(",") + 1, sa.length);
            }
            var phone = t.find("a.number").text().replace(/\s+/g, " ").trim();
            var website = t.find("a.redirect").text().replace(/\s+/g, " ").trim() || "";
            
            r += c.replace(/%20/g, " ") + csvDelimiter +
                 s                      + csvDelimiter +
                 resultNumber           + csvDelimiter +
                 yellowUrl              + csvDelimiter +
                 name                   + csvDelimiter +
                 sa                     + csvDelimiter +
                 phone                  + csvDelimiter +
                 website                + csvDelimiter + csvNewLine;
        });
        return r;
    }, cn, sp, csvDelimiter, csvNewLine);
}

casper.start();
casper.viewport(1366, 768);

var okToGo = true;

if (!casper.cli.has("cityName")) {
    okToGo = false;
    casper.echo('[ERR] No cityName specified. Use --cityName="St.+Gallen"');
}

if (!casper.cli.has("searchPhrase")) {
    okToGo = false;
    casper.echo('[ERR] No searchPhrase specified. Use --searchPhrase="pizzeria"');
}

if (okToGo) {
    var lastResultNumRange = "";
    var domainUrl = "http://yellow.local.ch";
    var baseUrl = domainUrl + "/en/q";

    var timeBeforePaginations = 263;
    var timeToLoadPagination = 2131;
    var randomTimeRangeTo = 1534;
    var randomTimeRangeFrom = 342;
    var csvHeader =
            "cityName"          + csvDelimiter + 
            "searchPhrase"      + csvDelimiter + 
            "resultNum"         + csvDelimiter + 
            "ypchsite"          + csvDelimiter + 
            "name"              + csvDelimiter + 
            "address1"          + csvDelimiter + 
            "address2"          + csvDelimiter + 
            "phone"             + csvDelimiter + 
            "website"           + csvNewLine;
    var cookiesFile = casper.cli.get("cookiesFile");
    var searchPhrasesFile = casper.cli.get("searchPhrasesFile");

    var cityName = casper.cli.get("cityName");
    var searchPhrase = casper.cli.get("searchPhrase");

    var cityNameIndex = casper.cli.raw.get("cityNameIndex") ? casper.cli.get("cityNameIndex") : "x";
    var searchPhraseIndex = casper.cli.raw.get("searchPhraseIndex") ? casper.cli.get("searchPhraseIndex") : "x";

    var outputFolder = casper.cli.raw.get("outputFolder") ? casper.cli.raw.get("outputFolder") : ".";

    casper.then(function () {
        var writeMode = "w";
        var url = baseUrl + "/" + cityName + "/" + searchPhrase + ".html?rid=jxKc";
        if (casper.cli.has("paginationIndex")) {
            url = url + "&page=" + casper.cli.get("paginationIndex");
            writeMode = "a";
        }
        var cni = (cityNameIndex < 10 ? ("00" + cityNameIndex) : (cityNameIndex < 100 ? ("0" + cityNameIndex) : cityNameIndex));
        var spi = (searchPhraseIndex < 10 ? ("00" + searchPhraseIndex) : (searchPhraseIndex < 100 ? ("0" + searchPhraseIndex) : searchPhraseIndex));
        var resultFile = outputFolder
                + "/c" + cni
                + "_s" + spi
                + "_" + decodeURI(cityName) + "_" + decodeURI(searchPhrase) + ".csv";

        casper.thenOpen(url, function () {
            casper.echo("");
            casper.echo("[LOG] Opened url: " + url);
        });

        casper.then(function () {
            var paginationIndex = casper.cli.get("paginationIndex") || 1;
            var continuing = true;
            var nResultsYellowPagesDisplayed = getNResultsYellowPagesDisplayed();
            var totalPaginations = getTotalPaginations();
            casper.echo("[LOG] Number of results displayed on page: " + nResultsYellowPagesDisplayed);
            casper.echo("[LOG] Total number of paginations: " + totalPaginations);
            casper.echo("");

            if (!nResultsYellowPagesDisplayed) {
                casper.echo("[LOG] This search did not return any results: " + nResultsYellowPagesDisplayed);
                //fs.write(outputFolder + "/noResults/c" + cityNameIndex + "_s" + searchPhraseIndex + "_" + decodeURI(cityName) + "_" + decodeURI(searchPhrase), "", "w");                
                fs.write(resultFile + ".noRes.csv", "", "w");
            } else {
                if (writeMode === "w") {
                    casper.echo("[LOG] Creating result file: " + resultFile);
                    fs.write(resultFile, csvHeader, writeMode);
                } else {
                    casper.echo("[LOG] Appending to result file: " + resultFile);
                }

casper.label("PAGINATION_LOOP_START");

                casper.wait(timeToLoadPagination + Math.floor((Math.random() * randomTimeRangeTo) + randomTimeRangeFrom), function () {
                    var d = new Date();
                    var h = d.getHours();
                    var m = d.getMinutes();
                    var s = d.getSeconds();
                    var currentTime = d.getDate() + "." + (d.getMonth() + 1) + " "
                            + (h < 10 ? "0" + h : h) + ":"
                            + (m < 10 ? "0" + m : m) + ":"
                            + (s < 10 ? "0" + s : s);

                    var processing = "[LOG]        " + currentTime + " Processing pagination: " + paginationIndex + "/" + totalPaginations
                            + " of request: '" + decodeURI(cityName) + "', '" + decodeURI(searchPhrase)
                            + "' (" + cityNameIndex + ", " + searchPhraseIndex + ")";
                    casper.echo(processing);

                    fs.write(outputFolder + "/_LastActivityList.txt", processing + "\r\n", "a");

                    if (!casper.exists("span.next")) {
                        casper.echo("[LOG]             This is the last pagination");
                        continuing = false;
                    }
                });
                casper.then(function () {
                    var resultNumRange = getResultNumRange();
                    casper.echo("[LOG]         Result range: " + resultNumRange);
                    if (lastResultNumRange === resultNumRange) {
                        casper.echo("[LOG]             Detected same result range");
                        continuing = false;
                    } else {
                        lastResultNumRange = resultNumRange;
                        var result = extractPage(cityName, searchPhrase);
                        fs.write(resultFile, result, "a");
                        result = "";
                    }
                });
                casper.wait(timeBeforePaginations + Math.floor((Math.random() * randomTimeRangeFrom) + randomTimeRangeTo), function () {
                    if (continuing) {
                        var nextUrl = casper.getElementAttribute("a.forward", "href");
                        casper.evaluate(function (nextUrl) {
                            jQuery(document.head).children().remove();
                            jQuery(document.body).children().remove();
                            jQuery(document.body).append(jQuery('<a class="forward" href="' + nextUrl + '">'));
                        }, nextUrl);
                        casper.click("a.forward");
                        paginationIndex++;

casper.goto("PAGINATION_LOOP_START");

                    } else {
                        //casper.echo("[LOG] Current size of cookies: " + phantom.cookies.length);
                        //fs.write(cookiesFile, JSON.stringify(phantom.cookies, null, 2), "w");
                    }
                });
            }
        });

        casper.then(function () {
            //casper.clear();
        });
    });
}

casper.then(function () {
    casper.echo("");
    casper.echo("[LOG] End");
});

casper.run();

