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
      const askEmail = () => {
        rl.question('Enter email address: ', (email) => {
          if (isValidEmail(email)) {
            resolve(email);
            rl.close();
          } else {
            console.log('Invalid email address. Please try again.');
            askEmail();
          }
        });
      };
  
      askEmail();     
    });
  }

  
  module.exports = {promptForEmail};