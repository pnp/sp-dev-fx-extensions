import * as React from "react";
import styles from "../AppCustomizer.module.scss";
import { CommandBar } from "@fluentui/react";
import * as SPTermStore from "./../services/SPTermStoreService";
import { mapMenuItems } from "../utility/get-menu-items";

interface ITenantGlobalNavBarProps {
  menuItems: SPTermStore.ISPTermObject[];
}

const TenantGlobalNavBar: React.FC<ITenantGlobalNavBarProps> = ({
  menuItems,
}) => (
  <>
    {menuItems.length > 0 && (
      <div
        className={`ms-bgColor-neutralLighter ms-fontColor-white ${styles.app}`}
      >
        <div
          className={`ms-bgColor-neutralLighter ms-fontColor-white ${styles.top}`}
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

export default TenantGlobalNavBar;
