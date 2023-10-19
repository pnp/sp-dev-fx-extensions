import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import "@pnp/graph/users";
import "@pnp/graph/photos";
export interface ITeamsChatEmbeddedApplicationCustomizerProperties {
}
/** A Custom Action which can be run during execution of a Client Side Application */
export default class TeamsChatEmbeddedApplicationCustomizer extends BaseApplicationCustomizer<ITeamsChatEmbeddedApplicationCustomizerProperties> {
    private _bottomPlaceholder;
    onInit(): Promise<void>;
}
//# sourceMappingURL=TeamsChatEmbeddedApplicationCustomizer.d.ts.map