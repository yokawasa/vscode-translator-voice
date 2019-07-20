'use strict';
import * as vscode from "vscode";
import * as fs from 'fs';
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
     * Update Configuration data for the extension
     * @param key 
     * @param value 
     */
    public static updateConfig(key:string, value:any): void {
        vscode.workspace.getConfiguration("translatorvoice").update(key, value, true);
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
     * Get a path for storing data that the extension use while it's running 
     * @param context vscode.ExtensionContext
     */
    public static getStoragePath(context:vscode.ExtensionContext): string{
        // About 'context.globalStoragePath':
        // An absolute file path in which the extension can store global state. 
        // The directory might not exist on disk and creation is up to the extension. 
        // However, the parent directory is guaranteed to be existent.
        let storagePath:string  = ( context.globalStoragePath ) ? context.globalStoragePath : "";
        // console.log(`storagePath: ${storagePath}`);
        if (storagePath !== "" && !fs.existsSync(storagePath)) {
            console.log(`First time and create dir: ${storagePath}`);
            fs.mkdirSync(storagePath);
        }
        return storagePath;
    }

    /**
     * Unlink File 
     * @param path 
     */
    public static unlinkFile(path:string): void {
        try {
            fs.unlinkSync(path);
        //file removed
        } catch(error) {
            console.error(error);
            throw new Error(`unlinkFile failure: ${error.message}`);
        }
    }

    /**
     * Play a specified sound file
     * @param soundfile : Wav format sound file
     * @param cleanup : whether to cleanup sound file after its play out
     */
    public static playSound(soundfile: string, cleanup: boolean = false) {
        player.play({
            path: soundfile,
        }).then(() => {
            // console.log('The sound file started to be played successfully.');
            if (cleanup){
                this.unlinkFile(soundfile);
            }
        }).catch((error:any) => {
            console.error(error);
            throw new Error(`Sound file play failed: ${error.message}`);
        });
    }

}