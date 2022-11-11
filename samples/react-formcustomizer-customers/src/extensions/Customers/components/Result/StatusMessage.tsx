import { Button, Result } from 'antd';
import { ResultStatusType } from 'antd/lib/result';
import * as React from 'react';
import { IStatusMessage } from './IStatusMessage';


export const StatusMessage: React.FunctionComponent<IStatusMessage> = (props) => (
  <Result
    status={props.resultType}
    title={props.title}
    subTitle={props.subTitle}
    // extra={[
    //   <Button onClick={props.onClose}>Close</Button>,
    // ]}
  />
);

