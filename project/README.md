# Switzerland's Yellow Pages Scraping

##Quickstart:
```
python auto_ypch_list.py cityNames.txt searchPhrases.txt 0 0 0 202 Zurich
python auto_ypch_list.py cityNames.txt searchPhrases.txt 1 1 0 202 Lausanne
python auto_ypch_list.py cityNames.txt searchPhrases.txt 2 2 0 202 Geneva
.
.
.
python auto_ypch_detailed.py Zurich   Zurich/_detailed   0 1000 0
python auto_ypch_detailed.py Lausanne Lausanne/_detailed 0 1000 0
python auto_ypch_detailed.py Geneva   Geneva/_detailed   0 1000 0
.
.
.
and so on...
``` 

##Requirements:
* Download [CasperJS](http://casperjs.org/) and put it in system Path
* Download [PhantomJS](http://phantomjs.org/) and put it in system Path
* Install [Python 2.7.13](https://www.python.org/downloads/) and put it in system Path


##CasperJS usage:
```
casperjs ypch_list.js <--cityName="Zurich"> <--searchPhrase="restaurant"> [--cityNameIndex=0] [--searchPhraseIndex=0] [--outputFolder="./"]
```

* Arguments inside diamond brackets are mandatory
* Arguments inside square brackets are optional
* The command above (without brackets) scrapes results for the keyword **restaurant** in **Zurich** and puts data in a file called **c0_s0_Zurich_restaurant.csv**

```
casperjs ypch_detailed.js <--scrapedFile="c0_s0_Zurich_restaurant.csv"> [--outputFolder="./"] [--startIndex=0]
```
* Arguments inside diamond brackets are mandatory
* Arguments inside square brackets are optional
* The command above (without brackets) scrapes detailed info from the urls on the line index specified (startIndex must be 0 or grater), add adds it to a copy of the scrapedFile **c0_s0_Zurich_restaurant.csv** named **detailed_c0_s0_Zurich_restaurant.csv**

##Python automation
To iterate through all search phrases and cities

###Preparation
Let's say we have a file **cityNames.txt** with city names on each line like so:
```
Zurich                                 <-- this is line index 0
Geneve                                 <-- this is line index 1
.
.
.
```
and a file **searchPhrases.txt** with search phrases on each line like so:
```
bar                                    <-- this is line index 0
pizza                                  <-- this is line index 1
.
.
.
```
###Usage
####First part
```
python auto_ypch_list.py <cityNamesFile> <searchPhrasesFile> <cityStartIndex> <cityEndIndex> <searchPhraseStartIndex> <searchPhraseEndIndex> <outputFolder> [paginationIndex]
```
We can use the python scripts to iterate through combinations of the two input files as follows:
```
python auto_ypch_list.py cityNames.txt searchPhrases.txt 0 19 120 139 ./
```
This command will automate casperjs to iterate though city lines **0** until **19** and searchphrase lines **120** until **139** and puts the results in the current folder, the numbers are inclusive.

```
python auto_ypch_list.py cityNames.txt searchPhrases.txt 0 0 10 10 ./ 100
```
This command will automate casperjs to iterate though 

* the **cityNames.txt** file lines **0** until **0** and 
* the **searchPhrases.txt** lines **10** until **10** (which means only 1 city and 1 search phrase) and 
* starting from the **100**-th **pagination** and puts the results in the current folder.

It is better if you organize your scraping by city names, so we'll have each city results in their own city folder, 
```
python auto_ypch_list.py cityNames.txt searchPhrases.txt 0 0 0 11 Zurich
```
where

* **0 0** means the first line in your **cityNames.txt** file which is Zurich and
* **0 11** is from line **0** to line **11** in your **searchPhrase.txt** file, which means all of them. 

This way you can run on each computer something like this (recommended) if you know that 

* **Zurich** in on line **0**, **Geneve** is on line **1**, etc...
```
python auto_ypch_list.py cityNames.txt searchPhrases.txt 0 0 0 11 Zurich
python auto_ypch_list.py cityNames.txt searchPhrases.txt 1 1 0 11 Geneve
.
.
.
```
* The reason why we use indices is that if something fails you can rescrape only the index range and not the whole thing over again

####Second part (more detailed info)
Let's say we have a folder called **Zurich** which contains all the scraped file for **Zurich** in it 
```
c0_s0_Zurich_restaurant.csv            <-- this is file index 0
c0_s1_Zurich_restaurant.csv            <-- this is file index 1
.
.
.
```

We can use the python script to iterate though each files and pass them to casperjs to do its job.

#####Usage: 
```
python x_ypch_details.py <folder_containing_list_scraped_csv_files> <output_folder> <scraped_file_start_index> <scraped_file_end_index> <fileLineStartIndex>
```
#####Example:
```
python auto_ypch_detailed.py Zurich Zurich/_detailed 0 202 0
python auto_ypch_detailed.py Geneve Geneve/_detailed 1 202 0
.
.
.
```
* If the process stops at a file index, you can restart from that file index by specifying the index number as scraped_file_start_index, this number should be logged in log file or the command prompt
* Keep in mind that this script will overwrite all you existing detailed files from the index you specified

Remarks:

* Use modulating VPNs to reduce the chance you get blocked
* Python is used here to refresh the PhantomJS instances which might crash if ran too long

