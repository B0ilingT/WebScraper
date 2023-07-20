const {promptForEmail} = require('./Components/prompts');
const {searchGoogle} = require('./Components/search');
const {scrapePages} = require('./Components/scraper');
const retry = false;

promptForEmail()
  .then(async (email) => {
    const results = await searchGoogle(email);
    console.log("Found Website:",results[0]);
    const info = await scrapePages(results[0].url);
    console.log(info);
  })
  .catch(async(error) => { 
    console.error('Error:', error);
    if (error.code === 'ECONNRESET' && retry === false){ //this isnt the correct way to access the ECONNRESET error code
      retry = true;
      console.log("Retrying Scraping...") 
      const info = await scrapePages(results[0].url);
      console.log(info);  
    }
  });