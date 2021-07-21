var express = require('express');
var path = require('path');
require('dotenv').config({ silent: true });
var app = express();

const IamAuthenticator = require('ibm-watson/auth').IamAuthenticator;
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');

const languageTranslator = new LanguageTranslatorV3({
  authenticator: new IamAuthenticator({ apikey: process.env.LANGUAGE_TRANSLATOR_API_KEY }),
  version: '2018-05-01'
});

const ibmClient = new TextToSpeechV1({
    authenticator: new IamAuthenticator({ apikey: process.env.TEXT_TO_SPEECH_API_KEY }),
    version: '2020-04-01'
});

app.use(express.static(path.join(__dirname, 'public')));

// viewed at http://localhost:3000
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/api/translate', async (_, res, next) => {
  try {
    if (languageTranslator) {
      const { result } = await languageTranslator.listLanguages();
      return res.json(result);
    } else {
      return res.json(
        { languages: [
          { language: '',
            language_name: '',
          }]
        });
    }
  } catch (err) {
    console.error(err);
    if (!client) {
      err.statusCode = 401;
      err.description = 'no se pueden encontrar credenciales validas para el servicio de IBM.';
      err.title = 'Credenciales Invalidad';
    }
    next(err);
  }
});

app.get('/api/voces', async (_, res, next) => {
    try {
      if (ibmClient) {
        const { result } = await ibmClient.listVoices();
        return res.json(result);
      } else {
        // Return Allison for testing and user still gets creds pop-up.
        return res.json(
          { voices: [
            { name: 'es-ES_EnriqueV3Voice',
              description: 'Enrique: American English female voice. Dnn technology.',
            }]
          });
      }
    } catch (err) {
      console.error(err);
      if (!client) {
        err.statusCode = 401;
        err.description = 'no se pueden encontrar credenciales validas para el servicio de IBM.';
        err.title = 'Credenciales Invalidad';
      }
      next(err);
    }
  });

  
  app.get('/api/v3/translate', async (req, res) => {
    const inputText = req.query.text;
  
    const ltParams = {
      text: inputText,
      source: req.query.source, // substring(0, 2),
      target: req.query.voice // substring(0, 2)
    };
  
    const doTranslate = ltParams.source !== ltParams.target;
  
    try {
      // Use language translator only when source language is not equal target language
      if (doTranslate) {
        const ltResult = await languageTranslator.translate(ltParams);
        req.query.text = ltResult.result.translations[0].translation;
      } else {
        // Same language, skip LT, use input text.
        req.query.text = inputText;
      }
      console.log('TRANSLATED ONLY:', 'Español', ' --->', 'Francés', '--->', 'Portugués'); // getJSON
      // console.log('TRANSLATED:', inputText, ' --->', req.query.text);
      // return
      res.json({ 
        trans: [ 
          { 
            // translated: 'TRANSLATED ONLY: Español ---> Francés ---> Portugués'
            translated: req.query.text
          }]
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  });

/** 
app.get('/api/v3/translate', async (req, res, next) => {
  try {
    const { result } = await languageTranslator.translate(req.query);
    result.pipe(res);
  } catch (err) {
    console.error(err);
    if (!languageTranslator) {
      err.statusCode = 401;
      err.description = 'no se pueden encontrar credenciales validas para el servicio de IBM.';
      err.title = 'Credenciales Invalidad';
    }
    next(err);
  }
}); **/


app.get('/api/sintetizar', async (req, res, next) => {
    try {
      const { result } = await ibmClient.synthesize(req.query);
      result.pipe(res);
    } catch (err) {
      console.error(err);
      if (!ibmClient) {
        err.statusCode = 401;
        err.description = 'no se pueden encontrar credenciales validas para el servicio de IBM.';
        err.title = 'Credenciales Invalidad';
      }
      next(err);
    }
});

require('./error-handler')(app);

module.exports = app;