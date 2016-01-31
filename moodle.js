var ical = require('ical');
var config = require('./config.json');

var prefixes = config.categoryPrefixes;
var calURL = config.moodleCalendarURL;

function parseDate(icalStr)  {
    // icalStr = '20110914T184000Z'
    var strYear = icalStr.substr(0, 4);
    var strMonth = parseInt(icalStr.substr(4, 2), 10) - 1;
    var strDay = icalStr.substr(6, 2);
    var strHour = icalStr.substr(9, 2);
    var strMin = icalStr.substr(11, 2);
    var strSec = icalStr.substr(13, 2);

    var oDate =  new Date(Date.UTC(strYear,strMonth, strDay, strHour, strMin, strSec));

    return oDate;
}

function convertEvent(event) {
    var googleEvent = {};

    googleEvent.id = event.uid.split('@')[0] + 'frommoodleiiit';

    googleEvent.summary = event.summary.trim();
    googleEvent.description = event.description;
    if (event['last-modified']) {
        googleEvent.updated = parseDate(event['last-modified']);
    }
    googleEvent.start = googleEvent.end = {
        dateTime: event.start.toISOString()
    };
    if (event.end) {
        googleEvent.end = {
            dateTime: event.end.toISOString()
        };
    }

    if (event.categories) {
        googleEvent.description += '\n\ncategories: ' + event.categories.toString();
        if (event.categories[0] in prefixes) {
            googleEvent.summary = '[' + prefixes[event.categories[0]] + '] ' + googleEvent.summary;
        }
    }

    return googleEvent;
}

function getEvents(callback) {
    ical.fromURL(calURL, {
        'proxy': ''
    }, function(err, events) {
        if (!err) {
            var googleEvents = [];
            for (var event in events) {
                if (events.hasOwnProperty(event)) {
                    googleEvents.push(convertEvent(events[event]));
                }
            }
            if (typeof(callback) === 'function') {
                callback(googleEvents);
            }
        }
    });
}

// getEvents();

module.exports.getEvents = getEvents;
