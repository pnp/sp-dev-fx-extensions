import * as React from 'react';
import { useContext } from 'react';
import { SPFxContext } from '../../contexts/SPFxContext';
import { DefaultButton, MessageBar, MessageBarType, PrimaryButton, Stack } from '@fluentui/react';
import { StandardView } from './StandardView';
import styles from '../CompanyTemplates.module.scss'
import { ISite, SitePicker } from "@pnp/spfx-controls-react/lib/SitePicker";
import { ListPicker } from "@pnp/spfx-controls-react/lib/ListPicker";
import "@pnp/sp/appcatalog";
import "@pnp/sp/webs";
import { UserService } from '../../../../services/core/UserService';
import { SettingsTemplateDefinition } from '../SettingsTemplateDefinition';
import useTemplatesSettings from '../../../../hooks/useTemplatesSettings';
import * as strings from 'CompanyTemplatesCommandSetStrings';

export interface ISettingsViewProps {
  onNavigationExit: (destination: React.ReactNode) => void;
}

export const SettingsView: React.FunctionComponent<ISettingsViewProps> = (props: React.PropsWithChildren<ISettingsViewProps>) => {
  const context = useContext(SPFxContext).context;
  const [userToken, setUserToken] = React.useState<any>(undefined);
  const [userData, setUserData] = React.useState<any>(undefined);
  const { settings, setSettings, storeListSettings } = useTemplatesSettings(context);
  const [processState, setProcess] = React.useState({ saveInProgress: false, error: null });

  React.useEffect(() => {
    const userService = context.serviceScope.consume(UserService.serviceKey);
    userService.getUserTokenDecoded()
      .then((token) => { setUserToken(token) })
      .catch((error) => setProcess({ ...processState, error }));

    userService.getUserData()
      .then((data) => { setUserData(data) })
      .catch((error) => console.log(error));
  }, []);

  function trySaving(): void {
    setProcess({ ...processState, saveInProgress: true });
    storeListSettings()
      .then(() => props.onNavigationExit(<StandardView />))
      .catch(error => setProcess({ saveInProgress: false, error: error }));
  }

  function cancelSettings(): void {
    props.onNavigationExit(<StandardView />);
  }

  console.log(userToken);
  return (
    <>
      <h2 className={`od-ItemContent-title ${styles.dialogTitle}`} key={'title'}>{strings.SettingsView.Title}</h2>
      {userData && <span><br />Current User: {userData.displayName}</span>}

      <Stack horizontal tokens={{ childrenGap: 10 }} style={{ verticalAlign: 'top', justifyContent: 'space-between' }}>
        <Stack style={{ width: '49%' }} tokens={{
          childrenGap: 10,
          maxWidth: '49%'
        }}>
          <h3 key={'title-template-repository'} className={styles.dialogSubtitle}>{strings.SettingsView.TemplateRepository}</h3>
          <div dangerouslySetInnerHTML={{ __html: strings.SettingsView.TemplateRepositoryDescription }} />
          {processState.error &&
            <MessageBar
              messageBarType={MessageBarType.error}
              isMultiline={false}>{processState.error}</MessageBar>}
          {(processState.saveInProgress && !processState.error) &&
            <MessageBar
              messageBarType={MessageBarType.info}
              isMultiline={false}>{strings.SettingsView.SavingInProgress}</MessageBar>}
          <SitePicker
            context={context as any}
            label={strings.SettingsView.SelectSite}
            mode={'site'}
            allowSearch={true}
            multiSelect={false}
            selectedSites={[{ url: settings.site }] as ISite[]}
            onChange={(sites) => { setSettings({ site: sites[0].url, list: undefined, categoryField: undefined }) }}
            placeholder={strings.SettingsView.SelectSites}
            searchPlaceholder={'Filter sites'} />

          <ListPicker context={context as any}
            label={strings.SettingsView.SelectListLabel}
            placeholder={strings.SettingsView.SelectListPlaceholder}
            filter="BaseTemplate eq 101 and EntityTypeName ne 'FormServerTemplates' and EntityTypeName ne 'SiteAssets' and EntityTypeName ne 'Style_x0020_Library'"
            includeHidden={false}
            multiSelect={false}
            disabled={settings.site === undefined}
            webAbsoluteUrl={settings.site && settings.site}
            selectedList={settings.list}
            onSelectionChanged={value => value !== 'NO_LIST_SELECTED' && setSettings({ ...settings, list: value as string, categoryField: undefined })} />

        </Stack>
        <Stack style={{ width: '49%' }} tokens={{
          childrenGap: 10,
          maxWidth: '49%'
        }}>
          <h3 key={'title-template-definition'} className={styles.dialogSubtitle}>{strings.SettingsView.TemplateDefinitionTitle}</h3>
          <SettingsTemplateDefinition settings={settings} changeSettingsCallback={setSettings} />
        </Stack>
      </Stack>
      <Stack style={{ marginTop: '2em', width: '25%' }} tokens={{ childrenGap: 10 }}>
        <PrimaryButton disabled={processState.saveInProgress} text={strings.SettingsView.SaveSettingsButtonText} onClick={trySaving.bind(this)} allowDisabledFocus />
        <DefaultButton text={strings.Common.CancelButtonText} onClick={cancelSettings.bind(this)} allowDisabledFocus />
      </Stack>
    </>
  );
};