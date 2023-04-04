# E2E Tests

This package contains [Playwright](https://playwright.dev/) E2E tests for the [bigER VS Code extension](https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram). Docker is used to perform the following steps (see Dockerfile):
- Start a VS Code instance that is available in the browser (e.g. on `http://localhost:3000`) using the docker image `gitpod/openvscode-server`. 
- Install Java and set `JAVA_HOME`.
- Install the bigER extension for the VS Code browser instance.
- Create an initial workspace with sample (test) files.

Build and run the docker image:

```
docker build -t test .
docker run -p 3000:3000 test
```

> Make sure Docker is running before executing the commands!

Afterwards, a VS Code instance should be available on `http://localhost:3000/`. A sample `.erd` file is available in the created test workspace on `http://localhost:3000/?folder=/home/workspace/workspace`.



