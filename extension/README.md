# bigER - VS Code Extension

<!-- BADGES -->
<p align="left">
    <a href="https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram">
        <img alt="Visual Studio Marketplace Installs" src="https://img.shields.io/visual-studio-marketplace/i/BIGModelingTools.erdiagram?color=blue" height="20"/>
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram">
        <img alt="Visual Studio Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/BIGModelingTools.erdiagram" height="20"/>
    </a>
    <a href="https://github.com/borkdominik/bigER">
        <img alt="GitHub Build" src="https://img.shields.io/github/workflow/status/borkdominik/bigER/Build" height="20"/>
    </a> 
    <a href="https://github.com/borkdominik/bigER">
        <img alt="GitHub Stars" src="https://img.shields.io/github/stars/borkdominik/bigER?style=social" height="20">
    </a> 
</p>

<!-- DESCRIPTION -->
> [Open-source](https://github.com/borkdominik/bigER) **ER Modeling Tool** for [Visual Studio Code](https://code.visualstudio.com/) supporting *hybrid textual- and graphical editing*, *multiple notations*, and *SQL code generation*.


<!-- DEMO -->
<p align="center">
  <img src="https://raw.githubusercontent.com/borkdominik/bigER/main/docs/img/demo.gif" alt="Demo" width="800" />
</p>


<!-- FEATURES -->
## Features

- **📝 Textual Language** for the specification of ER models in the textual editor. Assistive *validation* and *rich-text editing* support, enabled with the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/), allows to quickly get familiar with the available language constructs.
- 📊 **Diagram View** that is fully synchronized with the textual model and automatically updates on changes. Also offers an interactive toolbar with *graphical editing actions*, *layout mechanisms*, and *multi-notation support*.
- 🖨️ **Code Generation** to *generate SQL tables* out of the specified ER models and integrate with existing databases.


<!-- GETTING STARTED -->
## Getting Started

**Requirements**

- VS Code 1.46.0 or above
- Java 11 or above

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


<!-- LEARN MORE -->
## Learn More

For more information on how to use the tool, see the [bigER Wiki](https://github.com/borkdominik/bigER/wiki/).

Also check out the [GitHub repository](https://github.com/borkdominik/bigER) and available [examples](https://github.com/borkdominik/bigER/tree/main/examples).
