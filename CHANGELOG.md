# Change Log

All notable changes to the "vscode-translator-voice" extension will be documented in this file.

## 0.5.0
- Fix createOutputChannle part so as not to create the channel every time the extension's configuration change occurs

## 0.4.2
- Fix security vulnerability: upgrade serialize-javascript to 5.0.1

## 0.4.1
- Fix security vulnerability: upgrade mocha to 8.0.1

## 0.4.0
- Disable a command `extension.translatorvoice.translate` when editor Has no text selection
- Add all commands to a category `TranslatorVoice`
- Refactor code: `extension.ts`

## 0.3.0
- Change a path for temporary sound data from workspace specific directory to global directory (`vscode.ExtensionContext.globalStoragePath`)
- Unlink sound file after its playout

## 0.2.0
- Properties values in the extension app are updated with new configuration values without app restart - [Issue #1](https://github.com/yokawasa/vscode-translator-voice/issues/1)
- Fixup bug: Toggled Voice state isn't persisted - [Issue #2](https://github.com/yokawasa/vscode-translator-voice/issues/2)
- Changed StatusBarItem Label => `Voice [enabled/disabled]`

## 0.1.0
- Initial release (alpha release)
