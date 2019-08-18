'use strict';

import * as fs from 'fs';
import * as path from 'path'; // for path
import * as needle from 'needle';
import * as md5 from 'md5';
const uuidv4 = require('uuid/v4');
import * as vscode from 'vscode'; 
import { Languages } from "./languages";
import { Utilities } from "./utilities";

export class AzureCognitiveClient {
   private outputChannel: vscode.OutputChannel;

  private AZ_COG_SPEECH_TOKEN_ENDPOINT="https://{0}.api.cognitive.microsoft.com/sts/v1.0/issueToken";
  private AZ_COG_SPEECH_TTS_ENDPOINT="https://{0}.tts.speech.microsoft.com/cognitiveservices/v1";
  private AZ_COG_TRANSLATE_ENDPOINT="https://api.cognitive.microsofttranslator.com/translate";

  private subKeySpeech: string;
  private regionSpeechApi: string;
  private subKeyTranslator: string;
  private token: string;
  private tokenExpirationDate: number;
  private storageDirectory: string;

  /**
   * Audio Outputs
   * For supported format, see
   * https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#audio-outputs
   */
  private AUDIO_OUTPUT_FORMAT = 'riff-24khz-16bit-mono-pcm';


  /**
   * @constructor
   * @param subKeyTranslator 
   * @param subKeySpeech 
   * @param regionSpeechAPi 
   * @param storageDirectory 
   */
  constructor(subKeyTranslator: string, subKeySpeech: string, regionSpeechAPi: string, storageDirectory: string) {
    this.outputChannel = vscode.window.createOutputChannel('TranslatorVoice');

    this.subKeyTranslator = subKeyTranslator;
    this.subKeySpeech = subKeySpeech;
    this.regionSpeechApi = regionSpeechAPi;
    this.storageDirectory = storageDirectory;
    this.token = "";
    this.tokenExpirationDate = 0;
  }

  /**
   * Translate the text
   * @param text 
   * @param targetlang 
   */
  translate( text : string, targetlang: string = 'ja'){

    this.translateInternal(text, targetlang)
    .then((jsontext) => {
      let item:any = jsontext[0];
      let translated_text:string = item["translations"][0]["text"];

      this.outputChannel.show();
      this.outputChannel.appendLine(`Source: ${text}`);
      this.outputChannel.appendLine(`Translation: ${translated_text}`);
      this.outputChannel.appendLine('\n');
    })
    .catch((err: Error) => {
      throw new Error(`Translation API request failed: ${err.message}`);
    });
  }

  /**
   * Translate the text and speak with voice
   * @param text 
   * @param targetlang 
   * @param gender 
   */
  translate_speak( text : string, targetlang: string = 'ja', gender: string = 'female' ){

    this.translateInternal(text, targetlang)
    .then((jsontext) => {
      let item:any = jsontext[0];
      let translated_text:string = item["translations"][0]["text"];

      this.outputChannel.show();
      this.outputChannel.appendLine(`Source: ${text}`);
      this.outputChannel.appendLine(`Translation: ${translated_text}`);
      this.outputChannel.appendLine('\n');

      this.speak(translated_text, Languages.getBestLocale(targetlang), gender);
    })
    .catch((err: Error) => {
      throw new Error(`Translation API request failed: ${err.message}`);
    });
  }

  /**
   * Convert Givne Text to Sound file, and play the file
   * @param text 
   * @param locale 
   * @param gender 
   */
  speak( text : string, locale : string = 'en-us', gender: string = 'female' ){
    // see also https://github.com/Microsoft/Cognitive-Speech-TTS/blob/master/Samples-Http/NodeJS/TTSService.js
    let soundFilePath = this.getSoundFilePath(text);
    return this.issueToken()
      .then((token) => {
        // Expire access token expires in 9 minutes.
        this.token = token;
        this.tokenExpirationDate = Date.now() + 9 * 60 * 1000;

        let font = Languages.getVoiceName(locale, gender);

        if (!font) {
          throw new Error(`No voice font for lang ${locale} and gender ${gender}`);
        }

        let ssml = `<speak version='1.0' xml:lang='${locale}'>
              <voice name='${font}' xml:lang='${locale}' xml:gender='${gender}'>${text}</voice>
              </speak>`;

        let options = {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'cache-control': 'no-cache',
            'X-Microsoft-OutputFormat': this.AUDIO_OUTPUT_FORMAT,
            'Content-Type': 'application/ssml+xml',
            'Content-Length': ssml.length,
            'User-Agent': 'vscode-translator-voice',
          }
        };

        return needle.post(Utilities.strFormat(this.AZ_COG_SPEECH_TTS_ENDPOINT, this.regionSpeechApi), ssml, options)
          .pipe(
            fs.createWriteStream(soundFilePath)
          )
          .on ('finish', ()=> {
            // Sound file is ready, and all done
            Utilities.playSound(soundFilePath, true);
          })
          .on('error', (err:Error) => {
            console.log(`Speech API request failure: ${err}`);
            throw new Error(`Voice synthesis failed: ${err.message}`);
          }); 
      })
      .catch((err: Error) => {
        throw new Error(`Voice synthesis failed miserably: ${err.message}`);
      });
  }

  /**
   * Issue auto token for Azure Cognitive Speech API
   */
  private issueToken(): Promise<string> {
    if (this.token && this.tokenExpirationDate > Date.now()) {
      // Resusing existing token
      // console.log(`Reusing existing token`);
      return Promise.resolve(this.token);
    }

    // Issue new token for subscription key :, this.subKeySpeech;
    // console.log(`issue new token for subscription key: ${this.subKeySpeech}`);
    let options = {
      headers: {
        'Ocp-Apim-Subscription-Key': this.subKeySpeech 
      }
    };
    return new Promise((resolve, reject) => {
      needle.post( Utilities.strFormat(this.AZ_COG_SPEECH_TOKEN_ENDPOINT, this.regionSpeechApi), null, options, function(err:any, res:any) {
        if (err) {
          return reject(err);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Wrong status code ${res.statusCode} in Azure Cognitive Speech API / token`));
        }
        // resolve(body);
        resolve(res.body);
      });
    });
  }

  /**
   * Translate the text into the target language
   * @param text 
   * @param targetlang 
   */
  private translateInternal(text:string, targetlang:string = 'ja'): Promise<string> {

    let options = {
      headers: {
        'Ocp-Apim-Subscription-Key': this.subKeyTranslator,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString()
      }
    };

    let body =[{
       'text': text
    }];

    let qs = Utilities.queryString(
      {
      'api-version': '3.0',
      'to': [targetlang] 
       //NOTE: You can give multiple langs like this -> 'to': ['de', 'it', 'ja']
      }
    );

    return new Promise((resolve, reject) => {
      needle.post( `${this.AZ_COG_TRANSLATE_ENDPOINT}?${qs}`, body, options, function(err:any, res:any) {
        if (err) {
          return reject(err);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Wrong status code ${res.statusCode} in Azure Cognitive Translator API`));
        }
        // console.log(`json output=${JSON.stringify(res.body, null, 4)}`);
        // resolve(body);
        resolve(res.body);
      });
    });
  }

  /**
   * Get Sound file path for the text 
   * @param input 
   */
  private getSoundFilePath (input: string): string {
    let fileId = md5( Buffer.from(input).toString('base64') );
    // console.log("storageDirectory================" + this.storageDirectory);
    return path.join(
      this.storageDirectory, fileId + ".wav" );
  }

}