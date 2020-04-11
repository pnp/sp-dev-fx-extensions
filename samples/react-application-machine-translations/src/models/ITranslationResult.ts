import { IDetectedLanguage } from "./IDetectedLanguage";

export interface ITranslationResult {
  detectedLanguage: IDetectedLanguage;
  translations: ITranslation[];
}

export interface ITranslation {
  text: string;
  to: string;
}
