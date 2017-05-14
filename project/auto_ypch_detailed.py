# -*- coding: utf-8 -*-
#! /usr/bin/python

import os
import re
from subprocess import call
import sys
from time import sleep

okToGo = True
timeBetweenCalls = 5 #seconds
files = []

if (len(sys.argv) != 6):
    print "[ERR] Usage: python auto_ypch_detailed.py <folder_containing_list_scraped_csv_files> <output_folder> <scraped_file_start_index> <scraped_file_end_index> <fileLineStartIndex>"
    print "[ERR]    You have to specify:"
    print "[ERR]        name of the folder where you have the scraped files from ypch_list.js"
    print "[ERR]        a folder where to put the results"
    print "[ERR]        a number from which file index in the folder to start"
    print "[ERR]        a number at which file index in the folder to end"
    print "[ERR]        a number from which line index in the file to start at"
    print "[ERR]        "
    print "[ERR]    eg. python auto_ypch_details.py Zurich Zurich/_detailed 0 6 0"
    okToGo = False
    
else:

    if (not(os.path.isdir(sys.argv[1]))):
        print "[ERR] " + sys.argv[1] + " is not a folder"
        okToGo = False
       
    if (not(os.path.isdir(sys.argv[2]))):
        print "[ERR] " + sys.argv[2] + " is not a folder"
        print "[LOG] Do you want to create this output folder? (Yes/No)"
        response = raw_input()
        if(response.lower() == "yes"):
            print "[LOG] Making output directory " + sys.argv[2]
            os.mkdir(sys.argv[2])
            okToGo = True
        else:
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
       

if (okToGo):   
    scrapedFileStartIndex = int(sys.argv[3])
    scrapedFileEndIndex = int(sys.argv[4])
    if(scrapedFileStartIndex > scrapedFileEndIndex):
        print "[ERR] scrapedFileStartIndex is greater than scrapedFileEndIndex"
        okToGo = False
    
if (okToGo):      
    inputFolder = sys.argv[1]
    outputFolder = sys.argv[2]
    
    fileLineStartIndex = int(sys.argv[5])
    files = []
	
    for f in os.listdir(inputFolder): 
        if os.path.isfile(inputFolder + "/" + f):
            if f.endswith(".csv"):
                #ff = re.sub("_", " ", f)
                files.append(inputFolder + "/" + f)
	
	#files.sort()
	
    nFiles = len(files)
    
    for index, scrapedFile in enumerate(files):
        if(index >= scrapedFileStartIndex and index <= scrapedFileEndIndex):
            v = [
                'casperjs',
                'ypch_detailed.js',
                '--scrapedFile="' + scrapedFile + '"',
                '--outputFolder="' + outputFolder + '"',
                '--startIndex=' + str(fileLineStartIndex),
                '--scrapedFileIndex=' + str(index),
                '--nScrapedFiles=' + str(nFiles),
            ]
            
            print "[PYTHON] Calling " + str(index) + " " + str(v)
            #print str(index) + " " + scrapedFile
            call(v)
            print "[PYTHON] Sleeping " + str(timeBetweenCalls) + " secs before next session"
            sleep(timeBetweenCalls)
            