import * as React from "react";
import styles from "./FeedbackCustomizer.module.scss";
import Lottie from "lottie-react";
import Success from "../../assets/success-animation.json";

export interface ISuccessProps {
  goBack:()=>void;
}

export const SuccessPage: React.FC<ISuccessProps> = (props:ISuccessProps): JSX.Element => {

  const handleGoBack = (): void => {
    if (props.goBack) {
      props.goBack();
    }
  };

  return (
    <div className={styles.successWrapper}>
      <p style={{ marginBottom: "0", fontSize: "15px", fontWeight: "500" }}>
        Thanks for submitting your feedback!
      </p>
      <Lottie animationData={Success} style={{ width: "40%" }} loop={false} />
      <p style={{ marginBottom: "0", marginTop: "0" }}>
        We'll respond back to you shortly.
      </p>
      <p style={{ marginBottom: "0", color: "#312783" }}>
        Want to submit another response?
      </p>
      <p
        style={{
          marginBottom: "0",
          marginTop: "0",
          color: "#312783",
          fontWeight: "700",
          cursor: "pointer",
        }}
        onClick={handleGoBack}
      >
        Click here
      </p>
    </div>
  )
};
