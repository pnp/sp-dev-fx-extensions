import * as React from "react";
import * as ReactDOM from "react-dom";
import styles from "./festivals.module.scss";

export default class SantaWalking extends React.Component<any>{

    public render(): React.ReactElement<any> {
        return (
            <div>
                <div className={styles.clouds}>
                </div>
                <div className={styles.ground}>
                    <div className={styles.santa}></div>
                    <div className={styles.treebackground}></div>
                    <div className={styles.tree}></div>
                    <div className={`${styles.tree} ${styles.treelarge}`}></div>
                    <div className={styles.tree}></div>
                    <div className={styles.tree}></div>
                    <div className={styles.tree}></div>
                </div>
            </div>
        )
    }
}