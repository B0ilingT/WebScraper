const { promptForURL, promptForEmail } = require('./Components/prompts');

promptForURL()
  .then((url) => {
    console.log('URL:', url);
    return promptForEmail()
      .then((email) => {
        console.log('Email address:', email);
      });
  })
  .catch((error) => {
    console.error('Error:', error);
  });