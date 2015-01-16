'use strict';
var $ = require('jquerygo');

var Browser = require('zombie');
var chalk = require('chalk');

function Vote(job, cb) {
  $.config.addJquery = false;

  process.once('uncaughtException', function(err) {
    console.log(err);
    cb(new Error(err));
  });

  function showProgress(msg) {
    console.log(chalk.green('['+job.data.firstName+' '+job.data.lastName+'] ') + msg);
  };

  $.reset(function() {
    $.viewportSizeSet = false;
    $.visit('http://hottest100.triplej.net.au/shortlist/add', addTrack);
  });

  function addTrack() {
    job.progress(25, 100);
    //$.capture(__dirname + '/25.png');
    $('input[ng-model="artistQuery"]').val('Taylor Swift', function() {
      showProgress('Filled Artist');
      $('input[ng-model="trackQuery"]').val('Shake It Off', function() {
        showProgress('Filled Track');
        $('button.submit').click(afterTrackAdd);
      });
    });
  };

  function afterTrackAdd() {
    showProgress('Track added');
    $.waitForPage(function(){
    job.progress(50, 100);
      //$.capture(__dirname + '/50.png');
      $.getPage(function(page) {
        page.evaluate(function(){
          return angular.element($('a.confirm')).triggerHandler('click');
        }, function() {
          showProgress('Voted for track');
          $.waitForElement('a.submit-votes:not(.submitdisabled)', function() {
            $.getPage(function(page) {
              showProgress('Submitting vote');
              page.open('http://hottest100.triplej.net.au/vote/index', afterVoting);
            });
            //$.visit('http://hottest100.triplej.net.au/vote/index', afterVoting);
            //$('a.submit-votes').click(afterVoting);
          });
          //$.waitForElement('div.shortlist-block .shortlist .item.checked .confirm', function() {
            //$.getPage(function(page) {
              //page.open('https://hottest100.triplej.net.au/vote/index', function() {
                //return true;
              //});
            //}, afterVoting);
          //});
        });
      });
    });
  };

  function afterVoting() {
    //$.visit('https://hottest100.triplej.net.au/vote/index', function() {
    $.waitForPage(function() {
      job.progress(75,100);
      //$.capture(__dirname + '/75.png');
      showProgress('Loading "Your Details" page');
      $('input#firstname').val(job.data.firstName, function() {
        showProgress('Filled first name');
        $('input#lastname').val(job.data.lastName, function() {
          showProgress('Filled last name');
          $('input#email').val(job.data.emailAddress, function() {
            showProgress('Filled email');
            $('form').submit(afterSubmit);
          });
        });
      });
    });
  };

  function afterSubmit() {
    $.waitForPage(function() {
      showProgress('Process complete');
      cb();
    });
  };

  //browser.visit('http://hottest100.triplej.net.au/shortlist/add', function() {
    //job.progress(15, 100);
    //browser.wait(30000, function() {
      //browser.fill('artist[]', 'Taylor Swift')
      //.fill('track[]', 'Shake It Off')
      //.pressButton('Add to shortlist', function(err) {
        //job.progress(30, 100);

        //browser.wait(30000, function() {
          //browser.clickLink('a[title="confirm Shake It Off by Taylor Swift track"]');
          //job.progress(45, 100);

          //browser.wait(30000, function() {
            //browser.clickLink('a[href="http://hottest100.triplej.net.au/vote/index"]', function() {
              //job.progress(65, 100);
              //browser.wait(30000, function(){
                //job.progress(80, 100);

                //browser.fill('#firstname', job.data.firstName)
                //.fill('#lastname', job.data.lastName)
                //.fill('#email', job.data.emailAddress);

                //job.progress(95, 100);

                //browser.wait(30000, function() {
                  //browser.pressButton('button.submit');
                  //job.progress(100, 100);
                  //cb();
                //});
              //});
            //});
          //});
        //});
      //});
    //});
  //});
}

module.exports = Vote;
