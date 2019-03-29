import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
export interface IInjectCssApplicationCustomizerProperties {
    cssurl: string;
}
export default class InjectCssApplicationCustomizer extends BaseApplicationCustomizer<IInjectCssApplicationCustomizerProperties> {
    onInit(): Promise<void>;
}
