import {
  BaseComponentContext,
  IReadonlyTheme,
} from "@microsoft/sp-component-base"

export interface IMySitesRoot {
  context: BaseComponentContext
  theme: IReadonlyTheme | undefined
}
