var ghpages = require('gh-pages'),
    path = require('path');

ghpages.publish(__dirname, function (err) {
   if (err) console.error(err);
   else console.log('Successfully deployed to gh-pages');
});
