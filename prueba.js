require('dotenv').config({ silent: true });
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const fs = require('fs');
const IamAuthenticator = require('ibm-watson/auth').IamAuthenticator;

const file_name = "hola_mundo.mp3"

// IBM Cloud Autenticacion.
const textToSpeech = new TextToSpeechV1({
    authenticator: new IamAuthenticator({ apikey: process.env.TEXT_TO_SPEECH_API_KEY }),
    version: '2020-04-01'
});

// opciones de sintetizado
const synthesizeParams = {
    text: 'Que tal Moises, bienvenido. Puedo traducir casi cualquier texto a voz.',
    accept: 'audio/mp3', // los diferentes formatos https://cloud.ibm.com/apidocs/text-to-speech#getsynthesize
    voice: 'es-ES_EnriqueV3Voice', // las diferentes voces https://cloud.ibm.com/apidocs/text-to-speech#getsynthesize
};

// crear el archivo de texto ejecutando el servicio cognitivo de IBM
textToSpeech
    .synthesize(synthesizeParams)// sintetiza todo el exto
    .then(response => {
        // borrar archivo si existe.
        if (fs.existsSync(file_name)) {
            fs.unlinkSync(file_name)
        }
        // crear el archivo de .mp3
        const audio = response.result;
        audio.pipe(fs.createWriteStream(file_name));

    })
    .catch(err => {
        console.log('error:', err);
    });