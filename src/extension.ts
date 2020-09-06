// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import open = require('open');

// instance to opening the resource through the native os app
class FileOpener implements vscode.CustomReadonlyEditorProvider {	
	openCustomDocument(uri: vscode.Uri): vscode.CustomDocument {
		return { uri, dispose: (): void => {} };
	}

	async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel): Promise<void> {
		// Close the opened active editor
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		// Open the pdf file with native app
		await open(document.uri.path)
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	let disposable = vscode.window.registerCustomEditorProvider(
		"pdf.preview",
		new FileOpener()
	);
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
