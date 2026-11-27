import * as React from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { Banner } from '../../../shared/Banner';
import { NotificationRecord, NotificationService } from '../../../shared/NotificationService';
import { matchesTarget } from '../../../shared/notificationRules';
import { GuidedSetup, ListStatus, RegistrationStatus } from './GuidedSetup';
import { INotificationAdminProps } from './INotificationAdminProps';
import styles from './NotificationAdmin.module.scss';

type CheckState<T> = T | { kind: 'loading' } | { kind: 'unknown'; message: string };

export default function NotificationAdmin(props: INotificationAdminProps): React.ReactElement {
  const [records, setRecords] = React.useState<NotificationRecord[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('Loading notifications...');
  const [listStatus, setListStatus] = React.useState<CheckState<ListStatus>>({ kind: 'loading' });
  const [visibilityStatus, setVisibilityStatus] = React.useState<CheckState<{ kind: 'hidden' | 'visible' }>>({ kind: 'loading' });
  const [registrationStatus, setRegistrationStatus] = React.useState<CheckState<RegistrationStatus>>({ kind: 'loading' });
  const [targetStatus, setTargetStatus] = React.useState<string>('');
  const [setupStatus, setSetupStatus] = React.useState<string>('');
  const [setupBusy, setSetupBusy] = React.useState<boolean>(false);
  const [permissionsConfirmed, setPermissionsConfirmed] = React.useState<boolean>(false);
  const [refresh, setRefresh] = React.useState<number>(0);
  const targetCheck = React.useRef<AbortController>();
  const setupController = React.useRef<AbortController>();
  const previewId: string = React.useId();
  const statusHeadingId: string = React.useId();
  const manageHeadingId: string = React.useId();
  const previewHeadingId: string = React.useId();

  React.useEffect(() => {
    const controller: AbortController = new AbortController();
    setStatus('Loading notifications...');
    setListStatus({ kind: 'loading' });
    setVisibilityStatus({ kind: 'loading' });
    setRegistrationStatus({ kind: 'loading' });
    setPermissionsConfirmed(false);
    setRecords([]);
    setSelectedId('');
    setTargetStatus('');
    targetCheck.current?.abort();
    const service: NotificationService = new NotificationService(props.client, props.rootUrl);
    const setup: GuidedSetup = new GuidedSetup(props.client, props.rootUrl);
    setup.checkList(controller.signal).then(result => {
      if (controller.signal.aborted) return;
      setListStatus(result);
      if (result.kind === 'ready') {
        setup.getListVisibility(controller.signal).then(hidden => {
          if (!controller.signal.aborted) setVisibilityStatus({ kind: hidden ? 'hidden' : 'visible' });
        }).catch((error: unknown) => {
          if (!controller.signal.aborted) {
            setVisibilityStatus({ kind: 'unknown', message: error instanceof Error ? error.message : 'Unknown error' });
          }
        });
      }
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setListStatus({ kind: 'unknown', message: error instanceof Error ? error.message : 'Unknown error' });
      }
    });
    setup.checkRegistration(controller.signal).then(result => {
      if (!controller.signal.aborted) setRegistrationStatus(result);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setRegistrationStatus({ kind: 'unknown', message: error instanceof Error ? error.message : 'Unknown error' });
      }
    });
    service.load(controller.signal, false).then(result => {
      if (controller.signal.aborted) return;
      setRecords(result);
      setStatus(result.length
        ? `Loaded ${result.length} notification${result.length === 1 ? '' : 's'}.`
        : 'No notifications yet. Create one in the list, then refresh status.');
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setStatus(`Unable to load notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
    return () => controller.abort();
  }, [props.client, props.rootUrl, refresh]);

  React.useEffect(() => () => {
    targetCheck.current?.abort();
    setupController.current?.abort();
  }, []);

  const selected: NotificationRecord | undefined = records.find(record => String(record.id) === selectedId);
  const rootUrl: string = props.rootUrl.replace(/\/$/, '');
  const registrationFields: string = '$select=Name,Location,ClientSideComponentId,ClientSideComponentProperties&$top=5000';
  const listLabel: Record<CheckState<ListStatus>['kind'], string> = {
    loading: 'Checking', ready: 'Ready', missing: 'Not found', invalid: 'Needs attention', unknown: "Couldn't verify"
  };
  const registrationLabel: Record<CheckState<RegistrationStatus>['kind'], string> = {
    loading: 'Checking', registered: 'Registered', missing: 'Not registered', conflict: 'Needs attention', unknown: "Couldn't verify"
  };

  const verifyTarget = async (): Promise<void> => {
    if (!selected?.item) return;
    targetCheck.current?.abort();
    const controller: AbortController = new AbortController();
    targetCheck.current = controller;
    const targetUrl: string = selected.item.targetSiteUrl.replace(/\/$/, '');
    setTargetStatus('Checking target site...');
    try {
      const response: SPHttpClientResponse = await props.client.get(
        `${targetUrl}/_api/web?$select=Url`,
        SPHttpClient.configurations.v1,
        { signal: controller.signal }
      );
      if (controller.signal.aborted) return;
      if (!response.ok) {
        setTargetStatus(response.status === 404
          ? 'Target site was not found or is inaccessible (HTTP 404). Check the URL and your access.'
          : response.status === 401 || response.status === 403
            ? `Unable to verify target: access was denied (HTTP ${response.status}).`
            : `Target verification is incomplete (HTTP ${response.status}). Try again or check your access.`);
        return;
      }
      const body: unknown = await response.json();
      if (controller.signal.aborted) return;
      if (typeof body !== 'object' || body === null || !('Url' in body) ||
        typeof body.Url !== 'string') {
        throw new Error('SharePoint returned an unexpected site response.');
      }
      if (!matchesTarget(targetUrl, body.Url, props.rootUrl, false)) {
        setTargetStatus('Target URL does not identify the returned site.');
        return;
      }
      const collectionResponse: SPHttpClientResponse = await props.client.get(
        `${targetUrl}/_api/site?$select=Url`,
        SPHttpClient.configurations.v1,
        { signal: controller.signal }
      );
      if (controller.signal.aborted) return;
      if (!collectionResponse.ok) {
        setTargetStatus(`Unable to verify target collection (HTTP ${collectionResponse.status}); check your access.`);
        return;
      }
      const collection: unknown = await collectionResponse.json();
      if (controller.signal.aborted) return;
      if (typeof collection !== 'object' || collection === null || !('Url' in collection) ||
        typeof collection.Url !== 'string') {
        throw new Error('SharePoint returned an unexpected site collection response.');
      }
      setTargetStatus(matchesTarget(props.rootUrl, collection.Url, props.rootUrl, false)
        ? 'Target site and site collection verified.'
        : 'Target site belongs to a different site collection.');
    } catch (error) {
      if (!controller.signal.aborted) {
        setTargetStatus(`Unable to verify target: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const finishSetup = (): void => {
    setupController.current = undefined;
    setSetupBusy(false);
  };

  const runSetup = async (action: 'list' | 'activate' | 'hide' | 'show'): Promise<void> => {
    if (setupController.current) return;
    const controller: AbortController = new AbortController();
    setupController.current = controller;
    setSetupBusy(true);
    setSetupStatus(action === 'list' ? 'Creating or checking the notification list...'
      : action === 'activate' ? 'Checking extension registration...' : 'Updating list visibility...');
    try {
      const setup: GuidedSetup = new GuidedSetup(props.client, props.rootUrl);
      const message: string = action === 'list'
        ? await setup.createOrCheckList(controller.signal)
        : action === 'activate'
          ? await setup.activate(permissionsConfirmed, controller.signal)
          : await setup.setListVisibility(action === 'hide', controller.signal);
      if (!controller.signal.aborted) {
        setSetupStatus(message);
        setRefresh(value => value + 1);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setSetupStatus(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setRefresh(value => value + 1);
      }
    } finally {
      if (!controller.signal.aborted) {
        finishSetup();
      }
    }
  };

  return (
    <section className={styles.admin}>
      <h2>Site notifications</h2>
      <details className={styles.diagnostics}>
        <summary>About site notifications</summary>
        <p>One list per site collection stores notifications, warnings and errors for display on supported modern pages.</p>
        <ul>
          <li><strong>Manage:</strong> Save an item inactive, refresh and preview it, then set Active to Yes to publish.</li>
          <li><strong>Target:</strong> Use a site URL in this collection. Include subsites also targets nested subsites.</li>
          <li><strong>Schedule:</strong> The optional start is inclusive and end is exclusive. Edits load on page load or navigation.</li>
          <li><strong>Presentation:</strong> Close a modal or select OK to show it as a non-modal card. Only dismissible
            cards can be closed. Unless dismissed, the modal returns on navigation or reload while eligible. Dismissals
            are saved in the browser profile, not across devices; a message or type change makes them appear again.</li>
          <li><strong>Access:</strong> All intended visitors need list read access. Readers can see inactive and scheduled
            items; do not include confidential information. Hiding the list does not restrict access.</li>
        </ul>
      </details>
      <details className={styles.diagnostics}>
        <summary>Setup and diagnostics</summary>
        <ol>
          <li>
            <strong>Create and check the list.</strong> Create it at the site collection root if missing.
            New lists are hidden from Site contents; existing lists are not changed automatically.
            Correct reported column or setting issues in SharePoint.
          </li>
          <li>
            <strong>Configure permissions.</strong> New lists inherit root-site permissions. Open list settings, select
            Permissions for this list, and verify administrator edit and visitor read access, including for subsites.
            This page does not check or change permissions.
          </li>
          <li>
            <strong>Activate the extension.</strong> After verifying permissions, register it at site-collection scope.
            Checks cover the site collection and root web, not subsites. Test a page as an intended visitor.
          </li>
        </ol>
        <h3>Extension registration troubleshooting</h3>
        <p>Read-only checks exclude subsites. Follow any next link for more results; ask an administrator if access is denied.</p>
        <ul>
          <li><a href={`${rootUrl}/_api/site/usercustomactions?${registrationFields}`} target="_blank" rel="noopener noreferrer">
            Inspect site-collection registrations (opens in new tab)
          </a></li>
          <li><a href={`${rootUrl}/_api/web/usercustomactions?${registrationFields}`} target="_blank" rel="noopener noreferrer">
            Inspect root-web registrations (opens in new tab)
          </a></li>
        </ul>
        <p>Look for SiteNotificationBanner or component ID 50e2a56c-f19f-40f5-8d8a-fc4d073da842.
          The expected registration is one site-collection entry with that name, location
          ClientSideExtension.ApplicationCustomizer, that component ID and empty or {'{}'} properties;
          there should be no matching root-web entry.
          Do not remove conflicting registrations without investigation.</p>
        <p>Refresh status after changes. An incomplete check does not mean a resource is missing.</p>
      </details>
      <section className={styles.panel} aria-labelledby={statusHeadingId}>
        <div className={styles.panelHeading}>
          <div>
            <h3 id={statusHeadingId}>Site status</h3>
          </div>
          <button type="button" disabled={setupBusy} onClick={() => {
            setSetupStatus('');
            setRefresh(value => value + 1);
          }}>Refresh status</button>
        </div>
        <div className={styles.statusGrid} aria-live="polite">
          <p><strong>List:</strong> {listLabel[listStatus.kind]}</p>
          <p><strong>Extension:</strong> {registrationLabel[registrationStatus.kind]}</p>
          <p><strong>Permissions:</strong> Administrator verification required</p>
        </div>
        {registrationStatus.kind === 'registered' && <p className={styles.hint}>Registration does not confirm visitor access. Verify permissions and test a site page.</p>}
        {listStatus.kind === 'unknown' && <p role="status">List check incomplete: {listStatus.message} Check your access and refresh status.</p>}
        {registrationStatus.kind === 'unknown' && <p role="status">Registration check incomplete: {registrationStatus.message} Check your access and refresh status.</p>}
        {listStatus.kind === 'invalid' && (
          <div role="status">
            <strong>List needs attention.</strong> Fix the following settings in SharePoint, then refresh status.
            <ul>{listStatus.errors.map(error => <li key={error}>{error}</li>)}</ul>
            <p>If setup was interrupted, inspect the existing list before retrying. It will not be overwritten.</p>
          </div>
        )}
        {registrationStatus.kind === 'conflict' && <p role="status">{registrationStatus.message} Open Setup and diagnostics to inspect the registrations, then refresh status.</p>}
        {setupStatus && <p role="status">{setupStatus}</p>}
      </section>
      {listStatus.kind === 'missing' && (
        <div className={styles.setupStep}>
          <h3>Step 1: Create the notification list</h3>
          <p>The new list is hidden from Site contents and inherits root-site permissions. Hiding does not restrict access.
            Keep this page open while setup runs.</p>
          <button type="button" disabled={setupBusy} onClick={() => runSetup('list')}>Create notification list</button>
        </div>
      )}
      <section className={styles.panel} aria-labelledby={manageHeadingId}>
        <h3 id={manageHeadingId}>Manage notifications</h3>
        {listStatus.kind !== 'missing' && (
          <div className={styles.manageItem}>
            <a className={styles.primaryAction} href={`${rootUrl}/Lists/SiteNotifications`}
              target="_blank" rel="noopener noreferrer">Open Site Notification list<span className={styles.visuallyHidden}> (opens in new tab)</span></a>
            <p>Create or edit notifications in the list. Save an item inactive to preview it first.</p>
          </div>
        )}
        {(listStatus.kind === 'ready' || listStatus.kind === 'invalid') && (
          <div className={styles.manageItem}>
            <a href={`${rootUrl}/_layouts/15/listedit.aspx?List=${encodeURIComponent(`{${listStatus.id}}`)}`}
              target="_blank" rel="noopener noreferrer">Open Site Notification list settings<span className={styles.visuallyHidden}> (opens in new tab)</span></a>
            <p>In list settings, select Permissions for this list. Only administrators should edit; intended visitors need read access.</p>
          </div>
        )}
        {listStatus.kind === 'ready' && registrationStatus.kind === 'missing' && (
          <div className={styles.setupStep}>
            <h4>Step 2: Configure permissions</h4>
            <p>Verify administrator edit and intended visitor read access, including for subsite visitors.</p>
            <label>
              <input type="checkbox" checked={permissionsConfirmed} disabled={setupBusy}
                onChange={event => setPermissionsConfirmed(event.currentTarget.checked)} />
              {' '}I confirm list editor and viewer permissions have been configured and verified.
            </label>
            <h4>Step 3: Activate the Site Notifications extension</h4>
            <button type="button" disabled={setupBusy || !permissionsConfirmed} onClick={() => runSetup('activate')}>
              Activate Site Notifications extension
            </button>
          </div>
        )}
        <div className={styles.visibility}>
          <div>
            <h4>Notification list visibility
              {listStatus.kind === 'ready' && (visibilityStatus.kind === 'hidden' || visibilityStatus.kind === 'visible') && (
                <span role="status">: {visibilityStatus.kind === 'hidden' ? 'Hidden' : 'Visible'}</span>
              )}
            </h4>
            {listStatus.kind === 'loading' && <p role="status">Checking list status...</p>}
            {listStatus.kind === 'missing' && <p>Create the notification list before changing its visibility.</p>}
            {listStatus.kind === 'invalid' && <p>Resolve the list issues before changing its visibility.</p>}
            {listStatus.kind === 'unknown' && <p>List visibility cannot be checked until the list status is verified.</p>}
            {listStatus.kind === 'ready' && visibilityStatus.kind === 'loading' && <p role="status">Checking list visibility...</p>}
            {listStatus.kind === 'ready' && visibilityStatus.kind === 'unknown' && <p role="status">List visibility could not be verified: {visibilityStatus.message} Refresh status to retry.</p>}
          </div>
          {listStatus.kind === 'ready' && (visibilityStatus.kind === 'hidden' || visibilityStatus.kind === 'visible') && (
            <button type="button" disabled={setupBusy}
              onClick={() => runSetup(visibilityStatus.kind === 'hidden' ? 'show' : 'hide')}>
              {visibilityStatus.kind === 'hidden' ? 'Show in Site Contents' : 'Hide from Site Contents'}
            </button>
          )}
        </div>
        <p className={styles.hint}>Hiding the list does not change permissions; people with access can still open it directly.</p>
      </section>
      <section className={styles.panel} aria-labelledby={previewHeadingId}>
        <h3 id={previewHeadingId}>Preview saved notification</h3>
        <p>Previewing does not publish the notification.</p>
        {listStatus.kind !== 'missing' && <p role="status" className={styles.hint}>{status}</p>}
        {records.some(record => record.errors.length > 0) && <div>
          <strong>Notifications needing attention</strong>
          <ul>
          {records.filter(record => record.errors.length > 0).map(record => (
            <li key={record.id}>Item {record.id}: {record.errors.join(' ')}</li>
          ))}
          </ul>
          <p>Open the notification list to correct these items, then refresh status.</p>
        </div>}
        <label htmlFor={previewId}>Select a notification</label>{' '}
        <select id={previewId} value={selectedId} onChange={event => {
          targetCheck.current?.abort();
          setSelectedId(event.currentTarget.value);
          setTargetStatus('');
        }}>
          <option value="">Select a notification</option>
          {records.filter(record => !!record.item).map(record => (
            <option value={record.id} key={record.id}>Item {record.id} ({record.item?.type})</option>
          ))}
        </select>
        {selected?.item && (
          <>
            <Banner key={selected.item.id} items={[selected.item]} collectionUrl={props.rootUrl} preview />
            <button type="button" onClick={verifyTarget}>Verify target site</button>
            <p className={styles.hint}>Uses your access; it does not verify visitor permissions.</p>
            <p role="status">{targetStatus}</p>
          </>
        )}
      </section>
    </section>
  );
}
