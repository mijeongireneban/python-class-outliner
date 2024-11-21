import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const classOutlineProvider = new ClassOutlineProvider();
    vscode.window.registerTreeDataProvider('pythonClassOutliner', classOutlineProvider);

    vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document === vscode.window.activeTextEditor?.document) {
            classOutlineProvider.refresh();
        }
    });

    vscode.window.onDidChangeActiveTextEditor(() => classOutlineProvider.refresh());
}

export function deactivate() {}

class ClassOutlineProvider implements vscode.TreeDataProvider<ClassItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ClassItem | undefined | null> = new vscode.EventEmitter<ClassItem | undefined | null>();
    readonly onDidChangeTreeData: vscode.Event<ClassItem | undefined | null> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ClassItem): vscode.TreeItem {
        return element;
    }

    getChildren(): ClassItem[] | Thenable<ClassItem[]> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'python') {
            return Promise.resolve([]);
        }

        const text = editor.document.getText();
        const classRegex = /^(?:\s*@.*\n)*\s*class\s+(\w+)(?:\s*\([^)]*\))?:/gm;
        const classes: ClassItem[] = [];

        let match;
        while ((match = classRegex.exec(text)) !== null) {
            const className = match[1];
            // Find the actual 'class' keyword position within the match
            const matchText = match[0];
            const classKeywordOffset = matchText.indexOf('class');
            const lineNumber = text.substring(0, match.index + classKeywordOffset).split('\n').length - 1;
            classes.push(new ClassItem(
                className,
                vscode.TreeItemCollapsibleState.None,
                new vscode.Location(editor.document.uri, new vscode.Position(lineNumber, 0))
            ));
        }

        return Promise.resolve(classes);
    }
}

class ClassItem extends vscode.TreeItem {
    constructor(
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        location?: vscode.Location
    ) {
        super(label, collapsibleState);
        if (location) {
            this.command = {
                command: 'vscode.open',
                title: 'Go to Class',
                arguments: [
                    location.uri,
                    { selection: location.range }
                ]
            };
        }
    }
}