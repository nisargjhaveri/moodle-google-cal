var google = require('googleapis');
var auth = require('./googleAuth');

var gAuth = null;

auth.authorize(function(auth) {
    gAuth = auth;
    listCalendars();
});

/**
 * Lists available calendars with their IDs
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listCalendars() {
  var calendar = google.calendar('v3');
  calendar.calendarList.list({
    auth: gAuth,
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    for (var i in response.items) {
        var cal = response.items[i];
        console.log('ID:', cal.id);
        console.log('Name:', cal.summary);
        console.log('AccessRole:', cal.accessRole);
        console.log('---');
    }
  });
}
