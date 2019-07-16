'use strict';
import * as vscode from "vscode";
const player = require('node-wav-player');

export class Utilities {
    /**
     * Check if it's empty string
     * @param str 
     */
    public static isEmptyString(str: string): boolean {
        return ( !str && str.length < 1 );
    }

    /**
     * String Format
     * @param str 
     * @param args 
     */
    public static strFormat(str: string, ...args: any[]): string {
        return str.replace(/\{(\d+)\}/g, (m, k) => {
            return args[k];
        });
    }

    /**
     *  Get Configuration data for the extension
     */
    public static getConfig(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration("translatorvoice");
    }

    /** 
     * Generate Query String from params
     * @param params 
     */
    public static queryString(params:any): string {
        return Object.keys(params).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');
    }

    /**
     * Play a specified sound file
     * @param soundfile : Wav format sound file
     */
    public static playSound(soundfile: string) {
        player.play({
            path: soundfile,
        }).then(() => {
            console.log('The sound file started to be played successfully.');
        }).catch((error:any) => {
            console.error(error);
        });
    }

}