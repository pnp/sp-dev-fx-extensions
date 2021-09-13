import * as React from 'react';
import styles from './components.module.scss';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Separator } from '@fluentui/react/lib/Separator';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Stack, IStackTokens, IStackStyles, IStackItemStyles } from '@fluentui/react/lib/Stack';
import { useEffect, useState, FC } from 'react';
import CommandHelper from '../Helpers/CommandHelper';
import { ICommandHelper } from '../Helpers/ICommandHelper';
import { ICommandInfo } from '../Models/ICommandInfo';
import { css } from '@fluentui/utilities';
import { IListInfo, IMappingFieldInfo, IMessageInfo, ISiteListInfo, LoaderType, MessageScope } from '../Models/IModel';
import { Icon, IStyle, SpinnerSize } from '@fluentui/react';
import ContentLoader from './ContentLoader';
import FieldMapper from './FieldMapper';
import { map } from 'lodash';
import MessageContainer from './Message';

const stackTokens: IStackTokens = { childrenGap: 10 };
const stackStyles: IStackStyles = {
    root: {
        marginBottom: '10px'
    }
};
const footerStackStyles: IStackStyles = {
    root: {
        margin: '10px'
    }
};
const footerItemStyles: IStackItemStyles = {
    root: {
        marginRight: '10px'
    }
};
const fieldStackStyles: IStackStyles = {
    root: {
        display: 'inline-block'
    }
};

export interface ICMContainerProps {
    Info: ICommandInfo;
    closeDialog: () => void;
}

const CMContainer: FC<ICMContainerProps> = (props) => {
    const _helper: ICommandHelper = new CommandHelper();
    const [showActionButtons, setShowActionButtons] = useState<boolean>(false);
    const [showActionLoading, setShowActionLoading] = useState<boolean>(false);
    const [actionMsg, setActionMsg] = useState<IMessageInfo>(undefined);
    const [sourceListInfo, setSourceListInfo] = useState<IListInfo>(undefined);
    const [sourceItemCountStyle, setSourceItemCountStyle] = useState<IStyle>(styles.spn_value_green);
    const [selItems, setSelItems] = useState<string[]>([]);
    const [sourceSelItemCountStyle, setSourceSelItemCountStyle] = useState<IStyle>(styles.spn_value_green);
    // Destination Info    
    const [destListInfo, setDestListInfo] = useState<IListInfo>(undefined);
    const [destItemCountStyle, setDestItemCountStyle] = useState<IStyle>(styles.spn_value_green);
    const [destLists, setDestLists] = useState<IDropdownOption[]>(undefined);
    const [selList, setSelList] = useState<string>('0');
    const [disableForSubmission, setDisableForSubmission] = useState<boolean>(false);
    const [mappedFields, setMappedFields] = useState<IMappingFieldInfo[]>([]);

    const _demo = async () => {

    };

    const showOrHideActionButtons = (show: boolean) => {
        setActionMsg(undefined);
        if (show) setShowActionButtons(true);
        else setShowActionButtons(false);
    };

    const _loadSourceInfo = async () => {
        let _sourceListInfo = await _helper.getListInfo(props.Info.List.Id.toString());
        setSourceListInfo(_sourceListInfo);
        if (_sourceListInfo.ItemCount > 4000 && _sourceListInfo.ItemCount <= 5000) setSourceItemCountStyle(styles.spn_value_orange);
        else if (_sourceListInfo.ItemCount > 5000) setSourceItemCountStyle(styles.spn_value_red);
    };

    const _loadDestInfo = async () => {
        let lists: ISiteListInfo[] = await _helper.getAllLists(props.Info.List.Id);
        let ddlLists: IDropdownOption[] = [];
        lists.map(lst => {
            ddlLists.push({ key: lst.Id, text: lst.Title, data: lst });
        });
        ddlLists.unshift({ key: '0', text: 'Select a list', data: null });
        setDestLists(ddlLists);
    };

    const _handleDestListChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption<any>, index?: number) => {
        setShowActionButtons(false);
        if (option.key && option.key.toString() !== '0') {
            setSelList(option.key.toString());
            setDestListInfo(option.data);
            if (option.data.ItemCount > 4000 && option.data.ItemCount <= 5000) setDestItemCountStyle(styles.spn_value_orange);
            else if (option.data.ItemCount > 5000) setDestItemCountStyle(styles.spn_value_red);
        } else {
            setDestListInfo(undefined);
        }
    };

    const _handleConfirmFieldMapping = (_mappedFields: IMappingFieldInfo[]) => {
        setMappedFields([..._mappedFields]);
        console.log("Mapped Fields: ", _mappedFields);
        if (_mappedFields.length > 0) {
            showOrHideActionButtons(true);
        } else {
            showOrHideActionButtons(false);
        }
    };

    const _handleCopyItems = async () => {
        setActionMsg(undefined);
        setDisableForSubmission(true);
        setShowActionLoading(true);
        let srcFields: string[] = map(mappedFields, 'SFInternalName');
        let srcItems: any[] = [];
        if (selItems.length > 0) {
            srcItems = await _helper.getListItemsByIds(srcFields, selItems, props.Info.List.Id);
        } else {
            srcItems = await _helper.getListItems(srcFields, props.Info.List.Id);
        }
        if (srcItems.length > 0) {
            let copyStatus = await _helper.copyItems(srcItems, mappedFields, destListInfo.Id, destListInfo.EntityTypeName);
            setShowActionLoading(false);
            setDisableForSubmission(false);
            if (copyStatus) {
                setActionMsg({ msg: 'Item(s) copied successfully!', scope: MessageScope.Success });
            } else setActionMsg({ msg: 'Copy item(s) failed!', scope: MessageScope.Failure });
        }
    };

    const _handleMoveItems = async () => {
        setActionMsg(undefined);
        setDisableForSubmission(true);
        setShowActionLoading(true);
        let srcFields: string[] = map(mappedFields, 'SFInternalName');
        let srcItems: any[] = await _helper.getListItems(srcFields, props.Info.List.Id, '');
        let copyStatus = await _helper.moveItems(srcItems, props.Info.List.Id.toString(), mappedFields, destListInfo.Id, destListInfo.EntityTypeName);
        setShowActionLoading(false);
        setDisableForSubmission(false);
        if (copyStatus) {
            setActionMsg({ msg: 'Items moved successfully!', scope: MessageScope.Success });
        } else setActionMsg({ msg: 'Move items failed!', scope: MessageScope.Failure });
    };

    const _loadSelectedItems = () => {
        if (props.Info.ItemIds.length > 100 && props.Info.ItemIds.length <= 500) setSourceSelItemCountStyle(styles.spn_value_orange);
        else if (props.Info.ItemIds.length > 500) setSourceSelItemCountStyle(styles.spn_value_red);
        setSelItems(props.Info.ItemIds);
    };

    useEffect(() => {
        _loadSourceInfo();
        _loadDestInfo();
        console.log("CM Container load: ", props);
        if (props.Info.ItemIds.length > 0) {
            _loadSelectedItems();
        }
        _demo();
    }, []);

    return (
        <div className={styles.cmContainer}>
            <Stack tokens={stackTokens}>
                <Stack horizontal horizontalAlign={"space-between"} styles={stackStyles}>
                    <div className={css(styles.sectionContainer, styles.sectionContainer_left)}>
                        <div className={styles.sectionTitle}>Source Info</div>
                        {sourceListInfo ? (
                            <>
                                <div className={styles.div_itemCount}>
                                    <span className={styles.spn_label}>Item Count:</span>
                                    <span className={css(styles.spn_value, sourceItemCountStyle)}>
                                        {sourceListInfo ? sourceListInfo.ItemCount.toString() : ' 0 '}
                                    </span>
                                </div>
                                {selItems.length > 0 &&
                                    <div className={styles.div_itemCount} style={{ marginTop: '10px' }}>
                                        <span className={styles.spn_label}>Selected Item Count:</span>
                                        <span className={css(styles.spn_value, sourceSelItemCountStyle)}>
                                            {selItems.length.toString()}
                                        </span>
                                    </div>
                                }
                            </>
                        ) : (
                            <ContentLoader loaderType={LoaderType.Spinner} loaderMsg={"Loading..."} spinSize={SpinnerSize.small} />
                        )}
                    </div>
                    <Separator vertical />
                    <div className={css(styles.sectionContainer, styles.sectionContainer_right)}>
                        <div className={styles.sectionTitle}>Destination Info</div>
                        {destLists ? (
                            <>
                                <div className={css(styles.destListContainer)}>
                                    <Dropdown placeholder="Select a list" options={destLists} className={styles.listDDL}
                                        selectedKey={selList} onChange={_handleDestListChange} disabled={disableForSubmission} />
                                </div>
                                {destListInfo &&
                                    <div className={styles.div_itemCount} style={{ marginTop: '10px' }}>
                                        <span className={styles.spn_label}>Item Count:</span>
                                        <span className={css(styles.spn_value, destItemCountStyle)}>
                                            {destListInfo ? destListInfo.ItemCount.toString() : ' 0 '}
                                        </span>
                                    </div>
                                }
                            </>
                        ) : (
                            <ContentLoader loaderType={LoaderType.Spinner} loaderMsg={"Loading..."} spinSize={SpinnerSize.small} />
                        )}
                    </div>
                </Stack>
                <Stack horizontal styles={fieldStackStyles}>
                    <FieldMapper sourceListID={props.Info.List.Id.toString()} destListID={destListInfo ? destListInfo.Id.toString() : undefined}
                        confirmFieldMapping={_handleConfirmFieldMapping} disableAll={disableForSubmission}
                        showOrHideActions={showOrHideActionButtons} />
                </Stack>
            </Stack>
            {actionMsg && actionMsg.msg &&
                <Stack tokens={stackTokens}>
                    <Stack horizontal horizontalAlign="start">
                        <MessageContainer MessageScope={actionMsg.scope}
                            Message={actionMsg.msg} />
                    </Stack>
                </Stack>
            }
            <Stack tokens={stackTokens}>
                <Stack horizontal horizontalAlign="end" styles={footerStackStyles}>
                    {showActionLoading &&
                        <Stack.Item style={{ marginTop: '-10px' }}>
                            <ContentLoader loaderType={LoaderType.Spinner} spinSize={SpinnerSize.small} />
                        </Stack.Item>
                    }
                    {showActionButtons &&
                        <>
                            <Stack.Item styles={footerItemStyles}>
                                <PrimaryButton onClick={_handleCopyItems} disabled={disableForSubmission}>
                                    <Icon iconName={"Copy"} />&nbsp;Copy
                                </PrimaryButton>
                            </Stack.Item>
                            <Stack.Item styles={footerItemStyles}>
                                <PrimaryButton onClick={_handleMoveItems} disabled={disableForSubmission}>
                                    <Icon iconName={"MoveToFolder"} />&nbsp;Move
                                </PrimaryButton>
                            </Stack.Item>
                        </>
                    }
                    <Stack.Item>
                        <DefaultButton onClick={props.closeDialog} text="Cancel" disabled={disableForSubmission} />
                    </Stack.Item>
                </Stack>
            </Stack>
        </div>
    );
};

export default CMContainer;