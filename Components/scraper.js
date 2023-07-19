const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const Knwl = require('knwl.js');

async function scrapeCompanyInfo(url) {
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

    const $ = cheerio.load(response);

    const companyInfo = {
      phoneNumbers: [],
     // addresses: [],
      emails: []
    };

    const knwlInstance = new Knwl();

    knwlInstance.register('phones', require('knwl.js/default_plugins/phones'));
    knwlInstance.register('emails', require('knwl.js/default_plugins/emails'));

    knwlInstance.init($('body').text());
    
    companyInfo.phoneNumbers = knwlInstance.get('phones');
    //companyInfo.addresses = extractAddresses($);
    companyInfo.emails = knwlInstance.get('emails');

    return companyInfo;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

function extractAddresses($) {
  const addresses = [];
  $('address').each((index, element) => {
    const address = $(element).text().trim();
    addresses.push(address);
  });
  return addresses;
}

module.exports = { scrapeCompanyInfo };