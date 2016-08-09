var google = require('googleapis');
var auth = require('./googleAuth');
var moodle = require('./moodle');

var calendarId = require('./config.json').googleCalendarId;

var gAuth = null;

auth.authorize(function(auth) {
    gAuth = auth;
    pushCalendar();
});

function insertEvent(event) {
    var calendar = google.calendar('v3');

    delete event.updated;

    calendar.events.insert({
        auth: gAuth,
        calendarId: calendarId,
        resource: event
    }, function(err, response) {
        if (err) {
            console.log('Error while inserting: "' + err + '"');
            return;
        }
    });
}

function patchEvent(event) {
    var calendar = google.calendar('v3');

    delete event.updated;

    calendar.events.patch({
        auth: gAuth,
        calendarId: calendarId,
        eventId: event.id,
        resource: event
    }, function(err, response) {
        if (err) {
            console.log('Error while patching: "' + err + '"');
            return;
        }
    });
}

function decideAction(event) {
    var calendar = google.calendar('v3');

    console.log('Trying to fetch event', event.id, 'from Google Calendar');
    calendar.events.get({
        auth: gAuth,
        calendarId: calendarId,
        eventId: event.id,
        timeZone: 'kolkata/asia'
        // fields: 'summary,updated'
    }, function(err, response) {
        var newEvent = false;
        if (err) {
            console.log('Error while fetching', event.id, ': "' + err + '"');
            console.log('Inserting', event.id, '"' + event.summary + '"');
            insertEvent(event);
        } else {
            if (!(event.updated) ||
                (new Date(response.updated)) < (new Date(event.updated))
            ) {
                console.log('Patching', event.id, '"' + event.summary + '"');
                patchEvent(event);
            } else {
                // Else, do nothing
                console.log('Already up to date', event.id, '"' + event.summary + '"');
            }
        }
    });
}


function updateEvents(events) {
    console.log(events.length + ' events fetched from Moodle');
    for (var i in events) {
        if (events.hasOwnProperty(i)) {
            decideAction(events[i], patchEvent, insertEvent);
        }
    }
}

function pushCalendar() {
    console.log(new Date());
    console.log('Fetching events from Moodle');
    moodle.getEvents(updateEvents);
}
