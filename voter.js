'use strict';

var Browser = require('zombie');

function Vote(job, cb) {
  var browser = Browser.create();
  browser.silent = true;

  browser.on('error', function(err) {
    cb(new Error(err));
  });

  process.once('uncaughtException', function(err) {
    cb(new Error(err));
  });

  browser.visit('http://hottest100.triplej.net.au/shortlist/add', function() {
    job.progress(15, 100);
    browser.wait(30, function() {
      browser.fill('artist[]', 'Taylor Swift')
      .fill('track[]', 'Shake It Off')
      .pressButton('Add to shortlist', function(err) {
        job.progress(30, 100);

        function gotConfirm() {
          return window.document.querySelector('a.confirm');
        }

        browser.wait(gotConfirm, function() {
          function trackVoted() {
            return window.document.querySelector('div.shortlist-block .shortlist .item.checked .confirm');
          }

          browser.clickLink('a.confirm');
          job.progress(45, 100);

          browser.wait(trackVoted, function() {
            browser.clickLink('a[href="http://hottest100.triplej.net.au/vote/index"]', function() {
              job.progress(65, 100);
              browser.wait(30, function(){
                browser.visit('http://hottest100.triplej.net.au/vote/index', function() {
                  console.log(browser.evaluate('window.location.href'));
                  job.progress(80, 100);
                  browser.fill('#firstname', job.data.firstName)
                  .fill('#lastname', job.data.lastName)
                  .fill('#email', job.data.emailAddress);
                  job.progress(95, 100);

                  browser.wait(30, function() {
                    browser.pressButton('button.submit');
                    job.progress(100, 100);
                    cb();
                  });
                });
              })
            });
          });
        });
      });
    });
  });
}

module.exports = Vote;
