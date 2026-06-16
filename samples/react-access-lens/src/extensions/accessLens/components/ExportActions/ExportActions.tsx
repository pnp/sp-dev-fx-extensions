import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Text } from '@fluentui/react/lib/Text';

import type { PermissionInspectionResult } from '../../models/permission-inspection-result';
import { generateMarkdown, generateCsv, generateJson } from '../../services/export-service';
import { writeToClipboard } from '../../utils/clipboard-fallback';
import { downloadFile } from '../../utils/download-file';
import strings from 'AccessLensCommandSetStrings';
import styles from './ExportActions.module.scss';

export interface IExportActionsProps {
  result: PermissionInspectionResult;
}

export const ExportActions: React.FC<IExportActionsProps> = ({ result }) => {
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; type: 'success' | 'error' } | undefined>();
  const [markdownFallback, setMarkdownFallback] = React.useState<string | undefined>();

  const clearStatus = React.useCallback(() => {
    setTimeout(() => setStatusMessage(undefined), 3000);
  }, []);

  const handleCopyMarkdown = React.useCallback(async () => {
    const markdown = generateMarkdown(result);
    const success = await writeToClipboard(markdown);

    if (success) {
      setStatusMessage({ text: strings.CopiedToClipboard, type: 'success' });
      setMarkdownFallback(undefined);
      clearStatus();
    } else {
      setStatusMessage({ text: strings.ClipboardBlockedMessage, type: 'error' });
      setMarkdownFallback(markdown);
    }
  }, [result, clearStatus]);

  const handleDownloadCsv = React.useCallback(() => {
    const csv = generateCsv(result);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadFile(csv, `access-lens-${timestamp}.csv`, 'text/csv;charset=utf-8');
  }, [result]);

  const handleDownloadJson = React.useCallback(() => {
    const json = generateJson(result);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadFile(json, `access-lens-${timestamp}.json`, 'application/json;charset=utf-8');
  }, [result]);

  const handleDownloadMarkdownFallback = React.useCallback(() => {
    if (!markdownFallback) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadFile(markdownFallback, `access-lens-${timestamp}.md`, 'text/markdown;charset=utf-8');
  }, [markdownFallback]);

  return (
    <div>
      <Text variant="mediumPlus" block style={{ marginBottom: 8, fontWeight: 600 }}>
        {strings.ExportSectionTitle}
      </Text>
      <div className={styles.exportSection}>
        <DefaultButton
          iconProps={{ iconName: 'Copy' }}
          text={strings.ExportMarkdownLabel}
          ariaLabel={strings.ExportMarkdownLabel}
          onClick={() => { handleCopyMarkdown().catch(() => { /* handled */ }); }}
        />
        <DefaultButton
          iconProps={{ iconName: 'ExcelDocument' }}
          text={strings.ExportCsvLabel}
          ariaLabel={strings.ExportCsvLabel}
          onClick={handleDownloadCsv}
        />
        <DefaultButton
          iconProps={{ iconName: 'Code' }}
          text={strings.ExportJsonLabel}
          ariaLabel={strings.ExportJsonLabel}
          onClick={handleDownloadJson}
        />
      </div>

      {statusMessage && (
        <div className={`${styles.statusMessage} ${statusMessage.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
          {statusMessage.text}
        </div>
      )}

      {markdownFallback && (
        <div className={styles.fallbackContainer}>
          <textarea
            className={styles.fallbackTextArea}
            value={markdownFallback}
            readOnly
            aria-label={strings.MarkdownExportContentLabel}
          />
          <DefaultButton
            text={strings.DownloadMarkdownLabel}
            onClick={handleDownloadMarkdownFallback}
            style={{ marginTop: 4 }}
          />
        </div>
      )}
    </div>
  );
};
