import { SPHttpClient } from '@microsoft/sp-http';
import { spGetWithRetry, spPostWithRetry } from './spHttpRetry';

export class ConcurrentModificationError extends Error {
  public constructor(message = 'The file was modified by someone else since it was last loaded.') {
    super(message);
    this.name = 'ConcurrentModificationError';
  }
}

export interface ISaveFileWithETagResult {
  etag?: string;
}

export async function saveFileWithETagConcurrency(
  spHttpClient: SPHttpClient,
  homeUrl: string,
  folderServerRelativeUrl: string,
  fileName: string,
  body: string,
  knownETag: string | undefined,
  checkinComment: string
): Promise<ISaveFileWithETagResult> {
  const fileServerRelativeUrl = `${folderServerRelativeUrl}/${fileName}`;
  const jsonContentType = 'application/json; charset=utf-8';

  if (knownETag) {
    const updateUrl = `${homeUrl}/_api/web/getfilebyserverrelativeurl('${fileServerRelativeUrl}')/$value`;
    const response = await spPostWithRetry(spHttpClient, updateUrl, {
      body,
      headers: {
        'Content-Type': jsonContentType,
        'X-HTTP-Method': 'PUT',
        'IF-MATCH': knownETag
      }
    });

    if (response.status === 412) {
      throw new ConcurrentModificationError();
    }

    if (response.ok) {
      return { etag: response.headers.get('ETag') ?? undefined };
    }

  }

  const uploadUrl = `${homeUrl}/_api/web/getfolderbyserverrelativeurl('${folderServerRelativeUrl}')/files/add(overwrite=true,url='${fileName}')`;
  const uploadOptions = { body, headers: { 'Content-Type': jsonContentType } };

  try {
    const directResponse = await spPostWithRetry(spHttpClient, uploadUrl, uploadOptions);
    if (directResponse.ok) {
      return { etag: directResponse.headers.get('ETag') ?? undefined };
    }
  } catch { void 0; }

  let wasCheckedOut = false;

  try {
    const existsUrl = `${homeUrl}/_api/web/getfilebyserverrelativeurl('${fileServerRelativeUrl}')`;
    const existsResponse = await spGetWithRetry(spHttpClient, existsUrl);

    if (existsResponse.ok) {
      const checkoutUrl = `${homeUrl}/_api/web/getfilebyserverrelativeurl('${fileServerRelativeUrl}')/checkout`;
      await spPostWithRetry(spHttpClient, checkoutUrl, {});
      wasCheckedOut = true;
    }

    const uploadResponse = await spPostWithRetry(spHttpClient, uploadUrl, uploadOptions);

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    const checkinUrl = `${homeUrl}/_api/web/getfilebyserverrelativeurl('${fileServerRelativeUrl}')/checkin(comment='${checkinComment}',checkinType=1)`;
    await spPostWithRetry(spHttpClient, checkinUrl, {});
    wasCheckedOut = false;

    return { etag: uploadResponse.headers.get('ETag') ?? undefined };
  } catch (error) {
    if (wasCheckedOut) {
      try {
        const undoCheckoutUrl = `${homeUrl}/_api/web/getfilebyserverrelativeurl('${fileServerRelativeUrl}')/undoCheckout`;
        await spPostWithRetry(spHttpClient, undoCheckoutUrl, {});
      } catch { void 0; }
    }

    throw error;
  }
}
