# WebScraper
This is a Node.js console based web-scraper. Enter an Email Address to begin scraping

Improvements/ Caveats:
  - Address scraping:
    Currently this works by selecting all the text in the parent container that the postcode is found in. As a filtering step if the text in
    this container exceeds 100 characters then just the postcode is used in the final output. This is to prevent other irrelevant text being
    outputted. This design choice was made due to limitations with the earlier method of Address scraping and this was found to be more
    reliable at providing relevant data.
  - Puppeteer:
    Using Puppeteer is not the most efficient way of obtaining Google Search results due to the use of 'headless' browsers. However it was        the simplest and most readable approach for use in this context. This allowed me to focus more time on the scraping logic and in future
    attempts a different method of obtaining Google Search results should be used.
  - Crawling Logic:
    An improvement to this would be saving the URL's in a queue and scraping them one by one down the list instead of the method used within
    this code. This would improve efficiency of the application overall.
