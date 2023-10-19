import * as React from "react";
interface OnboardingManagerProps {
    loginName: string;
    environment: "classic" | "modern";
    pageId: number;
    pageLibraryId: string;
    toursList: string;
    stepsList: string;
    viewsList: string;
}
declare const OnboardingManager: React.FC<OnboardingManagerProps>;
export default OnboardingManager;
//# sourceMappingURL=OnboardingManager.d.ts.map