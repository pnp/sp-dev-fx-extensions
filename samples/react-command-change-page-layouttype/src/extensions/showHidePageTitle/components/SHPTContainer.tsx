import * as React from 'react';
import styles from './common.module.scss';
import * as strings from 'ShowHidePageTitleCommandSetStrings';
import { useEffect, useState, FC } from 'react';
import { useSPHelper } from '../../../Services/useSPHelper';
import { ICommandInfo, ISelPageInfo } from '../IModel';
import { PageTitleToggle } from './PageTitleToggle';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack, StackItem, IStackTokens, IStackStyles, IStackItemStyles } from 'office-ui-fabric-react/lib/Stack';
import { useBoolean } from '@uifabric/react-hooks';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';

const stackTokens: IStackTokens = { childrenGap: 10 };
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

export interface ISHPTContainerProps {
    Info: ICommandInfo;
    closeDialog: () => void;
}

export const SHPTContainer: FC<ISHPTContainerProps> = (props) => {
    const { getItemInfo, updatePage } = useSPHelper(props.Info.List.Title);
    const [selPageInfo, setSelPageInfo] = useState<ISelPageInfo[]>(undefined);
    const [finalPageInfo, setFinalPageInfo] = useState<ISelPageInfo[]>(undefined);
    const [loading, { toggle: toggleLoading }] = useBoolean(true);
    const [showActionButtons, { setTrue: visibleActionButtons }] = useBoolean(false);
    const [showActionLoading, { setTrue: visibleActionLoading, setFalse: hideActionLoading }] = useBoolean(false);
    const [disableForSubmission, { toggle: toggleButtonForSubmissions }] = useBoolean(false);
    const [msg, setMsg] = useState<any>(undefined);

    const _getSelectedPageInfo = async () => {
        const selInfo: ISelPageInfo[] = await getItemInfo(props.Info.Pages, props.Info.List.Title);
        setSelPageInfo(selInfo);
        setFinalPageInfo(selInfo);
        toggleLoading();
        if (selInfo.length > 0) {
            var filSelPages: ISelPageInfo[] = selInfo.filter(pi => pi.PageLayoutType.toLowerCase() === "article" || pi.PageLayoutType.toLowerCase() === "home"
                && !pi.CheckedOutBy);
            if (filSelPages.length > 0) visibleActionButtons();
        }
    };

    const _onChangeLayoutToggle = (id: number, checked: boolean) => {
        let sourceSelPageInfo: ISelPageInfo[] = finalPageInfo;
        let filPageInfo: ISelPageInfo = sourceSelPageInfo.filter(pi => pi.ID == id)[0];
        if (checked) filPageInfo.LayoutToUpdate = "Home";
        else filPageInfo.LayoutToUpdate = "Article";
        setFinalPageInfo(sourceSelPageInfo);
    };

    const _onSaveChanges = async () => {
        setMsg(undefined);
        toggleButtonForSubmissions();
        visibleActionLoading();
        let pagesToUpdate: ISelPageInfo[] = finalPageInfo.filter((pi: ISelPageInfo) => pi.LayoutToUpdate && pi.LayoutToUpdate !== pi.PageLayoutType);
        if (pagesToUpdate.length > 0) {
            await updatePage(pagesToUpdate);
            let sourcePageInfo = selPageInfo;
            pagesToUpdate.map((page: ISelPageInfo) => {
                let fil: ISelPageInfo[] = sourcePageInfo.filter(pi => pi.ID === page.ID);
                fil[0].PageLayoutType = page.LayoutToUpdate;
            });
            setSelPageInfo(sourcePageInfo);
            setMsg({ message: 'Page(s) updated successfully!', scope: 'success' });
        } else {
            setMsg({ message: 'Nothing to update!', scope: 'info' });
        }
        hideActionLoading();
        toggleButtonForSubmissions();
    };

    useEffect(() => {
        _getSelectedPageInfo();
    }, []);

    return (
        <div className={styles.shptContainer}>
            {loading ? (
                <Spinner label="Loading info..." size={SpinnerSize.medium} labelPosition={'bottom'} ariaLive="assertive" />
            ) : (
                <>
                    {msg && msg.message &&
                        <MessageBar messageBarType={msg.scope === 'info' ? MessageBarType.severeWarning : msg.scope === 'success' ? MessageBarType.success : MessageBarType.blocked}
                            isMultiline={false}>
                            {msg.message}
                        </MessageBar>
                    }
                    {!loading && selPageInfo &&
                        <>
                            <div className={styles.pageContainer}>
                                {selPageInfo.map((page: ISelPageInfo) => (
                                    <div className={styles.pageInfoDiv}>
                                        <div className={styles.titleContainer}>
                                            <div className={styles.title}>{page.Filename}</div>
                                            <div className={styles.authorInfo}>by {page.Author}</div>
                                            {page.CheckedOutBy && <div className={styles.checkedout}>Checked out by <b>{page.CheckedOutBy}</b></div>}
                                        </div>
                                        <div className={styles.propertyDiv}>
                                            {page.PageLayoutType && (page.PageLayoutType.toLowerCase() === "article" || page.PageLayoutType.toLowerCase() === "home") ? (
                                                <>
                                                    <PageTitleToggle LayoutType={page.PageLayoutType} ID={page.ID} onChangeLT={_onChangeLayoutToggle}
                                                        isCheckedout={page.CheckedOutBy ? true : false} />
                                                </>
                                            ) : (
                                                <div>Not supported</div>
                                            )}
                                        </div>
                                        <br />
                                    </div>
                                ))}
                            </div>
                            <Stack tokens={stackTokens}>
                                <Stack horizontal horizontalAlign="end" styles={footerStackStyles}>
                                    {showActionLoading &&
                                        <StackItem>
                                            <Spinner size={SpinnerSize.small} ariaLive="assertive" style={{ marginTop: '7px', marginRight: '10px' }} />
                                        </StackItem>
                                    }
                                    {showActionButtons &&
                                        <>
                                            <StackItem styles={footerItemStyles}>
                                                <PrimaryButton onClick={_onSaveChanges} disabled={disableForSubmission}
                                                    iconProps={{ iconName: 'Save' }} text={strings.BtnSave}>
                                                </PrimaryButton>
                                            </StackItem>
                                        </>
                                    }
                                    <StackItem>
                                        <DefaultButton onClick={props.closeDialog} text={strings.BtnCancel} disabled={disableForSubmission}
                                            iconProps={{ iconName: 'Blocked' }} />
                                    </StackItem>
                                </Stack>
                            </Stack>
                        </>
                    }
                </>
            )}
        </div>
    );
};