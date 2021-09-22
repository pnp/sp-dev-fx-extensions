import * as React from 'react';
import * as strings from 'CopyMoveItemsCommandSetStrings';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { LoaderType } from '../Models/IModel';

export interface IContentLoaderProps {
	loaderMsg?: string;
	loaderType: LoaderType;
	spinSize?: SpinnerSize;
}

const ContentLoader: React.FunctionComponent<IContentLoaderProps> = (props) => {
	return (
		<div className="ms-Grid-row">
			{props.spinSize === SpinnerSize.xSmall ? (
				<div style={{ margin: "10px", marginRight: '14px' }}>
					<Spinner label={props.loaderMsg} size={SpinnerSize.xSmall} ariaLive="assertive" labelPosition="top" />
				</div>
			) : (
					<div style={{ margin: "20px" }}>
						{props.loaderType == LoaderType.Spinner &&
							<Spinner label={props.loaderMsg} size={props.spinSize ? props.spinSize : SpinnerSize.large} ariaLive="assertive" labelPosition="top" />
						}
						{props.loaderType == LoaderType.Indicator &&
							<ProgressIndicator label={props.loaderMsg} description={strings.Msg_Wait} />
						}
					</div>
				)}
		</div>
	);
};

export default ContentLoader;