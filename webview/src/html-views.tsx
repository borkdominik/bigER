/** @jsx html */

import { html } from "snabbdom-jsx";
import { RenderingContext, IView, SButton, SLabel} from "sprotty";
import { VNode } from "snabbdom/vnode";
import { injectable } from "inversify";

@injectable()
export class PaletteButtonView implements IView {
  render(button: SButton, context: RenderingContext): VNode {
    return <div class-palette-button={true}>{button.id}</div>;
  }
}


@injectable()
export class DiagramNameView implements IView {
  render(label: SLabel, context: RenderingContext): VNode {
    return <div class-diagram-name={true}>{label.text}</div>;
  }
}