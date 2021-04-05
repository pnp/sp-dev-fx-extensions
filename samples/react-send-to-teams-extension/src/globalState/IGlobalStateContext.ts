import { IGlobalState } from "./IGlobalState";

export interface IGlobalStateContext {
  state: IGlobalState;
  dispatch: React.Dispatch<any>;
}
