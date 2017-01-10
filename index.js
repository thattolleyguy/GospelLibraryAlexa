/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

/**
 * TODO:
 * Add Bible
 * Figure out how to add general conference - use database
 * Clean up code
 * Support amazon built in intents
 * Play previous/next chapter
 *
 */

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();
var table = "GospelLibraryBookInfo";

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event" + JSON.stringify(event));
        console.log("context:" + JSON.stringify(context));
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({
                requestId: event.request.requestId
            }, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    var handlers = {
      "PlayTalk": playTalk
      ,"ReadScripture": readScripture
      ,"AMAZON.PauseIntent": pausePlayback
      ,"AMAZON.ResumeIntent": resumePlayback
      ,"AMAZON.HelpIntent": (i, s, callback) => getWelcomeResponse(callback)
      ,"AMAZON.StopIntent": (i, s, callback) => handleSessionEndRequest(callback)
      ,"AMAZON.CancelIntent": (i, s, callback) => handleSessionEndRequest(callback)
    }
    console.log("Request for "+intentName)
    if (handlers[intentName] !== undefined) {
      handlers[intentName](intent, session, callback)
    } else {
      // Unhandled Intent
      unhandledIntent(intent, session, callback)
    }
}

var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function playTalk(intent, session, callback) {
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var requestedDate = new Date();
    if(intent.slots.conferenceDate !== undefined && intent.slots.conferenceDate.value !== undefined){
        console.log(`Requested date is ${intent.slots.conferenceDate.value}`);
        requestedDate = new Date(intent.slots.conferenceDate.value);
    }
    var conferenceDate = getMostRecentGeneralConferenceDate(requestedDate);
    var speechOutput = `Playing talk by ${intent.slots.speaker.value} from ${monthNames[conferenceDate.getMonth()]} ${conferenceDate.getFullYear()}`;

    //TODO: Query out for what talks are available in selected conference from speaker. If more than one, then pick one or list the titles and ask the user to pick one.
    // If only one, then just play

    callback(sessionAttributes,
        buildSpeechletResponse("Play talk", speechOutput, repromptText, true));
}

function getMostRecentGeneralConferenceDate(date){
    console.log(`Finding conference for ${date}`)
    if(date === undefined)
        date = new Date();
    var month = date.getUTCMonth();
    var year = date.getUTCFullYear();
    if(month<3)
        year = year - 1;
    month = (month+9)%12;
    if(month<6)
        month=3;
    else month = 9;
    return new Date(year, month);
}

function readScripture(intent, session, callback) {
    var cardTitle = intent.name;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var book = intent.slots.Book.value;
    console.log(JSON.stringify(intent.slots));
    var params = {
        TableName: table,
        Key: {
            "bookName": book.toLowerCase()
        }
    };
    console.log("Attempting to load book " + book.toLowerCase());
    docClient.get(params, function (err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            callback(sessionAttributes, buildSpeechletResponse("Book not found", book + " does not exist", "", true));

        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            var bookInfo = data.Item;


            var speechOutput = "Reading " + book;

            // Pad chapter number with zeros
            var chapter = 0;
            var chapterString = "";
            if (intent.slots.Chapter.hasOwnProperty('value'))
                chapter = parseInt(intent.slots.Chapter.value);

            // Does this book even have chapters? If not we skip chapter logic
            if (bookInfo.chapters) {
                // Was a chapter specified
                if (chapter > 0) {
                    // If a chapter was specified but it's higher than the books chapters, report that it wasn't found
                    if (bookInfo.chapters < chapter) {
                        callback(sessionAttributes, buildSpeechletResponse("Chapter Not Found", "Chapter " + chapter + " of " + book + " does not exist", "", true));
                        return;
                    }
                } else {
                    // If the book has chapters, but no chapter was specified (chapter==0) then set chapter to 1
                    chapter = 1;
                }
                chapterString = "-" + padString(chapter, 2);
                var pronunciation = bookInfo.pronunciation || book;
                speechOutput = "<speak>Reading chapter " + chapter + " of " + pronunciation + "</speak>";
            }



            // Pad file number with zeros
            var fileNumber = "";
            if (bookInfo.hasOwnProperty('fileNumberPadding'))
                fileNumber = padString(bookInfo.start + chapter, bookInfo.fileNumberPadding);
            else
                fileNumber = padString(bookInfo.start + chapter, 3);


            var url = "https://s3.amazonaws.com/alexagospellibraryskill/scriptures/" + bookInfo.prefix + fileNumber + "-" + bookInfo.fileName + chapterString + "-64k-eng.mp3";
            console.log(url);
            sessionAttributes.currentlyPlaying=url;

            callback(sessionAttributes,
                buildPlaybackSSMLResponse(cardTitle, speechOutput, "", url, "AudioPlayer.Play", true));
        }
    });
}

function padString(val, length) {
    val = val + "";
    while (val.length < length) val = "0" + val;
    return val;
}

function pausePlayback(intent, session, callback) {
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    var url = "";


    speechOutput = "Talk paused";
    repromptText = "Talk paused";


    callback(sessionAttributes,
        buildPlaybackResponse(cardTitle, speechOutput, repromptText, url, "AudioPlayer.Stop", shouldEndSession));
}

function resumePlayback(intent, session, callback) {
    var cardTitle = intent.name;
    var repromptText = "";
    var shouldEndSession = true;
    var speechOutput = "";
    var url = session.sessionAttributes.currentlyPlaying;


    speechOutput = "Talk resumed";
    repromptText = "Talk resumed";


    callback(sessionAttributes,
        buildPlaybackResponse(cardTitle, speechOutput, repromptText, url, "AudioPlayer.Play", shouldEndSession));
}

function unhandledIntent(intent, session, callback) {
  var cardTitle = "Unhandled: "+intent.name
  var speechOutput = "Sorry, I can't do that."
  var repromptText = "What would you like to do?"
  var shouldEndSession = false
  callback(session.sessionAttributes,
    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession))
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to the Gospel Library Alexa Skill. What would you like to do?"
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "You can read scripture or play a talk. So, What would you like to do?";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "Thank you for trying the Alexa Skills Kit sample. Have a nice day!";
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildPlaybackResponse(title, output, repromptText, url, directiveType, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        directives: [{
            type: directiveType,
            playBehavior: "REPLACE_ALL",
            audioItem: {
                stream: {
                    url: url,
                    offsetInMilliseconds: 0,
                    token: "Ihaveatoken"
                }
            }
        }],
        shouldEndSession: shouldEndSession
    };
}

function buildPlaybackSSMLResponse(title, output, repromptText, url, directiveType, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        directives: [{
            type: directiveType,
            playBehavior: "REPLACE_ALL",
            audioItem: {
                stream: {
                    url: url,
                    offsetInMilliseconds: 0,
                    token: "Ihaveatoken"
                }
            }
        }],
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
