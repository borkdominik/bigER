# E2E Tests

This package contains [Playwright](https://playwright.dev/) End-To-End (E2E) tests for the [bigER VS Code extension](https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram). 


### Docker

The Dockerfile in this directory is used to perform the following steps:
- Start a VS Code instance and make it available in the browser with the docker image [`gitpod/openvscode-server`](https://github.com/gitpod-io/openvscode-server). 
- Install Java and set `JAVA_HOME`.
- Install the bigER extension for the VS Code browser instance.
- Create an initial workspace with a sample (test) file.

Build and run the docker container:

```
docker build -t test .
docker run -p 3000:3000 test
```

> Make sure Docker is running before executing the commands!

After the container is started, VS Code should be available in the browser at `http://localhost:3000/`. The test workspace can be accessed through `http://localhost:3000/?folder=/home/workspace/workspace` which contains a sample `.erd` file.

### Tests

Tests are located in `src/tests/` and can be executed right in VS Code with the [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension. Currently, the following test cases are implemented:
- `vscode.spec.ts` - tests whether a test sample file exists in the workspace and that the bigER extension has been installed properly
- `diagram.spec.ts` - tests add/edit/delete of entities in the diagram
- `generate.spec.ts` - tests the code generator 

### Resources

- [Playwright Docs](https://playwright.dev/docs/intro)
- [Theia Playwright](https://github.com/eclipsesource/theia/tree/playwright-electron-support/examples/playwright) 
