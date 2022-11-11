import * as React from 'react';
import { Log, FormDisplayMode } from '@microsoft/sp-core-library';
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';

import styles from './FormContainer.module.scss';
import { IFormContainerProps } from './IFormContainerProps';
import { CustomerForm } from '../CustomerForm'
import { Button, PageHeader } from 'antd';
import SharePointService from '../../services/SharePointService';
import { useEffect, useState } from 'react';
import { IRecordType } from '../../model/IRecordType';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
export const FormContainer: React.FC<IFormContainerProps> = (props) => {


  const editformSVG: any = require('../../assets/editform.svg');
  const viewformSVG: any = require('../../assets/viewform.svg');
  const newformSVG: any = require('../../assets/newform.svg');

  
  
  const getCardTitle = (displayMode: FormDisplayMode) => {
    let hashMap = new Map([
      [FormDisplayMode.New, "Add new customer"],
      [FormDisplayMode.Edit, "Update customer detail"],
      [FormDisplayMode.Display, "Customer detail"],
    ]);
    return hashMap.get(displayMode);
  }

  const getBackgroundImage = (displayMode: FormDisplayMode) => {
    let hashMap = new Map([
      [FormDisplayMode.New, newformSVG],
      [FormDisplayMode.Edit, editformSVG],
      [FormDisplayMode.Display, viewformSVG],
    ]);
    return hashMap.get(displayMode);
  }

  const onBack = () => {
    props.onClose();
  }

  const onOpenEditForm = () => {
    location.href = props.EditFormUrl;
  }
  const onOpenNewForm = () => {
    location.href = props.AddFormUrl;
  }

  return (
    <div className={[styles.formContainer].join(' ')}>
      <div className={styles.formHeader}>
        <img id="ProfileHeaderImage" alt="" src={getBackgroundImage(props.displayMode)} />
      </div>
      <div className={styles.card}>
        <PageHeader
          onBack={() => onBack()}
          title={getCardTitle(props.displayMode)}
          subTitle=""
          extra={[
            <Button aria-label='Add' title='Add' hidden={props.displayMode == FormDisplayMode.New} type={"default"} icon={<PlusCircleOutlined />} onClick={() => onOpenNewForm()}></Button>,
            <Button aria-label='Edit' title="Edit" hidden={props.displayMode == FormDisplayMode.Edit || props.displayMode == FormDisplayMode.New} type={"default"} icon={<EditOutlined />} onClick={() => onOpenEditForm()}></Button>
          ]}
        ></PageHeader>
        {
          <CustomerForm
            context={props.context}
            siteUrl={props.context.pageContext.site.absoluteUrl}
            listGuid={props.listGuid}            
            listItem={props.listItem}
            displayMode={props.displayMode}
            EditFormUrl={props.EditFormUrl}
            itemID={props.itemID}
            onSave={props.onSave}
            onClose={props.onClose} />
        }
      </div>
    </div>
  );
}
