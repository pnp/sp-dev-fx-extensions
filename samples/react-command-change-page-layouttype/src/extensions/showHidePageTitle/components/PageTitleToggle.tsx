import * as React from 'react';
import { FC, useEffect } from 'react';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { useBoolean } from '@uifabric/react-hooks';
export interface IPageTitleToggleProps {
    LayoutType: string;
    ID: number;
    onChangeLT: (id: number, checked: boolean) => void;
    isCheckedout: boolean;
}

export const PageTitleToggle: FC<IPageTitleToggleProps> = (props) => {
    const [isEnabled, { setTrue: enablePageTitle, setFalse: disablePageTitle }] = useBoolean(false);

    const _onChangeToggle = (event: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        if(checked) enablePageTitle();
        else disablePageTitle();
        props.onChangeLT(props.ID, checked);
    };

    useEffect(() => {
        if (props.LayoutType) {
            props.LayoutType.toLowerCase() === "home" ? enablePageTitle() : disablePageTitle();
        }
    }, []);

    return (
        <>
            <Toggle onText="Home" offText="Article"
                checked={isEnabled} onChange={_onChangeToggle} disabled={props.isCheckedout} />
        </>
    );
};