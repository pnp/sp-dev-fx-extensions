import { IDetectedLanguage } from "./IDetectedLanguage";

export interface IBreakSentenceResult {
  detectedLanguage: IDetectedLanguage;
  sentLen: number[];
}
