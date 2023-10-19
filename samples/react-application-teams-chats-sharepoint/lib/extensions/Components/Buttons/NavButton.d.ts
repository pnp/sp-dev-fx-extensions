import * as React from "react";
export interface NavButtonProps {
    kind: "next" | "prev";
    currentStep: number;
    nextStepIndex: number;
    stepsLength: number;
    setCurrentStep: (index: number) => void;
    rtl?: boolean;
    disableAll?: boolean;
}
declare const NavButton: ({ currentStep, nextStepIndex, stepsLength, kind, setCurrentStep, disableAll, rtl, }: NavButtonProps) => React.JSX.Element;
export default NavButton;
//# sourceMappingURL=NavButton.d.ts.map