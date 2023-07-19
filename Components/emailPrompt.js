const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function promptForEmail() {
  return new Promise((resolve, reject) => {
    rl.question('Enter email address to scrape: ', (email) => {
      if (isValidEmail(email)) {
        resolve(email);
      } else {
        reject('Invalid email address. Please try again.');
      }
      rl.close();
    });
  });
}

module.exports = promptForEmail;