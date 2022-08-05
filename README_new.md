# bigER Modeling Tool

<!-- LOGO -->
<div align="center">
    <a href="https://github.com/borkdominik/bigER">
    	<img src="./extension/media/logo.png" alt="Logo" width="150" height="150">
	</a>
</div>

> Hybrid textual and graphical ER modeling tool for VS Code. 

**Features**:
- 📝 **Textual Editor** to specify ER model elements with *rich-text editing support*, such as syntax highlighting, code completion or validation.
- 📊 **Diagram Editor** that is synchronized with the textual editor and automatically updated. Includes a toolbar to  interact with the underlying model and customize the diagram.
- 🖨️ **Code Generator** to generate SQL tables from the specified ER model.  

➜ [Download the VS Code extension](https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram)

**Table of Contents**

1. [About the Project](#about-the-project)
2. [Build](#build)
3. [Contributing and Issues](#contributing-and-issues)
4. [License](#license)


## About the Project



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


## Contributing and Issues

See the list of currently [open issues](https://github.com/borkdominik/bigER/issues) and learn about the [Issuee Tracking]() process. If you are interested in contributing, read the our [Contribution Guidelines]() to get started.

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
