# -*- coding: utf-8 -*-
#! /usr/bin/python

import os
import re
from subprocess import call
import sys
from time import sleep
import urllib

okToGo = True
timeBetweenCalls = 10  #seconds

if (len(sys.argv) < 8):
    print "[ERR] Usage: python auto_ypch_list.py <city_names_file> <search_phrases_file> <cityNameStartIndex> <cityNameEndIndex> <searchPhraseStartIndex> <searchPhraseEndIndex> <outputFolder> [paginationIndex]"
    print "[ERR]    You have to specify:"
    print "[ERR]        <city_names_file>           a file with city names as the first argument of this script"
    print "[ERR]        <search_phrases_file>       and a file with seach phrases as the second argument of this script" 
    print "[ERR]        <cityNameStartIndex>        an index number where to start from in the city names list (inclusive)"
    print "[ERR]        <cityNameEndIndex>          an index number where to end at in the city names (inclusive)"
    print "[ERR]        <searchPhraseStartIndex>    an index number where to start from in the search phrases list (inclusive)"
    print "[ERR]        <searchPhraseEndIndex>      an index number where to end at in the search phrases (inclusive)"
    print "[ERR]        <outputFolder>              a folder where to put the results"
    print "[ERR]        [paginationIndex]           and optionally a pagination from which to start"
    print "[ERR]    example: python auto_ypch_list.py cityNames.txt searchPhrases.txt  0 0 0 6 Zurich"
    okToGo = False
    
else:
    if (not(os.path.isfile(sys.argv[1]))):
        print "[ERR] " + sys.argv[1] + " is not a file"
        okToGo = False

    if (not(os.path.isfile(sys.argv[2]))):
        print "[ERR] " + sys.argv[2] + " is not a file"
        okToGo = False

    if (not(sys.argv[3].isdigit())):
        print "[ERR] " + sys.argv[3] + " is not a number"
        okToGo = False

    if (not(sys.argv[4].isdigit())):
        print "[ERR] " + sys.argv[4] + " is not a number"
        okToGo = False
        
    if (not(sys.argv[5].isdigit())):
        print "[ERR] " + sys.argv[5] + " is not a number"
        okToGo = False

    if (not(sys.argv[6].isdigit())):
        print "[ERR] " + sys.argv[6] + " is not a number"
        okToGo = False
    
if (okToGo):
    #cookiesFile = sys.argv[1]
    with open(sys.argv[1], "r") as lines:
        cityNames = []
        for line in lines:
            l = line.strip().lower()
            if (len(l) > 0):
                l = re.sub('Ä', 'a', l)
                l = re.sub('ä', 'a', l)

                l = re.sub('Ö', 'o', l)
                l = re.sub('ö', 'o', l)

                l = re.sub('Ü', 'u', l)
                l = re.sub('ü', 'u', l)

                l = re.sub('ß', 'ss', l)
                l = re.sub('[ ]+', '%20', l)
                cityNames.append(urllib.quote((l), safe='-%'))
    
    with open(sys.argv[2], "r") as lines:
        searchPhrases = []
        for line in lines:
            l = line.strip().lower()
            if (len(l) > 0):
                l = re.sub('Ä', 'a', l)
                l = re.sub('ä', 'a', l)

                l = re.sub('Ö', 'o', l)
                l = re.sub('ö', 'o', l)

                l = re.sub('Ü', 'u', l)
                l = re.sub('ü', 'u', l)

                l = re.sub('ß', 'ss', l)
                l = re.sub('[ ]+', '%20', l)
                searchPhrases.append(urllib.quote(re.sub('[ ]+', '-', l), safe='-%'))
                
    cityNameStartIndex = int(sys.argv[3])
    cityNameEndIndex = int(sys.argv[4])
    searchPhraseStartIndex = int(sys.argv[5])
    searchPhraseEndIndex = int(sys.argv[6])
    outputFolder = sys.argv[7]
    paginationIndex = ""
    if len(sys.argv)==9:
        paginationIndex = "--paginationIndex=" + sys.argv[8] 
    
    if (cityNameStartIndex > cityNameEndIndex):
        print "[PYTHON] cityNameStartIndex is greater than cityNameEndIndex"
        print "[PYTHON] " + str(cityNameStartIndex) + " > " + str(cityNameEndIndex)
    elif (searchPhraseStartIndex > searchPhraseEndIndex):
        print "[PYTHON] searchPhraseStartIndex is greater than searchPhraseEndIndex"
        print "[PYTHON] " + str(searchPhraseStartIndex) + " > " + str(searchPhraseEndIndex)
    else:
        cityNamesLength = len(cityNames)
        searchPhrasesLength = len(searchPhrases)
        
        print "[PYTHON] Total number of cityNames: " + str(cityNamesLength)
        print "[PYTHON] City namess range (inclusive): " + str(cityNameStartIndex) + " - " + str(cityNameEndIndex)
        print "[PYTHON] Total number of searchPhrases: " + str(searchPhrasesLength)
        print "[PYTHON] Search phrases range (inclusive): " + str(searchPhraseStartIndex) + " - " + str(searchPhraseEndIndex)


        for cityNameIndex, cityName in enumerate(cityNames):
            if (cityNameIndex >= cityNameStartIndex and cityNameIndex <= cityNameEndIndex):
                for searchPhraseIndex, searchPhrase in enumerate(searchPhrases):
                    if (searchPhraseIndex >= searchPhraseStartIndex and searchPhraseIndex <= searchPhraseEndIndex):
                        #print cityName + "\t" + searchPhrase
                        
                        v = [
                            'casperjs', 
                            'ypch_list.js',
                            '--cityName="' + cityName + '"',
                            '--searchPhrase="' + searchPhrase + '"',
                            '--cityNameIndex=' + str(cityNameIndex),
                            '--searchPhraseIndex=' + str(searchPhraseIndex),
                            '--outputFolder="' + outputFolder + '"',
                            paginationIndex
                        ]
                        
                        print "[PYTHON] " + str(v)
                        call(v)
                        print "[PYTHON] Done: " \
                            + "\n\t         City: " + str(cityNameIndex) + "/" + str(cityNamesLength-1) + " (" + str(cityNameStartIndex) + "-" + str(cityNameEndIndex) + ")" + "\t" + cityName \
                            + "\n\tSearch Phrase: " + str(searchPhraseIndex) + "/" + str(searchPhrasesLength-1) + " (" + str(searchPhraseStartIndex) + "-" + str(searchPhraseEndIndex) + ")\t" + searchPhrase
                        print ""
                        print "[PYTHON] Sleeping " + str(timeBetweenCalls) + " secs before next session"
                        sleep(timeBetweenCalls)

