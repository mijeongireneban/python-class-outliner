"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    const classOutlineProvider = new ClassOutlineProvider();
    vscode.window.registerTreeDataProvider('pythonClassOutliner', classOutlineProvider);
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document === vscode.window.activeTextEditor?.document) {
            classOutlineProvider.refresh();
        }
    });
    vscode.window.onDidChangeActiveTextEditor(() => classOutlineProvider.refresh());
}
function deactivate() { }
class ClassOutlineProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'python') {
            return Promise.resolve([]);
        }
        const text = editor.document.getText();
        const classRegex = /^(?:\s*@.*\n)*\s*class\s+(\w+)(?:\s*\([^)]*\))?:/gm;
        const classes = [];
        let match;
        while ((match = classRegex.exec(text)) !== null) {
            const className = match[1];
            // Find the actual 'class' keyword position within the match
            const matchText = match[0];
            const classKeywordOffset = matchText.indexOf('class');
            const lineNumber = text.substring(0, match.index + classKeywordOffset).split('\n').length - 1;
            classes.push(new ClassItem(className, vscode.TreeItemCollapsibleState.None, new vscode.Location(editor.document.uri, new vscode.Position(lineNumber, 0))));
        }
        return Promise.resolve(classes);
    }
}
class ClassItem extends vscode.TreeItem {
    constructor(label, collapsibleState, location) {
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
//# sourceMappingURL=extension.js.map