import * as React from "react";
import styles from "../AppCustomizer.module.scss";
import { CommandBar } from "@fluentui/react";
import * as SPTermStore from "./../services/SPTermStoreService";
import { mapMenuItems } from "../utility/get-menu-items";

interface ITenantGlobalFooterBarProps {
  menuItems: SPTermStore.ISPTermObject[];
}

const TenantGlobalFooterBar: React.FC<ITenantGlobalFooterBarProps> = ({
  menuItems,
}) => (
  <>
    {menuItems.length > 0 && (
      <div
        className={`ms-bgColor-neutralLighter ms-fontColor-white ${styles.app}`}
      >
        <div
          className={`ms-bgColor-neutralLighter ms-fontColor-white ${styles.bottom}`}
        >
          <CommandBar
            className={styles.commandBar}
            ariaLabel="More options"
            items={mapMenuItems(menuItems)}
          />
        </div>
      </div>
    )}
  </>
);

export default TenantGlobalFooterBar;
