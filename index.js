const {promptForEmail} = require('./Components/prompts');
const {searchGoogle, extractDomain} = require('./Components/search');


promptForEmail()
  .then(async (email) => {
    console.log('Entered email:', email);
    const results = await searchGoogle(email);
    const domain = extractDomain(email);
    console.log(domain);
    console.log(results);
  })
  .catch((error) => {
    console.error('Error:', error);
  });