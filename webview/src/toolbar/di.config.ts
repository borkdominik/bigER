import { ContainerModule } from "inversify";
import { TYPES } from "sprotty";
import { ToolBar } from "./toolbar";

const toolbarModule = new ContainerModule((bind) => {
    bind(ToolBar).toSelf().inSingletonScope();
    bind(TYPES.IUIExtension).toService(ToolBar);
});

export default toolbarModule;