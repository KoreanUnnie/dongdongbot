var express = require('express');
var request = require('request-promise');
var router = express.Router();
var path = require('path');
const uuidv3 = require('uuid/v3');
const projectId = process.env.GOOGLE_PROJECT_ID;

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

/******************************
 *          route             *
 ******************************/

// Home Keyboard API
router.get('/keyboard', function(req, res, next){
	var resultObject = new Object();
	resultObject.type = "text";
	res.json(resultObject);
});

router.post('/message', async function(req, res, next){
	var user_key = req.body.user_key;
	var type = req.body.type;
	var content = req.body.content;
	const re = /[\u3131-\uD79D]/ugi;
	const hasKoreanTXT = content.match(re);
	const languageCode = hasKoreanTXT? 'ko-KR': 'en-US';
	const sessionId = uuidv3(user_key, process.env.APP_NAMESPACE);
	var resultObject = new Object();
	var messageObject = new Object();

	// if(hasKoreanTXT){
	// 	//need to translate to english
	// 	const value = await translateText({from:'ko', to: 'en', text:content});
	// 	content = value.message.result.translatedText;
	// }
	// Define session path
	const sessionPath = sessionClient.sessionPath(projectId, sessionId);

	// The text query request.
	const request = {
	  session: sessionPath,
	  queryInput: {
	    text: {
	      text: content,
	      languageCode: languageCode,
	    },
	  },
	};

	// Send request and log result
	sessionClient
	  .detectIntent(request)
	  .then(async function (responses){
	    const result = responses[0].queryResult;
			messageObject.text = result.fulfillmentText;
			resultObject.message = messageObject;
			// console.log('result', result)
			// if(hasKoreanTXT){
			// 	//translate back to korean
			// 	const value = await translateText({from:'en', to: 'ko', text:result.fulfillmentText});
			// 	messageObject.text = value.message.result.translatedText;
			// 	console.log('fromEnglishToKorean', content);

			// }
			res.json(resultObject);
	  })
	  .catch(err => {
			console.log('session client error', err)
	  });
});


router.post('/friend', function(req, res, next){
	var user_key = req.body.user_key;

	res.send("SUCCESS");
});

router.delete('/friend/:user_key', function(req, res, next){
	var user_key = req.params.user_key;

	res.send("SUCCESS");
});

router.delete('/chat_room/:user_key', function(req, res, next){
	var user_key = req.params.user_key;

	res.send("SUCCESS");
});

async function translateText({from, to, text}){
	let result;
	try {
		result = await request({
			url: "https://openapi.naver.com/v1/papago/n2mt",
			method: "POST",
			json: true,   // <--Very important!!!
			body: {
				"source": from,
				"target": to,
				"text": text
			},
			headers: {
				'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
				'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET

			}
	});
		return result;
	}
	catch (error) {
		return error;
	}
}
module.exports = router;
