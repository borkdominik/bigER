import { window, Uri, commands, workspace } from "vscode";

export const generatePrefix = "erdiagram.generate.";
export const sqlServerCommand = "erdiagram.generate.sql";
export const postgresServerCommand = "erdiagram.generate.postgres";
export const oracleServerCommand = "erdiagram.generate.oracle";
export const mysqlServerCommand = "erdiagram.generate.mysql";
export const mongoDbServerCommand = "erdiagram.generate.mongodb";
export const neo4jServerCommand = "erdiagram.generate.neo4j";
export const cassandraDbServerCommand = "erdiagram.generate.cassandradb";
export const mssqlServerCommand = "erdiagram.generate.mssql";
export const db2ServerCommand = "erdiagram.generate.db2";

// Handler for generate messages from webview
export const handleGenerateMessage = async (generateKind: string, fileUri: Uri) => {
    const generateCommand = generatePrefix + generateKind;
    sendToServer(generateCommand, fileUri);
};

// Individual handlers for commands (not from webview)
export const generateSqlHandler = async () => {
    sendToServer(sqlServerCommand);
};
export const generatePostgresHandler = async () => {
    sendToServer(postgresServerCommand);
};
export const generateOracleHandler = async () => {
    sendToServer(oracleServerCommand);
};
export const generateMySqlHandler = async () => {
    sendToServer(mysqlServerCommand);
};
export const generateMsSqlHandler = async () => {
    sendToServer(mssqlServerCommand);
};
export const generateDb2Handler = async () => {
    sendToServer(db2ServerCommand);
};
export const generateMongoDbHandler = async () => {
    sendToServer(mongoDbServerCommand);
};
export const generateNeo4jHandler = async () => {
    sendToServer(neo4jServerCommand);
};
export const generateCassandraDbHandler = async () => {
    sendToServer(cassandraDbServerCommand);
};


export const sendToServer = async (command: string, fileUri?: Uri) => {
    if (!fileUri) {
        const activeEditor = window.activeTextEditor;
        if (activeEditor?.document?.languageId === 'erdiagram') {
            fileUri = window.activeTextEditor?.document.uri;
        } else {
            window.showErrorMessage("Error! Invalid file");
        }
    }

    if (fileUri?.toString) {
        const generateDrop: any = workspace.getConfiguration().get('erdiagram.generateDrop');
        const response: string | undefined = await commands.executeCommand(command, fileUri.toString(), generateDrop);
        if (response) {
            if (response.startsWith('Error')) {
                window.showErrorMessage(response);
            } else {
                // TODO: Check if generated file exists in folder and provide button to open file in info message
                window.showInformationMessage(response);
            }
        }
    }
};