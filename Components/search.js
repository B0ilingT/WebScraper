const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function searchGoogle(email) {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(email)}`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(searchUrl);

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const searchResults = [];

    $('div.g').each((index, element) => {
      const header = $(element).find('h3').text();
      const url = $(element).find('a').attr('href');
      if (header && url) {
        searchResults.push({ header, url });
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
  return ''; // Return an empty string if the domain couldn't be extracted
}

module.exports = { searchGoogle, extractDomain };