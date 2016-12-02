# GospelLibraryAlexa
Gospel Library for Alexa

This is a work in progress. I'm adding a quick synopsis of how this works so others can try it out, but more detailed info will follow. Currently, I host all the content on S3 and you're welcome to make use of it. In order to set up the app yourself you'll need to do the following.

* Run the dynamoloader.js script under utils to populate a table "GospelLibraryBookInfo" in your own dynamodb instance. This provides the metadata for validating requests and building the urls for playback.

* Create a lambda (with permissions to access your dynamo table) and upload the index.js code to that.

* Create an Alexa skill pointed at your lambda. Make sure to check yes to "Audio Player". Using the files in the speech assets folder, add the sample utterances, intent schema and the custom slot values for SCRIPTURE_BOOK slot type.

That should get you up and running. These instructions may be incomplete so feel free to reach out and ask for help if you need it.

