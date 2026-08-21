// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import open = require('open');

// instance to opening the resource through the native os app
class FileOpener implements vscode.CustomReadonlyEditorProvider {	
	// create new document for given resource
	openCustomDocument(uri: vscode.Uri): vscode.CustomDocument {
		return { uri, dispose: (): void => {} };
	}
	
	// resolve the editor by opening file through other app and closing window
	async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
		// Close the opened active editor
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		// Open the pdf file with native app
		const pageMatch = /page=(\d+)/.exec(`${document.uri.query}&${document.uri.fragment}`);
		const page = pageMatch ? Number(pageMatch[1]) : undefined;
		const config = vscode.workspace.getConfiguration('pdfpreview');
		const command = config.get<string>('openCommand', '');
		const configuredArgs = config.get<string[]>('openArgs', []);
		const args = configuredArgs.reduce<string[]>((result, arg) => {
			if (arg.includes('{page}') && page === undefined) {
				return result;
			}
			const resolved = arg.replace(/\{page\}/g, page === undefined ? '' : String(page)).trim();
			if (resolved.length > 0) {
				result.push(resolved);
			}
			return result;
		}, []);
		if (command.length > 0) {
			const { spawn } = require('child_process');
			const child = spawn(command, [...args, document.uri.path], {
				detached: true,
				stdio: 'ignore',
				windowsHide: true
			});
			child.on('error', (): void => {});
			child.unref();
			return;
		}
		await open(document.uri.path);
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// create the custom editor and push to the array of disposables
	let disposable = vscode.window.registerCustomEditorProvider(
		"pdf.preview",
		new FileOpener()
	);
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
