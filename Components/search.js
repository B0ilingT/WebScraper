const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function searchGoogle(email) { // I know this isnt strictly neccesary but it is now used as a check for http or https and because Google returns dynamic code depending on device
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(email)}`;

    const browser = await puppeteer.launch({ headless: "new" }); // this is slower than other methods but is used for reasons stated earlier
    const page = await browser.newPage();
    await page.goto(searchUrl);

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const domain = extractDomain(email);

    const searchResults = [];

    $('div.g').each((index, element) => {
      const header = $(element).find('h3').text();
      const url = $(element).find('a').attr('href');
      if (header && url && url.includes(domain)) {
        searchResults.push({header, url});
      }
    });

    return searchResults;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

function extractDomain(email) {
  const regex = /@([^\s@]+)$/; // Regular expression to match the domain after the @ symbol
  const match = email.match(regex);
  if (match && match.length > 1) {
    return match[1]; // Return the domain part of the email
  }
  return ''; 
}

module.exports = {searchGoogle};