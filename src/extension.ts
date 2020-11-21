import * as vscode from 'vscode';
import { I18nEditorProvider } from './i18n-editor';

export function activate(context: vscode.ExtensionContext) {
  const folders = vscode.workspace.workspaceFolders;
  const uri = folders ? folders[0].uri.fsPath : '';
  
  const i18nEditorProvider = new I18nEditorProvider(uri);
  vscode.window.registerTreeDataProvider('i18nEditor', i18nEditorProvider);

  const disposable = vscode.commands.registerCommand('extension.openI18nFileLine', (filePath, line) => {
    const settings = vscode.Uri.parse('file:'+filePath);
    vscode.workspace.openTextDocument(settings).then( (a: vscode.TextDocument) => {
      vscode.window.showTextDocument(a).then( e => {
        const range = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 0));
        e.revealRange(range, vscode.TextEditorRevealType.AtTop);
      });
    });
  });

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
