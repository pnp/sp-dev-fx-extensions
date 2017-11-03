import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  DefaultButton
} from "office-ui-fabric-react/lib/Button";
import { Panel, PanelType } from "office-ui-fabric-react/lib/Panel";

import { IMegaMenuProps } from "./IMegaMenuProps";
import { IMegaMenuState } from "./IMegaMenuState";
import { MenuCategory, MenuItem } from "../menuProvider/index";
import styles from "./MegaMenuComponent.module.scss";

export default class MegaMenuComponent extends React.Component<IMegaMenuProps, IMegaMenuState> {

  constructor(props: IMegaMenuProps) {
    super(props);

    this.state = {
      showPanel: false,
      menuItems: []
    };
  }

  public componentDidMount(): void {

    // get the mega menu items and update the component state.
    this.props.menuProvider.getAllItems().then((result: MenuCategory[]) => {

      this.setState((prevState: IMegaMenuState, props: IMegaMenuProps): IMegaMenuState => {
        prevState.menuItems = result;
        return prevState;
      });
    });
  }

  public render(): React.ReactElement<IMegaMenuProps> {
    return (
      <div>
        <DefaultButton data-id="menuButton" className={styles.menuButton}
          title="SPFx React Mega Menu"
          text="SPFx React Mega Menu"
          ariaLabel="SPFx React Mega Menu"
          onClick={this.showMenu.bind(this)}
        />

        <Panel isOpen={this.state.showPanel}
          type={PanelType.smallFluid} headerClassName={styles.topPanel}
          onDismiss={this.hideMenu.bind(this)}
          headerText="SPFx React Mega Menu"
        >
        <div data-id="menuPanel" className={styles.grid}>
          <div className={styles.row}>
          {
            this.state.menuItems.map((menuCategory: MenuCategory, categoryIndex: number) => {
              return <div data-id={`${menuCategory.category}`} key={categoryIndex} className={styles.col6}>

                        <div className={styles.categoryItem}>
                          {menuCategory.category}
                        </div>

                        {
                          menuCategory.items.map((item: MenuItem, itemIndex: number) => {

                            return <div data-id={`${item.id}`} key={itemIndex} className={styles.menuItem}>
                                      <a href={item.url}>{item.name}</a>
                                    </div>;
                          })
                        }
                    </div>;
            })
          }
          </div>
        </div>
        </Panel>
      </div>
    );
  }

  public showMenu(): void {

    this.setState((prevState: IMegaMenuState, props: IMegaMenuProps): IMegaMenuState => {
      prevState.showPanel = true;
      return prevState;
    });
  }

  public hideMenu(): void {

    this.setState((prevState: IMegaMenuState, props: IMegaMenuProps): IMegaMenuState => {
      prevState.showPanel = false;
      return prevState;
    });
  }
}