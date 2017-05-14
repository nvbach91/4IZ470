/* global require, phantom */
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

function extractPage() {
    return casper.evaluate(function (csvDelimiter, csvNewLine) {
        var result = "";
        var openingHours = "";
        jQuery(".hours .lcl-read-more table tr").each(function () {
            openingHours += jQuery(this).text().replace(/\s+/g, " ").trim() + " | ";
        });
        var images = [];
        jQuery(".pictures > a > img").each(function () {
            var l = jQuery(this).attr("src");
            images.push(l.substring(0, l.indexOf("?")));
        });
        
        var email = jQuery(".email > a").text().replace(/\s+/g, " ").trim();
        var lat = jQuery("#detail-entry-map").attr("data-markers-latitude");
        var lon = jQuery("#detail-entry-map").attr("data-markers-longitude");
        var desc = jQuery(".description p").text().replace(/\s+/g, " ").trim();

        result += 
            email                   + csvDelimiter +
            lat                     + csvDelimiter +
            lon                     + csvDelimiter +
            desc                    + csvDelimiter +
            JSON.stringify(images)  + csvDelimiter +
            openingHours            + csvNewLine;
            
        jQuery(document.body).remove();
        jQuery(document.head).remove();
        
        return result;
    }, csvDelimiter, csvNewLine);
}
;

function getUrlsFromScrapedFile(scrapedFile) {
    var urls = [];
    var stream = fs.open(scrapedFile, "r");
    //Get rid of the csv header
    stream.readLine();
    while (!stream.atEnd()) {
        var line = stream.readLine();
        if (line.length) {
            urls.push(line.split(csvDelimiter)[3]);
        }
    }
    return urls;
}

casper.start();
casper.userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36");
casper.viewport(1366, 768);
var okToGo = true;

if (!casper.cli.has("scrapedFile")) {
    okToGo = false;
    casper.echo('[ERR] No scrapedFile specified. Use --scrapedFile="<path_to_result_file>"');
}

var startIndex = 0;

if (casper.cli.has("startIndex")) {
    startIndex = casper.cli.get("startIndex");
    if (typeof startIndex !== "number") {
        casper.echo("[ERR] startIndex must be a number");
        okToGo = false;
    }
    else if (startIndex < 0) {
        casper.echo("[ERR] startIndex must be a 0 or greater");
        okToGo = false;
    }
}

var outputFolder = "./_detailed/";

if (casper.cli.has("outputFolder")) {
    outputFolder = casper.cli.get("outputFolder") + "/";
    outputFolder = outputFolder.replace(/\/+/g, "/");
}

var scrapedFileIndex = 0;

if (casper.cli.has("scrapedFileIndex")) {
    scrapedFileIndex = casper.cli.get("scrapedFileIndex");
}

var nScrapedFiles = 0;

if (casper.cli.has("nScrapedFiles")) {
    nScrapedFiles = casper.cli.get("nScrapedFiles");
}

if (!okToGo) {
    casper.echo('[ERR] Example: casperjs ypch_details.js --scrapedFile="c000_s000_zurich_hairdresser.csv" --outputFolder="./" --startIndex=0');
}

if (okToGo) {
    var timeBeforeNextPage = 1341;
    var randomTimeRangeTo = 1534;
    var randomTimeRangeFrom = 942;
    var scrapedFile = casper.cli.get("scrapedFile");
    var resultFile = outputFolder + "detailed_" + scrapedFile.substring(scrapedFile.lastIndexOf("/") + 1, scrapedFile.length);
    var csvHeader =
            "cityName"          + csvDelimiter + 
            "searchPhrase"    + csvDelimiter + 
            "resultNum"       + csvDelimiter + 
            "ypchsite"        + csvDelimiter + 
            "name"            + csvDelimiter + 
            "address1"        + csvDelimiter + 
            "address2"        + csvDelimiter + 
            "phone"           + csvDelimiter + 
            "website"         + csvDelimiter + 
            "email"           + csvDelimiter + 
            "lat"             + csvDelimiter + 
            "lon"             + csvDelimiter + 
            "desc"            + csvDelimiter + 
            "imageslinks"     + csvDelimiter + 
            "openinghours"    + csvNewLine;
    if(startIndex === 0) {
        fs.write(resultFile, csvHeader, "w");
    }
    var scrapedFileStream = fs.open(scrapedFile, "r");

    //Get rid of the csvHeader
    scrapedFileStream.readLine();


    var detailSitesUrls = [];

    casper.then(function () {
        casper.echo("[LOG] Gathering detail urls from: " + scrapedFile);
        detailSitesUrls = getUrlsFromScrapedFile(scrapedFile);
        casper.echo("[LOG] Number of urls: " + detailSitesUrls.length);
        casper.echo("");
    });

    casper.then(function () {
        casper.each(detailSitesUrls, function (self, detailSitesUrl, urlIndex) {
            if(urlIndex < startIndex) {
                scrapedFileStream.readLine();
            } else {
                casper.thenOpen(detailSitesUrl, function () {
                    if(casper.cli.has("capture")){
                        casper.capture(outputFolder + "/capture/u" + urlIndex + "_f" + scrapedFileIndex + ".png" );
                    }
                    //casper.then(function(){
                    var d = new Date();
                    var h = d.getHours();
                    var m = d.getMinutes();
                    var s = d.getSeconds();
                    var currentTime = d.getDate() + "." + (d.getMonth() + 1) + ". "
                            + (h < 10 ? "0" + h : h) + ":"
                            + (m < 10 ? "0" + m : m) + ":"
                            + (s < 10 ? "0" + s : s);

                    //casper.capture(urlIndex + ".png");
                    var processing = "[LOG] " + currentTime 
                            + " Extracting details of url: " + urlIndex + "/" + (detailSitesUrls.length - 1) 
                            + " in file index (" + scrapedFileIndex + "/" + (nScrapedFiles - 1) + "): " 
                            + scrapedFile + " " + casper.exists(".logo-img-desktop");

                    console.log(processing);
                    fs.write(outputFolder + "/_LastActivityDetailed.txt", processing + "\r\n", "a");
                });
                casper.then(function () {
                    var resultLine = scrapedFileStream.readLine() + extractPage();
                    fs.write(resultFile, resultLine, "a");
                });

                casper.then(function () {
                    // seems like clear() will increase memory usage on this site
                    //casper.clear();
                    casper.evaluate(function () {
                        jQuery(document.head).empty();
                        jQuery(document.body).empty();
                    });
                });

                casper.wait(timeBeforeNextPage + Math.floor((Math.random() * randomTimeRangeTo) + randomTimeRangeFrom), function () {
                    //casper.capture("detailsCapture/" + urlIndex + ".png");
                });
            }
        });
    });
}

casper.then(function () {
    casper.echo("");
    casper.echo("[LOG] End");
});

casper.run();

