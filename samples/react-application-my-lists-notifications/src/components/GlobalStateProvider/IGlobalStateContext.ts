import { IGlobalState } from "./IGlobalState";

export interface IGlobalStateContext {
  state: IGlobalState;
  setGlobalState: React.Dispatch<any>;
}
