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
import { useState } from "react";
import { TourProvider, withTour } from "@reactour/tour";
import OnboardingManager from "./OnboardingManager/OnboardingManager";
import OnboardingContext from "../Contexts/OnboardingContext";
import PnpJsContext from "../Contexts/PnpJsContext";
import Navigation from "./Navigation/Navigation";
var Main = withTour(function (props) {
    var _a = useState(null), tour = _a[0], setTour = _a[1];
    var _b = useState(null), currentStep = _b[0], setOnboardingStep = _b[1];
    React.useEffect(function () {
        sessionStorage.removeItem('onboarding-current');
        return function cleanup() {
            sessionStorage.removeItem('onboarding-current');
        };
    }, []);
    React.useEffect(function () {
        sessionStorage.setItem('onboarding-current', "".concat(currentStep));
    }, [currentStep]);
    var loginName = props.loginName, environment = props.environment, webSpfi = props.webSpfi, beezySpfi = props.beezySpfi, pageId = props.pageId, pageLibraryId = props.pageLibraryId, _c = props.stepsList, stepsList = _c === void 0 ? "Tour Steps" : _c, _d = props.viewsList, viewsList = _d === void 0 ? "Tour Views" : _d, _e = props.toursList, toursList = _e === void 0 ? "Tours" : _e;
    var providerProps = {
        steps: [],
        styles: {},
        components: {
            Navigation: Navigation,
        },
        children: null,
        disableKeyboardNavigation: true,
        beforeClose: function () {
            var _a;
            // in classic, scrolling elements below the fold into view will cause
            // the body to scroll and the ribbon to disappear
            // this snippet returns the ribbon into view when closing
            document.body.scrollIntoView();
            var stepIndex = sessionStorage.getItem('onboarding-current');
            var step = stepIndex ? tour.steps[parseInt(stepIndex)] : null;
            if ((step === null || step === void 0 ? void 0 : step.action) == "Click") {
                (_a = document.querySelector(step.actionElement)) === null || _a === void 0 ? void 0 : _a.click();
            }
        },
    };
    return (window.beezyCurrentUser.EulaAccepted ?
        React.createElement(React.Fragment, null,
            React.createElement(PnpJsContext.Provider, { value: { beezySpfi: beezySpfi, webSpfi: webSpfi, pageId: pageId, pageLibraryId: pageLibraryId } },
                React.createElement(OnboardingContext.Provider, { value: { tour: tour, setTour: setTour, currentStep: currentStep, setOnboardingStep: setOnboardingStep } },
                    React.createElement(TourProvider, __assign({}, providerProps, { styles: {
                            popover: function (base) { return (__assign(__assign({}, base), { '--reactour-accent': getComputedStyle(document.documentElement).getPropertyValue('--beezy-color1'), borderRadius: "8px", padding: "0px" })); },
                            badge: function (base) { return (__assign(__assign({}, base), { display: "none" })); },
                            controls: function (base) { return (__assign(__assign({}, base), { marginTop: "24px", "button": {
                                    minWidth: "auto!important"
                                }, "button:first-child": {
                                    marginLeft: "0!important"
                                } })); },
                            dot: function (base) { return (__assign(__assign({}, base), { widht: '8px!important', height: '8px!important', minWidth: '8px!important' })); },
                            maskArea: function (base) { return (__assign(__assign({}, base), { rx: 16 })); },
                            close: function (base) { return (__assign(__assign({}, base), { display: 'block', border: '0', background: 'none', cursor: 'pointer', position: 'absolute', top: '9px!important', right: '12px!important', width: '32px!important', minWidth: '32px!important', height: '32px', color: '#FFF!important', backgroundColor: 'rgba(46,49,63,0.9)!important', borderRadius: '100px', padding: '4px', "&:focus-visible": {
                                    outline: 'none!important',
                                    boxShadow: 'none!important'
                                }, ">svg": {
                                    display: 'none'
                                }, "&:before": {
                                    backgroundImage: "url(data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%3E%20%20%20%20%3Cpath%20d%3D%22M6%2018%2018%206M6%206l12%2012%22%20stroke%3D%22%23fff%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E)",
                                    height: 24,
                                    width: 24,
                                    position: "absolute",
                                    content: "''",
                                    top: 4,
                                    left: 4
                                } })); },
                        } }),
                        React.createElement(OnboardingManager, { loginName: loginName, environment: environment, stepsList: stepsList, toursList: toursList, viewsList: viewsList, pageId: pageId, pageLibraryId: pageLibraryId }))))) : React.createElement(React.Fragment, null));
});
export default Main;
//# sourceMappingURL=Main.js.map