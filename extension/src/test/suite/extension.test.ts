import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

const extensionId = 'BIGModelingTools.erdiagram';
const extensionPrefix = 'erdiagram';
const TEST_FILES_DIR = '../../../src/test/suite/testfiles';
const timeout = async (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

suite('Extension Test Suite', () => {
	let extension: vscode.Extension<any>;
    let erdFile: vscode.Uri;
    vscode.window.showInformationMessage('Start all tests.');

	suiteSetup(() => {
		extension = vscode.extensions.getExtension(extensionId) as vscode.Extension<any>;
        erdFile = vscode.Uri.file(path.join(__dirname, TEST_FILES_DIR, 'test.erd'));
	});

    test('Extension should be available', () => {
        assert.ok(vscode.extensions.getExtension(extensionId));
    });

    test('Extension should be active when opening .erd files', async () => {
        const doc = await vscode.workspace.openTextDocument(erdFile);
        await vscode.window.showTextDocument(doc);
        await timeout(1000);
        assert.strictEqual(extension.isActive, true);
    });

    test('New model command should be available', async () => {
        vscode.commands.getCommands(true).then((allCommands: string[]) => {
            const commands = allCommands.filter(c => c.startsWith(`${extensionPrefix}.model.new`));
            assert.strictEqual(commands.length, 1);
        });
    });
});