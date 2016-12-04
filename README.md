# GospelLibraryAlexa
Gospel Library for Alexa

This is a work in progress. I'm adding a quick synopsis of how this works so others can try it out, but more detailed info will follow. Currently, I host all the content on S3 and you're welcome to make use of it. In order to set up the app yourself you'll need to do the following.

## Create a Dynamodb Table

Create a [Dynamodb](https://aws.amazon.com/dynamodb/) table and then populate it by running the dynamoloader.js script under utils to populate a table "GospelLibraryBookInfo" with a partition key of "bookName" in your own dynamodb instance. This provides the metadata for validating requests and building the urls for playback.

Some background tips for getting started with node and [aws-skd](https://aws.amazon.com/sdk-for-node-js/) that may help with the dynamoloader script:

- If you haven't installed node, install [node.js](https://nodejs.org/en/download/).
- Once node is installed, make sure you have the aws-sdk node module installed: `npm install -g aws-sdk`
- If it still doesn't work, `export NODE_PATH=/usr/local/lib/node_modules` will allow global node modules to be accessed everywhere.
change `~/.aws.credentials` to include 

```
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
```

## Create a Lambda
Create a [lambda](https://aws.amazon.com/lambda/) (with a role that has permissions to access your dynamo table), choose the blank skill function, and upload the index.js code to that. Node.js 4.3 should be the runtime.

## Create an Alexa Skill
Create an [Alexa Skill](https://developer.amazon.com/alexa-skills-kit) pointed at your lambda. Make sure to check yes to "Audio Player". Using the files in the speech assets folder, add the sample utterances, intent schema and the custom slot values for SCRIPTURE_BOOK slot type.

That should get you up and running. These instructions may be incomplete so feel free to reach out and ask for help if you need it.
oad by itself?

