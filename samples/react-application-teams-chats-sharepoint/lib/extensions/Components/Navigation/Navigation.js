var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as React from "react";
import { useTour } from "@reactour/tour";
import setOnboardingStep from "../../utils/setOnboardingStep";
import OnboardingContext from "../../Contexts/OnboardingContext";
import usePageUrl from "../../Hooks/usePageUrl";
import classes from "./Navigation.module.scss";
import Bullets from "../../../../../../packages/beezy-shared/src/components/hero/carousel/bullets";
import NextButton from "../Buttons/NextButton";
import PrevButton from "../Buttons/PrevButton";
var Navigation = function (props) {
    var tour = useTour();
    var currentStep = tour.currentStep, rtl = tour.rtl, disabledActions = tour.disabledActions;
    var onboarding = React.useContext(OnboardingContext).tour;
    var pageUrl = usePageUrl();
    var bulletsProps = {
        activeIndex: currentStep,
        isFocusable: true,
        slides: tour.steps,
        onIndicatorClick: setStep,
        shouldBlur: true,
    };
    function setStep(index) {
        setOnboardingStep(pageUrl, index, tour, onboarding);
    }
    return (React.createElement("div", { className: classes.navigation },
        React.createElement(PrevButton, { currentStep: currentStep, setCurrentStep: setStep, stepsLength: tour.steps.length, rtl: rtl, disableAll: disabledActions }),
        React.createElement("div", { className: classes.bullets },
            React.createElement(Bullets, __assign({}, bulletsProps))),
        React.createElement(NextButton, { currentStep: currentStep, setCurrentStep: setStep, stepsLength: tour.steps.length, rtl: rtl, disableAll: disabledActions })));
};
export default Navigation;
//# sourceMappingURL=Navigation.js.map