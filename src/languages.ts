'use strict';

import { Utilities } from "./utilities";

/**
 * Language Code and Language Name Mapping
 * Source data:
 * https://docs.microsoft.com/en-us/azure/cognitive-services/translator/language-support#translation
 */
const LANGUAGE_MAP: { [key:string]: string } ={
    "af" : "Afrikaans",
    "ar" : "Arabic",
    "bn" : "Bangla",
    "bs" : "Bosnian (Latin)",
    "bg" : "Bulgarian",
    "yue" : "Cantonese (Traditional)",
    "ca" : "Catalan",
    "zh-hans" : "Chinese Simplified",
    "zh-hant" : "Chinese Traditional",
    "hr" : "Croatian",
    "cs" : "Czech",
    "da" : "Danish",
    "nl" : "Dutch",
    "en" : "English",
    "et" : "Estonian",
    "fj" : "Fijian",
    "fil" : "Filipino",
    "fi" : "Finnish",
    "fr" : "French",
    "de" : "German",
    "el" : "Greek",
    "ht" : "Haitian Creole",
    "he" : "Hebrew",
    "hi" : "Hindi",
    "mww" : "Hmong Daw",
    "hu" : "Hungarian",
    "is" : "Icelandic",
    "id" : "Indonesian",
    "it" : "Italian",
    "ja" : "Japanese",
    "sw" : "Kiswahili",
    "tlh" : "Klingon",
    "tlh-qaak" : "Klingon (plqaD)",
    "ko" : "Korean",
    "lv" : "Latvian",
    "lt" : "Lithuanian",
    "mg" : "Malagasy",
    "ms" : "Malay",
    "mt" : "Maltese",
    "nb" : "Norwegian",
    "fa" : "Persian",
    "pl" : "Polish",
    "pt" : "Portuguese",
    "otq" : "Queretaro Otomi",
    "ro" : "Romanian",
    "ru" : "Russian",
    "sm" : "Samoan",
    "sr-cyrl" : "Serbian (Cyrillic)",
    "sr-latn" : "Serbian (Latin)",
    "sk" : "Slovak",
    "sl" : "Slovenian",
    "es" : "Spanish",
    "sv" : "Swedish",
    "ty" : "Tahitian",
    "ta" : "Tamil",
    "te" : "Telugu",
    "th" : "Thai",
    "to" : "Tongan",
    "tr" : "Turkish",
    "uk" : "Ukrainian",
    "ur" : "Urdu",
    "vi" : "Vietnamese",
    "cy" : "Welsh",
    "yua" : "Yucatec Maya"
};

/**
 * Locale, Gender, Voide Name Mapping
 * Source data:
 * https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#standard-voices
 */
const LOCALE_VOICE_MAP: { [key: string]: string } = {
    "ar-eg female": "ar-eg-hoda",
    "ar-sa male": "ar-sa-naayf",
    "bg-bg male": "bg-bg-ivan",
    "ca-es female": "ca-es-herenarus",
    "cs-cz male": "cs-cz-jakub",
    "da-dk female": "da-dk-hellerus",
    "de-at male": "de-at-michael",
    "de-ch male": "de-ch-karsten",
    "de-de female": "de-de-hedda",
    //"de-de female": "de-de-heddarus",
    "de-de male": "de-de-stefan-apollo",
    "el-gr male": "el-gr-stefanos",
    "en-au female": "en-au-catherine",
    //"en-au female": "en-au-hayleyrus",
    "en-ca female": "en-ca-linda",
    //"en-ca female": "en-ca-heatherrus",
    "en-gb female": "en-gb-susan-apollo",
    //"en-gb female": "en-gb-hazelrus",
    "en-gb male": "en-gb-george-apollo",
    "en-ie male": "en-ie-sean",
    "en-in female": "en-in-heera-apollo",
    //"en-in female": "en-in-priyarus",
    "en-in male": "en-in-ravi-apollo",
    "en-us female": "en-us-zirarus",
    //"en-us female": "en-us-jessarus",
    "en-us male": "en-us-benjaminrus",
    //"en-us female": "en-us-jessa24krus",
    //"en-us male": "en-us-guy24krus",
    "es-es female": "es-es-laura-apollo",
    //"es-es female": "es-es-helenarus",
    "es-es male": "es-es-pablo-apollo",
    "es-mx female": "es-mx-hildarus",
    "es-mx male": "es-mx-raul-apollo",
    "fi-fi female": "fi-fi-heidirus",
    "fr-ca female": "fr-ca-caroline",
    //"fr-ca female": "fr-ca-harmonierus",
    "fr-ch male": "fr-ch-guillaume",
    "fr-fr female": "fr-fr-julie-apollo",
    //"fr-fr female": "fr-fr-hortenserus",
    "fr-fr male": "fr-fr-paul-apollo",
    "he-il male": "he-il-asaf",
    "hi-in female": "hi-in-kalpana-apollo",
    //"hi-in female": "hi-in-kalpana",
    "hi-in male": "hi-in-hemant",
    "hr-hr male": "hr-hr-matej",
    "hu-hu male": "hu-hu-szabolcs",
    "id-id male": "id-id-andika",
    "it-it male": "it-it-cosimo-apollo",
    "it-it female": "it-it-luciarus",
    "ja-jp female": "ja-jp-ayumi-apollo",
    "ja-jp male": "ja-jp-ichiro-apollo",
    //"ja-jp female": "ja-jp-harukarus",
    "ko-kr female": "ko-kr-heamirus",
    "ms-my male": "ms-my-rizwan",
    "nb-no female": "nb-no-huldarus",
    "nl-nl female": "nl-nl-hannarus",
    "pl-pl female": "pl-pl-paulinarus",
    "pt-br female": "pt-br-heloisarus",
    "pt-br male": "pt-br-daniel-apollo",
    "pt-pt female": "pt-pt-heliarus",
    "ro-ro male": "ro-ro-andrei",
    "ru-ru female": "ru-ru-irina-apollo",
    "ru-ru male": "ru-ru-pavel-apollo",
    //"ru-ru female": "ru-ru-ekaterinarus",
    "sk-sk male": "sk-sk-filip",
    "sl-si male": "sl-si-lado",
    "sv-se female": "sv-se-hedvigrus",
    "ta-in male": "ta-in-valluvar",
    "te-in female": "te-in-chitra",
    "th-th male": "th-th-pattara",
    "tr-tr female": "tr-tr-sedarus",
    "vi-vn male": "vi-vn-an",
    "zh-cn female": "zh-cn-huihuirus",
    //"zh-cn female": "zh-cn-yaoyao-apollo",
    "zh-cn male": "zh-cn-kangkang-apollo",
    "zh-hk female": "zh-hk-tracy-apollo",
    //"zh-hk female": "zh-hk-tracyrus",
    "zh-hk male": "zh-hk-danny-apollo",
    "zh-tw female": "zh-tw-yating-apollo",
    //"zh-tw female": "zh-tw-hanhanrus",
    "zh-tw male": "zh-tw-zhiwei-apollo"
};

export class Languages {

    /**
     * Check if it's supported language code
     * @param langcode
     */
    public static isSupportedlanguageCode(langcode: string): boolean {
        let c:string = langcode.toLowerCase();
        return (
            !Utilities.isEmptyString(c)
                 && ( c in LANGUAGE_MAP)
            );
    }

    /**
     * Get language name for language code
     * @param langcode 
     */
    public static getLanguageName(langcode: string): string {
        if (!Languages.isSupportedlanguageCode(langcode)) {
            return "";
        }
        return LANGUAGE_MAP[langcode.toLowerCase()];
    }

    /**
     * Get the best locale string for the language code you give
     * @param langcode 
     */
    public static getBestLocale(langcode: string): string {
        if (!Languages.isSupportedlanguageCode(langcode)) {
            return "";
        }
        let localePrefix = langcode.toLowerCase();
        // FIXME: Special lang code and locale mapping
        switch (localePrefix) {
        case "en": return "en-us";
        case "de": return "de-de";
        case "fr": return "fr-fr";
        case "zh-hans": return "zh-cn";
        case "zh-hant": return "zh-cn";
        }
        // General mapping: first come first out strategy
        for(let localeGenderKey in LOCALE_VOICE_MAP){
            let _localePrefix = localeGenderKey.substr(0,2);
            if (localePrefix === _localePrefix) {
                return localeGenderKey.split(" ")[0];
            }
        }
        return "";
    }

    /**
     * Check if it's supported geneder
     * @param gender
     */
    public static isSupportedGender(gender: string): boolean {
        let s:string = gender.toLowerCase();
        return ( s === 'male' || s === 'female' );
    }

    /**
     * Check if it's supported locale
     * @param locale 
     */
    public static isSupportedLocale(locale: string): boolean {
        let s:string = locale.toLowerCase();
        return (
            !Utilities.isEmptyString(s)
                 && ( ( `${s} male` in LOCALE_VOICE_MAP) || (`${s} female` in LOCALE_VOICE_MAP) )
            );
    }

    /**
     * Get voice name 
     * @param locale 
     * @param gender 
     */
    public static getVoiceName(locale: string, gender: string): string {
        if ( !Languages.isSupportedLocale(locale) || !Languages.isSupportedGender(gender) ) {
           return ""; 
        }
        let k = (locale + ' ' + gender).toLowerCase();
        return (k in LOCALE_VOICE_MAP) ? LOCALE_VOICE_MAP[k] : "";
    }
}