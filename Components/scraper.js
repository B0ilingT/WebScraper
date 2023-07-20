const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const Knwl = require('knwl.js');
const numbersToCheck = require('./numbersToCheck.json');


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

function scrapePhoneNumbers(knwlInstance, companyInfo)  {
  const phones = knwlInstance.get('phones');
  phones.forEach((phone) => {
    if (phone.number.startsWith('+44')) {
      const replacedNumber = phone.number.replace(/^\+44/, '0');
      // Check if the replaced number starts with '07' or is included in numbersToCheck
      const isNumberValid = replacedNumber.startsWith('07') || numbersToCheck.some((num) => replacedNumber.includes(num.number));

      if (isNumberValid) {
        companyInfo.phoneNumbers.add(replacedNumber);
      }     
    }
  });
  return companyInfo.phoneNumbers;
}

function scrapeEmails(knwlInstance, companyInfo) {
  const emails = knwlInstance.get('emails');
  emails.forEach((email) => {
    companyInfo.emails.add(email.address);
  });
  return companyInfo.emails;
}


function scrapeAddresses($, companyInfo) {
  const addrRegex = /([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/;
  
  $('span, div').each((index, element) => {
    const text = $(element).text();
    const matches = text.match(addrRegex);
    
    if (matches) {
      matches.forEach((match) => {
        if (match) {
          const postcodeIndex = text.indexOf(match);
          let addressStartIndex = postcodeIndex;
          let comma = false;
          let space = 0;
          
          for (let i = postcodeIndex - 1; i >= 0; i--) { // I know this isn't the most efficient way of doing this. A better way for recognising addresses may be needed
            if (text[i] === ' ' && space === 1 || text[i] === '' && space === 1) {
              addressStartIndex = i + 1;
              break;
            }
            if (text[i] === ' ' && comma === true) {
              space++;
            } else if (text[i] === ',') {
              comma = true;
            }
          }
          
          const addressText = text.substring(addressStartIndex, postcodeIndex);
  
          // Check if a longer version is already present in the set
          let isShorterVersion = false;
          for (const address of companyInfo.addresses) {
            if (address.includes(match) && address.length > match.length) {
              isShorterVersion = true;
              break;
            }
          }
  
          if (!isShorterVersion) {
            companyInfo.addresses.add(addressText + match);
          }
        }
      });
    }
  });
  return companyInfo.addresses;
}

async function scrapeCompanyInfo(url) {
  const companyInfo = {
    emails: new Set(), // used set to only obtain unique data points
    phoneNumbers: new Set(),
    addresses: new Set()
  };
  const $ = cheerio.load(await fetchPage(url));
  const knwlInstance = new Knwl();

  knwlInstance.register('emails', require('knwl.js/default_plugins/emails'));
  knwlInstance.register('phones', require('knwl.js/experimental_plugins/internationalPhones'));

  knwlInstance.init($.html());

  companyInfo.addresses = scrapeAddresses($,companyInfo);
  companyInfo.phoneNumbers = scrapePhoneNumbers(knwlInstance, companyInfo); 
  companyInfo.emails = scrapeEmails(knwlInstance, companyInfo); 
  
  return {
    emails: [...companyInfo.emails],
    phoneNumbers: [...companyInfo.phoneNumbers],
    addresses: [...companyInfo.addresses]
  };
}

async function scrapePages(url) { // change this to find all websites and then scrape
  const visitedUrls = new Set();

  const scrapedData = {
    emails: new Set(),
    phoneNumbers: new Set(),
    addresses: new Set()
  };

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

    const companyInfo = await scrapeCompanyInfo(url);

    companyInfo.emails.forEach((email) => {
      scrapedData.emails.add(email);
    });
    companyInfo.phoneNumbers.forEach((phone) => {
      scrapedData.phoneNumbers.add(phone);
    });
    companyInfo.addresses.forEach((address) => {
      scrapedData.addresses.add(address);
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
  return scrapedData; // Return the unique data
}

module.exports = {scrapePages};