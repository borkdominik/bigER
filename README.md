<!-- LOGO -->
<p align="center">
  <img src="./extension/media/logo.png" alt="Logo" width="150" height="150" />
</p>

<!-- TITLE -->
<h1 align="center">bigER Modeling Tool</h1>

<!-- BADGES -->
<p align="center">
  <img alt="GitHub Build" src="https://img.shields.io/github/workflow/status/borkdominik/bigER/Build" height="20"/>
  <img alt="Visual Studio Marketplace Installs" src="https://img.shields.io/visual-studio-marketplace/i/BIGModelingTools.erdiagram?color=9cf" height="20"/>
  <img alt="Visual Studio Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/BIGModelingTools.erdiagram" height="20"/>
  <img alt="Visual Studio Marketplace Last Updated" src="https://img.shields.io/visual-studio-marketplace/last-updated/BIGModelingTools.erdiagram?color=blue" height="20"/>
  <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/borkdominik/bigER?color=lightgrey" height="20"/>
</p>

<!-- DESCRIPTION -->
<p align="center">
  <b>Open-source ER modeling tool for VS Code supporting hybrid, textual- and graphical editing, multiple notations, and SQL code generation!</b></br>
  <sub><a href="https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram">➜ Download the VS Code Extension</a><sub>
</p>

<!-- DEMO -->
<p align="center">
  <img src="https://raw.githubusercontent.com/borkdominik/bigER/main/docs/img/demo.gif" alt="Demo" width="800" />
</p>

<!-- FEATURES -->
**Main features:**
- **📝 Textual Language** for the specification of ER models in the textual editor. Assistive *validation* and *rich-text editing* support, enabled with the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/), allows to quickly get familiar with the available language constructs.
- 📊 **Diagram View** that is fully synchronized with the textual model and automatically updates on changes. Also offers an interactive toolbar with *graphical editing actions*, *layout mechanisms*, and *multi-notation support*.
- 🖨️ **Code Generation** to *generate SQL tables* out of the specified ER models and integrate with existing databases.  

---

<br />	

**📖 Table of Contents**
1. [About the Project](#about-the-project)
2. [Usage](#usage)
3. [Build Instructions](#build-instructions)
4. [Issues](#issues)
5. [Contributing](#contributing)
6. [License](#license)

<br />	

## About the Project

Entity-Relationship (ER) modeling is the de-facto standard for data modeling, offering powerful concepts to visualize data in (relational) databases. Various tools for ER modeling are available, however, often they are inflexible, proprietary, or constrained to specific platforms. 

The bigER tool aims to provide an open-source and modern solution for ER by making use of the [Language Server Protocol (LSP)](https://microsoft.github.io/language-server-protocol/). The protocol is used for communicating textual language features to the VS Code client and is further extended to also support graphical editing, making it one of the first *hybrid modeling tools* based on the LSP.

**Built With**

The Java-based language server is realized with [Xtext](https://www.eclipse.org/Xtext/) and [Xtend](https://www.eclipse.org/xtend/), while the diagramming capabilities are based on [Sprotty](https://github.com/eclipse/sprotty). Sprotty enhances the server with graphical language features (using [`sprotty-server`](https://github.com/eclipse/sprotty-server)) and integrates with VS Code through [Sprotty VS Code Extensions](https://github.com/eclipse/sprotty-vscode). 



<!-- USAGE -->
## Usage

Download and install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram). Information regarding installation, can be found in the [Extension Marketplace Guide](https://code.visualstudio.com/docs/editor/extension-marketplace) of VS Code.

**New ER Model**

After installation, ER models can be created in `.erd` files. Use the `New Sample ER Model` command in the Command Palette or refer to the example below to get started with a basic model.

```java
erdiagram Model

notation=default
generate=off

entity A {
   id key
}
entity B {
   id key
}
relationship Rel {
   A -> B
}
```

**Open the Diagram**

The corresponding *ER Diagram* can be opened by using the button in the editor toolbar, the context menu when right-clicking the file, or by pressing <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>O</kbd>.

**Learn More**

For more information on how to use the tool, see the [bigER Wiki](https://github.com/borkdominik/bigER/wiki/).

<!-- BUILD INSTRUCTIONS -->
## Build Instructions

**Prerequisites**

- [Node.js](https://nodejs.org/en/) 16 or above
- [Java](http://jdk.java.net/) JDK 11 or above 
- [VS Code](https://code.visualstudio.com/) v1.46 or above
- [yarn](https://yarnpkg.com/)


Download or clone the repository and in the root folder of the project execute the following commands:

```bash
language-server/gradlew -p language-server/ build 
yarn --cwd webview  
yarn --cwd extension
```

After building the project, the extension can be run in VS Code by pressing <kbd>F5</kbd> or selecting `Run ➜ Start Debugging` from the menu.


<!-- TODO: Add to Wiki
The code is split into a **client side** (extension with webview) and a **server side** (language with LSP and diagram server). It is recommended to use  **VS Code** for the client code, written in *TypeScript* and **Eclipse** for the server side, based on *Java*. Eclipse must be compatible with Xtext and Xtend (e.g. [Eclipse IDE for Java and DSL Developers](https://www.eclipse.org/downloads/packages/release/juno/sr2/eclipse-ide-java-and-dsl-developers)) and create a new workspace to avoid configuration issues. Import the language server as a Gradle project (<kbd>File -> Import -> Existing Gradle Project</kbd>) and override the workspace settings.
-->

<!-- ISSUES -->
## Issues

Project issues are managed on GitHub, see [Open Issues](https://github.com/borkdominik/bigER/blob/main/docs/ISSUES.md) for the currently tracked issues. Do not hesitate to report a bug or request a feature through the offered [Issue Templates](https://github.com/borkdominik/bigER/issues/new/choose). For questions, simply use a blank issue.


<!-- CONTRIBUTING -->
## Contributing

Contributions to the project are always welcome! See the [Contribution Guidelines](https://github.com/borkdominik/bigER/blob/main/docs/CONTRIBUTING.md) for more information.

**Contributors**:
- [Philipp-Lorenz Glaser](https://github.com/plglaser) (main developer)   
- [Georg Hammerschmied](https://github.com/SchmiedHammer) (multi-notation support)
- [Hnatiuk Vladyslav](https://github.com/Aksem) (improved edge router)
- [Dominik Bork](https://github.com/borkdominik)


See [All Contributors](https://github.com/borkdominik/bigER/graphs/contributors).

<!-- LICENSE -->
## License 

The project is distributed under the MIT License. See [License](https://github.com/borkdominik/bigER/blob/main/LICENSE) for more details.
