const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const Knwl = require('knwl.js');

async function fetchPage(url) {
  try {
    const protocol = url.startsWith('https') ? https : http;

    const response = await new Promise((resolve, reject) => {
      protocol.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
        res.on('error', (error) => {
          reject(error);
        });
      });
    });

    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function scrapeCompanyInfo(url) {
  const companyInfo = {
    emails: new Set() // used set to only obtain unique emails
  };
  const $ = cheerio.load(await fetchPage(url));
  const knwlInstance = new Knwl();

  knwlInstance.register('emails', require('knwl.js/default_plugins/emails'));

  knwlInstance.init($.html());

  const emails = knwlInstance.get('emails');
  emails.forEach((email) => {
    companyInfo.emails.add(email.address);
  });
  return [...companyInfo.emails]; // Return the unique emails as an array
}

async function scrapePages(url) {
  const visitedUrls = new Set();
  const scrapedData = new Set();

  const domain = new URL(url).origin;

  async function crawl(url) {
    const targetDomain = new URL(url).origin;
    if (targetDomain !== domain) {
      return;
    }

    if (visitedUrls.has(url)) {
      return;
    }
    console.log(url);
    visitedUrls.add(url);

    const companyInfo = await scrapeCompanyInfo(url); // Call the function to get only the emails
    companyInfo.forEach((email) => {
      scrapedData.add(email);
    });

    const $ = cheerio.load(await fetchPage(url));
    const links = $('a');

    const crawlPromises = links.map(async (index, element) => {
      const href = $(element).attr('href');
      if (href) {
        const absoluteUrl = new URL(href, url).href;
        await crawl(absoluteUrl);
      }
    }).get();

    await Promise.all(crawlPromises);
  }

  await crawl(url);
  return [...scrapedData]; // Return the unique emails as an array
}

module.exports = { scrapePages };
