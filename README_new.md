<div align="center">
	<a href="[https://github.com/othneildrew/Best-README-Template](https://github.com/borkdominik/bigER)">
    	<img src="./extension/media/logo.png" alt="Logo" width="150" height="150">
	</a>
	<h3 align="center">bigER Modeling Tool</h3>
	<p align="center">
    		ER modeling tool for VS Code with support for hybrid textual- and graphical editing and SQL code generation<br /><br />
    		<a href="https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram">
			<strong>➜ Download for VS Code</strong>
		</a>
  	</p>
</div>

<br>

**Table of Contents**

1. [About the Project](#about-the-project)
2. [Build](#build)
3. [Usage](#usage)
4. [Contributing and Issues](#contributing-and-issues)
5. [License](#license)

<br>

## About the Project

**Features**
- 📝 **Textual Editor** to specify ER model elements with *rich-text editing support*, such as syntax highlighting, code completion or validation.
- 📊 **Diagram Editor** that is synchronized with the textual editor and automatically updated. Includes a toolbar to  interact with the underlying model and customize the diagram.
- 🖨️ **Code Generator** to generate SQL tables from the specified ER model.  

The tool uses a language server for the ER modeling language which communicates its language features through the [Language Server Protocol (LSP)](https://microsoft.github.io/language-server-protocol/). This makes bigER highly reusable, increases perfomance and simplifies implementation for other editors that also use the LSP. 

The language and editor features are realized with the [Xtext](https://www.eclipse.org/Xtext/) language workbench, while [Sprotty](https://github.com/eclipse/sprotty) with a [Sprotty-enhanced Graphical Language Server](https://github.com/eclipse/sprotty-server) is used for rendering the diagrams. All of this is integrated with VS Code by implementing a [Sprotty VS Code Extension](https://github.com/eclipse/sprotty-vscode).

<p align="right">(<a href="#top">back to top</a>)</p>


## Build

**Prequisites**

- [Node.js](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/)
- [Java](http://jdk.java.net/) (minimum 11+)
- [VS Code](https://code.visualstudio.com/) (v1.50+)

**CLI Build**

Download or clone the bigER repository and open the project in VS Code. From the root folder execute the following:

```bash
language-server/gradlew -p language-server/ build 
yarn --cwd webview  
yarn --cwd extension
```

**Run the extension**

Press <kbd>F5</kbd> or select <kbd>Run -> Start Debugging</kbd> from the menu to run the extension in VS Code. 

See currently [open](https://github.com/borkdominik/bigER/issues) and [closed](https://github.com/borkdominik/bigER/issues?q=is%3Aissue+is%3Aclosed) issues of the project.

For
For information on how issues and managed, see the [Issue Tracking]()

## Issues

Current open issues are listed in the [Issue Tracker](https://github.com/borkdominik/bigER/issues). Do not hesitate to open new issues in case you encounter problems. See the section below on how to contribute.

## Contributing

If you are interested in contributing, read the our [Contribution Guidelines]() to get started.

**Authors**
- [Philipp-Lorenz Glaser](https://github.com/plglaser) - Lead Developer
- [Dominik Bork](https://github.com/borkdominik)

**Contributors**
- [Georg Hammerschmied](https://github.com/SchmiedHammer) - Multi-notation support
- [Vladyslav Hnatiuk](https://github.com/Aksem) - Edge Routing improvements


See all [Contributors](https://github.com/borkdominik/bigER/graphs/contributors).


<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->
## License 

The project is distributed under the MIT License. See [License](https://github.com/borkdominik/bigER/blob/main/LICENSE) for more details.

<p align="right">(<a href="#top">back to top</a>)</p>
