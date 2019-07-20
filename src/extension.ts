'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {AzureCognitiveClient } from './azcognitive';
import { Utilities } from "./utilities";
import { Languages } from "./languages";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context:vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('VSCode extension "vscode-translator-voice" is now active!');

    let isVoiceEnabled: boolean,
        statusBarItem: vscode.StatusBarItem,
        selections: vscode.Selection[],
        storagePath: string,
        targetLanguageCode: string,
        voiceGenderName: string,
        isVerified: boolean,
        apiclient: any;

    // Called only once
    let initialize: ()=> boolean =() => {
        isVoiceEnabled = true;

        // Get storage path for storing temporary data
        storagePath = Utilities.getStoragePath(context);

        // Create StatusBarItem instance
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

        // Show statusbarItem after resource loaded
        statusBarItem.show();
        loadConfig();
        return true;
    };

    let loadConfig: ()=> boolean =() => {

        let { 
            subKeyTranslator,
            subKeySpeech,
            regionSpeechApi,
            targetLanguage,
            defaultVoiceEnabled,
            voiceGender 
        } = Utilities.getConfig();

        isVoiceEnabled = defaultVoiceEnabled;
        targetLanguageCode = targetLanguage;
        voiceGenderName = voiceGender;

        // Setup: StatusBarItem
        statusBarItem.command = 'extension.translatorvoice.togglevoice';
        statusBarItem.text = (isVoiceEnabled) ? "Voice [enabled]" : "Voice [disabled]";

        // Create apiclient Instance
        apiclient = new AzureCognitiveClient(
                subKeyTranslator,
                subKeySpeech,
                regionSpeechApi,
                storagePath);

        // Validation Check for Contribution Configurations
        if (!Languages.isSupportedlanguageCode(targetLanguageCode )) {
            vscode.window.showErrorMessage(`[TranslatorVoice] Not Supported Language code!: ${targetLanguageCode}`);
            isVerified = false;
            return false;
        }
        if (!Languages.isSupportedGender(voiceGenderName)) {
            vscode.window.showErrorMessage(`[TranslatorVoice] Not Supported Gendere name! Please choose male or female: ${voiceGenderName}`);
            isVerified = false;
            return false;
        }
        if ( 
            isVoiceEnabled 
                && Utilities.isEmptyString( 
                    Languages.getVoiceName(
                        Languages.getBestLocale(targetLanguageCode),
                        voiceGenderName)
                    ) 
        ) {
            vscode.window.showInformationMessage(`There is no voice available that match your target language (${targetLanguageCode}) and voice gender (${voiceGenderName}), therefore Voice is disabled`);
            isVoiceEnabled = false;
        }
        isVerified = true;
        return true;
    };

    let execute: ()=> any = async() => {

        try {
            if (!isVerified) {
                vscode.window.showErrorMessage('Can not translate due to insufficient configuration!');
                return;
            }
            if (!vscode.window.activeTextEditor) {
                vscode.window.showErrorMessage('Please select your text to execute TranslatorVoice!');
                return;
            }
            selections = vscode.window.activeTextEditor.selections;				  
            if (selections.length > 1) {
                vscode.window.showErrorMessage('[TranslatorVoice] Sorry, multiple text is not supported!');
                // Skip
                // FIXME: multi selected text
                return;
            }
            let selection: vscode.Selection = selections[0];
            let text:string = 
                vscode.window.activeTextEditor.document.getText(
                    new vscode.Range(selection.start, selection.end
                ));
            if (text.length < 1) {
                vscode.window.showErrorMessage('Please select your text to execute TranslatorVoice!');
                return;
            }           
            // Now you are ready to execute translation and speak
            vscode.window.showInformationMessage(`Translating your text: Target Language (${targetLanguageCode})`);
            if (isVoiceEnabled) {
                apiclient.translate_speak(text, targetLanguageCode, voiceGenderName);
            } else {
                apiclient.translate(text, targetLanguageCode);
            }

        } catch (err) {
            console.log(`[TranslatorVoice] Something went wrong in executing api request: ${err}`);
            vscode.window.showErrorMessage('[TranslatorVoice] Something went wrong. Please see debug console for the detail');
        }
    };

    initialize();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(

        // Trigger initalization when the configuration changed.
        vscode.workspace.onDidChangeConfiguration( loadConfig ),
        // Register commands
        vscode.commands.registerCommand('extension.translatorvoice.togglevoice', () => {
            if (!isVoiceEnabled){

                if ( Utilities.isEmptyString(
                        Languages.getVoiceName(
                            Languages.getBestLocale(targetLanguageCode),
                            voiceGenderName)
                        ) 
                ) {
                    vscode.window.showInformationMessage(`There is no voice available that can match your target language (${targetLanguageCode}) and voice gender (${voiceGenderName}), therefore Voice cannot be enabled`);
                    isVoiceEnabled = false;
                } else {
                    isVoiceEnabled = true;
                    statusBarItem.text = "Voice [enabled]";
                    Utilities.updateConfig("defaultVoiceEnabled", isVoiceEnabled);
                    vscode.window.showInformationMessage(`TranslatorVoice: Voice is enabled: Target Language (${targetLanguageCode})`);
                }
            } else {
                isVoiceEnabled = false;
                statusBarItem.text = "Voice [disabled]";
                Utilities.updateConfig("defaultVoiceEnabled", isVoiceEnabled);
                vscode.window.showInformationMessage(`TranslatorVoice: Voice is disabled`);
            }
        }),
        vscode.commands.registerCommand('extension.translatorvoice.translate', () => {
            execute();
        }),
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}
