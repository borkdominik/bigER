# bigER Tool

The bigER Tool is an extension for VS Code to display ER Diagrams with the help of a textual syntax. The textual syntax supports entities, relationships and attributes, together with additional concepts. The corresponding diagram is laid out automatically and includes various user interactions. There is also an option to generate SQL Code out of a textual model.

## Build

Download or clone the repository and in the root folder of the project execute the following commands:

```bash
language-server/gradlew -p language-server/ build   
yarn --cwd webview  
yarn --cwd extension
```

To start running the extension press `F5` or `Run -> Start Debugging` inside VS Code.

## Example 

\- 


## Features

\- 

## Planned Features

- [ ] Support Partial/Full Participation
- [ ] Improved Layout
- [ ] Delete Entities/Relationships in Diagram
- [ ] Rename Attributes in Diagram