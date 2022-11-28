import { window, Uri, commands } from "vscode";

export const sqlKind = "sql";
export const mongodbKind = "mongodb";
export const neo4jKind = "neo4j";
export const cassandradbKind = "cassandradb";
export const generateSqlServerCommand = "erdiagram.generate.sql";
export const generateMongoDbServerCommand = "erdiagram.generate.mongodb";
export const generateNeo4jServerCommand = "erdiagram.generate.neo4j";
export const generateCassandraDbServerCommand = "erdiagram.generate.cassandradb";

export const handleGenerateMessage = async (generateKind: string, fileUri: Uri) => {
    if (generateKind === sqlKind) {
        generateSqlHandler(fileUri);
    } else if (generateKind === mongodbKind) {
        generateMongoDbHandler(fileUri);
    } else if (generateKind === neo4jKind) {
        generateNeo4jHandler(fileUri);
    } else if (generateKind === cassandradbKind) {
        generateCassandraDbHandler(fileUri);
    } else {
        window.showErrorMessage("Unknown generateType '" + generateKind + "' in message.");
    }
};

export const generateSqlHandler = async (fileUri: Uri) => {
    const response: string | undefined = await commands.executeCommand(generateSqlServerCommand, fileUri.toString());
    if (response) {
        if (response.startsWith('Error')) {
            window.showErrorMessage(response);
        } else {
            // TODO: Check if generated file exists in folder and provide button to open file in info message
            window.showInformationMessage(response);
        }
    }
};

export const generateMongoDbHandler = async (fileUri: Uri) => {
    const response: string | undefined = await commands.executeCommand(generateMongoDbServerCommand, fileUri.toString());
    if (response) {
        if (response.startsWith('Error')) {
            window.showErrorMessage(response);
        } else {
            // TODO: Check if generated file exists in folder and provide button to open file in info message
            window.showInformationMessage(response);
        }
    }
};

export const generateNeo4jHandler = async (fileUri: Uri) => {
    const response: string | undefined = await commands.executeCommand(generateNeo4jServerCommand, fileUri.toString());
    if (response) {
        if (response.startsWith('Error')) {
            window.showErrorMessage(response);
        } else {
            // TODO: Check if generated file exists in folder and provide button to open file in info message
            window.showInformationMessage(response);
        }
    }
};

export const generateCassandraDbHandler = async (fileUri: Uri) => {
    const response: string | undefined = await commands.executeCommand(generateCassandraDbServerCommand, fileUri.toString());
    if (response) {
        if (response.startsWith('Error')) {
            window.showErrorMessage(response);
        } else {
            // TODO: Check if generated file exists in folder and provide button to open file in info message
            window.showInformationMessage(response);
        }
    }
};