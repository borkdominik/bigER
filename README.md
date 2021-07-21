# bigER Tool

The bigER Tool is an extension for VS Code to display ER Diagrams with the help of a textual syntax. The textual syntax supports entities, relationships and attributes, together with additional concepts. The corresponding diagram is laid out automatically and includes various user interactions. There is also an option to generate SQL Code out of a textual model, so far the MySQL dialect is supported.

## Build 

```bash
language-server/gradlew -p language-server/ build   
yarn --cwd webview  
yarn --cwd extension
```

Press 'F5' or Run -> Start Debugging to start the extension host in a new window

## Example 

TODO Example

## SQL Code Generation

TODO SQL Code Generation

## Feature Overview

TODO List of Features