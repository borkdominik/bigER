# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).


## v0.2.0 - *10-2022*

### Added
- Support for participation constraints in the textual model. Can be specified by adding `[0..1]` (zero or one) or `[0..N]` (zero or more) to referenced entities in the relationship.
- `Add Attribute` action to diagram popup when hovering over elements. 
- Formatter for `.erd` files. Can be executed, e.g., from the command palette by searching for the `Format Document` command.
- Various code improvements and tests.

### Changed
- Improvements to multi-notation support, enabled through the newly introduced participation constraints. See the [Notation page in the Wiki](https://github.com/borkdominik/bigER/wiki/Notations) for more details.


### Removed
- UML notation removed, as it will be reworked and available again in a future release. 


## v0.1.0 - *08-2022*

### Added
- Multi-notation support for various ER notations in the diagram (experimental).
- New toolbar with options to graphically change the code generator and notation (includes changes to design).
- Custom datatype for attributes.


### Changed
- Improved the outline view with icons and better representation of element names
- Option to enable the code generator from `generateSql` to `generate=sql`


## v0.0.3 - *11-2021*

### Added
- Help button to toolbar with a link to documentation
- Basic hover information in the textual editor

### Fixed
- Support Java 11


## v0.0.2 - *09-2021*

### Added
- Documentation in the [bigER Wiki](https://github.com/borkdominik/bigER/wiki).

### Changed 
- Keybinding for deleting elements from `← Backspace` to `Ctrl + ← Backspace` to avoid accidental deletion of elements.
- Fixed ReadMe errors and formatting.



### Fixed
- Language server crashes caused by code generator


## v0.0.1 - *08-2021*

Initial public release. 