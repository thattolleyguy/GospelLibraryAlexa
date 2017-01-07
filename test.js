var gospel = require("./index.js")
const appId = gospel.appId || "no-application-id"

//// Helpers
// Each test case is when(intent, inputEvent).then(validationFunction)
var when = function(intent, slots) {
  var event = baseEvent;
  if (intent === "LaunchRequest" || intent === "SessionEndedRequest") {
    event.request = {type: intent, requestId: "request00"}
  } else {
    event.request = {type: "IntentRequest", requestId: "request01"
      , intent: {name: intent, slots: slots}}
  }
  return new Promise((resolve, reject) => {
    gospel.handler(event,
      {fail: (err) => reject(err), succeed: (a) => resolve(a)}
      , report)
    })
}

var baseEvent = {
  session: {
    application: {applicationId: appId}
    , user: {userId: "mormon1830"}
    , new: true }
  , request: {type: "LaunchRequest", requestId: "request00"}
}

var report = (err, data) => {
  if (err) {console.error("ERR: "+err)}
  else {console.log("OUT: "+JSON.stringify(data))}
}

var listResponse =
  (reply) => console.log("\n******\n"+JSON.stringify(reply, undefined, 2))

var responseHas = (propName) =>
  function(reply) {
    if (reply.response[propName] !== undefined) {return Promise.resolve(reply)}
    else {
      var message = "FAIL: Missing field '"+propName+"' in response."+
        "\n" + JSON.stringify(reply, undefined, 2)
      return Promise.reject(message)}
  }

//// test cases
// New Session, Launch Request
when("LaunchRequest", baseEvent)
.then(responseHas("card"))
.catch(report)

// HelpIntent
when("AMAZON.HelpIntent")
.then(responseHas("card"))
.catch(report)

// PauseIntent
when("AMAZON.PauseIntent")
.then(responseHas("directives"))
.catch(report)

// ResumeIntent
// -- this test system doesn't have AudioPlayer support
when("AMAZON.ResumeIntent")
.then(listResponse)
.catch(report)

// StopIntent
when("AMAZON.StopIntent")
.then(responseHas("card"))
.catch(report)

// CancelIntent
when("AMAZON.CancelIntent")
.then(responseHas("card"))
.catch(report)

// PlayTalk
when("PlayTalk")
.then(responseHas("directives"))
.catch(report)

// ReadScripture
when("ReadScripture", {Book: {name: "Book", value: "Helaman"}})
.then(function(reply) {
  if (reply.response.outputSpeech.text === "Reading Helaman") {
    return Promise.resolve(reply)
  } else {
    var message = reply.response.outputSpeech.text+
      "\n"+JSON.stringify(reply, undefined, 2)
    return Promise.reject(message)
  }
})
.catch(report)
