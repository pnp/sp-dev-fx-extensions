import * as React from "react";
import { useTour } from "@reactour/tour";
import OnboardingContext from "../../Contexts/OnboardingContext";
import OnboardingTourToSteps from "../../Data/OnboardingTourToSteps";
import CallToAction from "../CallToAction/CallToAction";
import usePageTours from "../../Hooks/usePageTours";
import fixModernNavHighlight from "../../utils/fixModernNavHighlight";
import { disableScroll, enableScroll } from "../../utils/elementScroll";
import useTourTracker from "../../Hooks/useTourTracker";
var OnboardingManager = function (_a) {
    var loginName = _a.loginName, environment = _a.environment, pageId = _a.pageId, pageLibraryId = _a.pageLibraryId, stepsList = _a.stepsList, toursList = _a.toursList, viewsList = _a.viewsList;
    var ongoingTour = React.useState(new URLSearchParams(location.search).get("tour"))[0];
    var ongoingStep = React.useState(new URLSearchParams(location.search).get("current-step"))[0];
    var scrollTargetSelector = React.useState(environment === "classic" ? "#s4-workspace" : "div[data-is-scrollable]")[0];
    var scrollTarget = React.useState(document.body.querySelector(scrollTargetSelector) || document.body)[0];
    var _b = useTourTracker(loginName, viewsList), startedTours = _b.startedTours, trackTourStep = _b.trackTourStep;
    var pageTours = usePageTours(pageLibraryId, pageId, toursList, stepsList, parseInt(ongoingTour));
    var _c = useTour(), setSteps = _c.setSteps, setCurrentStep = _c.setCurrentStep, setIsOpen = _c.setIsOpen, isOpen = _c.isOpen, currentStep = _c.currentStep, steps = _c.steps;
    var _d = React.useContext(OnboardingContext), tour = _d.tour, setTour = _d.setTour, setOnboardingStep = _d.setOnboardingStep;
    React.useEffect(function () {
        setOnboardingStep(currentStep);
    }, [currentStep]);
    React.useEffect(function () {
        if (isOpen) {
            disableScroll(scrollTarget);
        }
        else {
            enableScroll(scrollTarget);
        }
    }, [isOpen, scrollTargetSelector]);
    // React.useEffect(()=>{
    //   if(isOpen){
    //       if( environment==="modern" && tour.steps[currentStep] ){
    //         fixModernNavHighlight(tour.steps[currentStep].selector);
    //       }
    //   }
    // }, [isOpen, currentStep])
    // track onboarding progress
    React.useEffect(function () {
        if (!tour || !steps || !isOpen) {
            return;
        }
        var isFinalStep = currentStep == steps.length - 1;
        trackTourStep(tour.id, currentStep, isFinalStep);
    }, [isOpen, currentStep, tour, steps]);
    // pick the tour to be used or continue ongoing tour
    React.useEffect(function () {
        if (!pageTours) {
            return;
        }
        if (ongoingTour) {
            var currentTour = pageTours.filter(function (tour) { return tour.id === parseInt(ongoingTour); });
            // opens the tour on the right step
            if (currentTour.length) {
                setTour(currentTour[0]);
                setSteps(OnboardingTourToSteps(currentTour[0]));
                setCurrentStep(parseInt(ongoingStep));
                setIsOpen(true);
            }
            // cleans the query string from the url
            var url = new URL(location.href);
            var queryParams = new URLSearchParams(url.search);
            queryParams.delete("tour");
            queryParams.delete("current-step");
            url.search = queryParams.toString();
            history.replaceState(null, "", url.href);
        }
        else if (pageTours.length) {
            setTour(pageTours[0]);
            setSteps(OnboardingTourToSteps(pageTours[0]));
        }
    }, [pageTours, ongoingTour, ongoingStep]);
    // auto open tours
    React.useEffect(function () {
        if (!tour || !startedTours || isOpen) {
            return;
        }
        var tourHasStarted = startedTours.filter(function (_a) {
            var tourId = _a.tourId;
            return tour.id === tourId;
        }).length > 0;
        if (tour.autoStart && !tourHasStarted && !isOpen) {
            fixModernNavHighlight(tour.steps[0].selector).then(function () {
                setIsOpen(true);
            });
        }
    }, [tour, startedTours, isOpen]);
    return tour ? (React.createElement(CallToAction, { environment: environment }, "Start tour")) : null;
};
export default OnboardingManager;
//# sourceMappingURL=OnboardingManager.js.map