import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


export class I18nEditorProvider implements vscode.TreeDataProvider<I18nFile> {
  constructor(private workspaceRoot: string) {  }
  onDidChangeTreeData?: vscode.Event<any> | undefined;

  getTreeItem(element: I18nFile): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: I18nFile): vscode.ProviderResult<I18nFile[]> {
    if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No i18n in empty workspace');
			return Promise.resolve([]);
		}

    if (element) {
      return Promise.resolve(this.getI18nLiterals(path.join(this.workspaceRoot, 'src', 'assets', 'i18n', element.label)));
    } else {
      return Promise.resolve(this.getI18nFiles(path.join(this.workspaceRoot, 'src', 'assets', 'i18n')));
    }
  }

  private getI18nFiles(i18nUri: string): I18nFile[] {
    const files: I18nFile[] = [];
    if (this.pathExists(i18nUri)) {
      fs.readdirSync(i18nUri).forEach(element => {
        files.push(new I18nFile(element, '', vscode.TreeItemCollapsibleState.Collapsed));
      });
    }

    return files;
  }

  private getI18nLiterals(i18nFilePath: string) {
    const literals = [];
    if (this.pathExists(i18nFilePath)) {
      const fileStr = fs.readFileSync(i18nFilePath, 'utf-8');
      const fileArr = fileStr.split('\n');
      
			const i18nFile = JSON.parse(fileStr);
      for (const key in i18nFile) {
        if (Object.prototype.hasOwnProperty.call(i18nFile, key)) {
          const element = i18nFile[key];
          literals.push(new I18nFile(key,
            element instanceof Object ? 'Object' : element,
            vscode.TreeItemCollapsibleState.None, {
						command: 'extension.openI18nFileLine',
						title: '',
						arguments: [i18nFilePath, this.getLineNumber(fileArr, key)]
					}));
        }
      }
    }
    return literals;
  }

  private getLineNumber(fileStr: string[], key: string): number {
    for (let index = 0; index < fileStr.length; index++) {
      const line = fileStr[index];
      if (line.includes(key)) {
        return index;
      }
    }
    return 0;
  }

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export class I18nFile extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}${this.version ? " - " + this.version : ""}`;
    this.description = this.version;

  }

  contextValue = 'i18nfile';
}