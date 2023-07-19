const promptForEmail = require('./Components/emailPrompt');

promptForEmail()
  .then((email) => {
    console.log('Email address:', email);
  })
  .catch((error) => {
    console.error('Error:', error);
  });