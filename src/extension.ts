'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as xmlbuilder from 'xmlbuilder';
import * as request from 'request-promise';
import * as md5 from 'md5';
import * as fs from 'fs';
import * as path from 'path';
const player = require('node-wav-player');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-cognitive-speech" is now active!');

	let isActive: Boolean,
	    statusBarItem: vscode.StatusBarItem,
		selections: vscode.Selection[],
		privateStoragePath: string,

		getSSMLBody: (input: string) => string = (input:string) => {
			return xmlbuilder.create('speak')
				.att('version', '1.0')
				.att('xml:lang', 'en-us')
				.ele('voice')
				.att('xml:lang', 'en-us')
				//.att('name', 'en-US-Guy24kRUS') // Short name for 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)'
				.att('name', 'en-US-JessaRUS') // Short name for 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)'
				.txt(input)
				.end().toString();
		},

		getSoundFilePath: (input: string) => string = (input:string) => {
			let fileId = md5( Buffer.from(input).toString('base64') );
			return path.join(
				privateStoragePath,
				fileId + ".wav" );
		},

		playSound: (soundfile: string) => void = (soundfile:string) => {
			player.play({
				path: soundfile,
			}).then(() => {
				console.log('The sound file started to be played successfully.');
			}).catch((error:any) => {
				console.error(error);
			});
		};

	let executeTTS: ()=> any = async() => {
		if (!isActive) { return; }	
	    let { tts: {
				subscriptionKey,
				region,
				targetLanguage,
				fromLanguage} 
			} = vscode.workspace.getConfiguration();

		console.log('subscriptionKey=' + subscriptionKey);
		console.log('region=' + region);
		console.log('targetLanguage=' + targetLanguage);
		console.log('fromLanguage=' + fromLanguage);

		try {

		  	if (!vscode.window.activeTextEditor) {
				vscode.window.showErrorMessage('Must select text to speech');
   				return;
			}
			selections = vscode.window.activeTextEditor.selections;				  
			if (selections.length > 1) {
				console.log("multiple text are selected");
				// Skip
				// TODO: multi selected text
			}
			let selection: vscode.Selection = selections[0];
			let text:string = 
				vscode.window.activeTextEditor.document.getText(
						new vscode.Range(selection.start, selection.end
					));

			// Request(1) - Get Access Token
			request(
			{
				method: 'POST',
				uri: 'https://' + region + '.api.cognitive.microsoft.com/sts/v1.0/issueToken',
				headers: {
					'Ocp-Apim-Subscription-Key': subscriptionKey
				}
			}).then( body => {
				let accessToken = body;
				let wavfile = getSoundFilePath(text);
				console.log('\nwavfile=' + wavfile);

				// Request(2) - Get Speech Sound
				new Promise( (resolve, reject) => {
				request(
					{
						method: 'POST',
						baseUrl: 'https://' + region + '.tts.speech.microsoft.com/',
						url: 'cognitiveservices/v1',
						headers: {
							'Authorization': 'Bearer ' + accessToken,
							'cache-control': 'no-cache',
							'User-Agent': 'YOUR_RESOURCE_NAME',
							'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
							'Content-Type': 'application/ssml+xml'
						},
						body: getSSMLBody(text)
				})
				.pipe(
					fs.createWriteStream(wavfile)
				)
				.on ('finish', ()=> {
					// Sound file is ready, and all done
					console.log('File is ready!!');
					playSound(wavfile);
					resolve();
				})
				.on('error', (error:any) => {
					console.log(`Request failure: ${error}`);
					reject(error);
				}); // end-of-request(2)
				}) 	
				.catch(error => {
					console.log(`Something happened: ${error}`);
				}); // end-of-promise
			});  // end-of-request(1)


		} catch (err) {
			console.log(`Something went wrong: ${err}`);
		}
	};

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.ttson', () => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			if (isActive){
				isActive = false;
				vscode.window.showInformationMessage('TTS OFF!');
				statusBarItem.dispose();
			} else {
				isActive = true;
				// About 'context.storageApth':
				// * An absolute file path of a workspace specific directory in which the extension
				// * can store private state. The directory might not exist on disk and creation is
				// * up to the extension. However, the parent directory is guaranteed to be existent.
				privateStoragePath = ( context.storagePath ) ? context.storagePath : "";
				if (privateStoragePath !== "" && !fs.existsSync(privateStoragePath)) {
					console.log('First time and create dir: ' + privateStoragePath);
					fs.mkdirSync(privateStoragePath);
				}

				vscode.window.showInformationMessage('TTS ON!');
				statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
			}
		}),
		vscode.commands.registerCommand('extension.ttsplay', () => {
			// The code you place here will be executed every time your command is executed
			if (isActive){
				vscode.window.showInformationMessage('TTS Play!');
				executeTTS();
			}
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
