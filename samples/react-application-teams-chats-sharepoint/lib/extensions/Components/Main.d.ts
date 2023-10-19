import * as React from "react";
import { SPFI } from "@pnp/sp";
interface MainProps {
    loginName: string;
    environment: "classic" | "modern";
    webSpfi: SPFI;
    beezySpfi: SPFI;
    pageLibraryId: string;
    pageId: number;
    stepsList?: string;
    toursList?: string;
    viewsList?: string;
}
declare const Main: React.FC<MainProps>;
export default Main;
//# sourceMappingURL=Main.d.ts.map