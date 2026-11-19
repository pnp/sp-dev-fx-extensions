/**
 * Background summary update (scope 13). Loaded on demand by the tracker, and
 * only for central admins, so other users never download the job code.
 */
import { SPHttpClient } from '@microsoft/sp-http';
import { SpRest } from '../../shared/spRest';
import { IHitCounterSettings, SETTINGS_KEY, STATE_LIST, parseSettings } from '../../shared/schema';
import { IJobResult, SummaryJob } from '../../webparts/hitCounterDashboard/job/SummaryJob';

export interface IBackgroundResult {
  outcome: 'done' | 'locked' | 'off' | 'not-set-up';
  result?: IJobResult;
}

/** Runs the summary job on the central site unless background updates are turned off there. */
export async function runBackgroundUpdate(
  client: SPHttpClient,
  centralSiteUrl: string,
  userName: string,
  getDigest: () => Promise<string>,
  onJob: (job: SummaryJob | undefined) => void
): Promise<IBackgroundResult> {
  const rest: SpRest = new SpRest(client, centralSiteUrl);
  const found: { value: { Data?: string }[] } | undefined = await rest.tryGet(
    `/_api/web/lists/getbytitle('${SpRest.quote(STATE_LIST)}')/items?$select=Data&$filter=Title eq '${SETTINGS_KEY}'&$top=1`);
  const settings: IHitCounterSettings | undefined = found && found.value.length > 0 ? parseSettings(found.value[0].Data) : undefined;
  if (!settings) {
    return { outcome: 'not-set-up' };
  }
  if (!settings.backgroundUpdates) {
    return { outcome: 'off' };
  }
  const job: SummaryJob = new SummaryJob(rest, client, userName, getDigest);
  onJob(job);
  try {
    const result: IJobResult = await job.run(settings.adminContact, () => { /* quiet in the background */ });
    return { outcome: result.status === 'locked' ? 'locked' : 'done', result };
  } finally {
    onJob(undefined);
  }
}
