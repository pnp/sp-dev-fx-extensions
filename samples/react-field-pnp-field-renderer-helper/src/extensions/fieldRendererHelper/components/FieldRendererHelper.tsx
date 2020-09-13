import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import * as React from 'react';
import { FieldRendererHelper as FieldRenderer } from "@pnp/spfx-controls-react/lib/Utilities";

import styles from './FieldRendererHelper.module.scss';
import { ListItemAccessor } from '@microsoft/sp-listview-extensibility';
import { IContext } from '@pnp/spfx-controls-react/lib/common/Interfaces';

export interface IFieldRendererHelperProps {
  /**
   * value of the field as it appears in the customizers
   */
  fieldValue: any;
  /**
   * class to appy to the cell content
   */
  className?: string;
  /**
   * CSS to apply to the cell content
   */
  cssProps?: React.CSSProperties;
  /**
   * current list item
   */
  listItemAccessor: ListItemAccessor;
  /**
   * field customizer context
   */
  context: IContext;
}

export interface IFieldRendererHelperState {
  fieldRenderer?: FieldRenderer;
}

const LOG_SOURCE: string = 'FieldRendererHelper';

export default class FieldRendererHelper extends React.Component<IFieldRendererHelperProps, IFieldRendererHelperState> {
  constructor(props: IFieldRendererHelperProps) {
    super(props);

    this.state = {};
  }

  @override
  public async componentDidMount(): Promise<void> {
    const {
      fieldValue,
      className,
      cssProps,
      listItemAccessor,
      context
    } = this.props;
    // asynchronously getting field renderer. FieldRendererHelper will automatically select needed renderer based on field type
    const renderer = await FieldRenderer.getFieldRenderer(fieldValue, {
      className: className,
      cssProps: cssProps
    }, listItemAccessor, context);

    this.setState({
      fieldRenderer: renderer
    });
  }

  @override
  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: FieldRendererHelper unmounted');
  }

  @override
  public render(): React.ReactElement<{}> {
    const {
      fieldRenderer
    } = this.state;

    return (
      <div className={styles.cell}>
        { fieldRenderer || null }
      </div>
    );
  }
}
