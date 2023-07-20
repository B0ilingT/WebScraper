const {promptForEmail} = require('./Components/prompts');
const {searchGoogle} = require('./Components/search');
const {scrapePages} = require('./Components/scraper');


promptForEmail()
  .then(async (email) => {
    console.log('Entered email:', email);
    const results = await searchGoogle(email);
    console.log(results[0].url);
    const info = await scrapePages(results[0].url);
    console.log(info);
  })
  .catch((error) => {
    console.error('Error:', error);
  });