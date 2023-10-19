import * as React from "react";
import styles from "./StepDetail.module.scss";
import { useState, useEffect } from "react";
var CallToAction = function (_a) {
    var onboardingStep = _a.onboardingStep;
    var _b = useState(onboardingStep), env = _b[0], setEnv = _b[1];
    useEffect(function () {
        setEnv(onboardingStep);
    });
    return (React.createElement("div", { className: styles.stepDetail },
        React.createElement("div", { className: styles.mediaWrapper },
            env.mediaType == "Image" &&
                React.createElement("img", { className: styles.stepImage, src: env.mediaUrl }),
            env.mediaType == "Video" &&
                React.createElement("iframe", { className: styles.stepVideo, src: "".concat(env.mediaUrl, "?videoFoam=true&autoPlay=false&playerColor=").concat(JSON.parse(window.beezySettings.BeezyColors)[0].value.replace('#', ''), "&copyLinkAndThumbnailEnabled=false&controlsVisibleOnLoad=false&fullscreenButton=true&playbar=false&settingsControl=false&volumeControl=false&smallPlayButton=false"), allowFullScreen: true })),
        React.createElement("h4", { className: styles.stepTitle }, env.title),
        React.createElement("div", { className: styles.stepScrollRegion },
            React.createElement("div", { className: "stepDetail", dangerouslySetInnerHTML: { __html: String(env.description.trim()).replace(/\u00a0/g, "").replace(/\&lt;/g, "").replace(/\&gt;/g, "") } }))));
};
export default CallToAction;
//# sourceMappingURL=StepDetail.js.map