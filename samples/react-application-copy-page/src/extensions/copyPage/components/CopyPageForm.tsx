import * as React from 'react';
import { useState } from 'react';
import { Stack, Toggle, Text } from '@fluentui/react';
import { SourcePageDetails } from './SourcePageDetails';
import { TargetSiteSelector } from './TargetSiteSelector';
import { CopyPageActions } from './CopyPageActions';
import SuccessActions from './SuccessActions';
import { useCopyPage } from '../hooks/useCopyPage';
import { ISPFXContext } from '@pnp/sp';

interface CopyPageFormProps {
  context: ISPFXContext;
  pageName: string;
  pageUrl: string;
}

export enum PromotedState {
  NotPromoted = 0,
  PromoteOnPublish = 1,
  Promoted = 2
}

const CopyPageForm: React.FC<CopyPageFormProps> = ({
  context,
  pageName,
  pageUrl
}) => {
  const [selectedTargetSite, setSelectedTargetSite] = useState<{ title: string; url: string } | null>(null);
  const [hasSelectedSite, setHasSelectedSite] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
  const [publish, setPublish] = useState(false);
  const [promote, setPromote] = useState(false);

  const {
    isSubmitting,
    isDone,
    message,
    copyPage,
    reset,
  } = useCopyPage(context, pageUrl, pageName, selectedTargetSite?.url ?? '');

  const handleReset = (): void => {
    setSelectedTargetSite(null);
    setHasSelectedSite(false);
    setIsTemplate(false);
    setPublish(false);
    setPromote(false);
    reset();
  };

  const handleSiteSelect = (site: { title: string; url: string }): void => {
    setSelectedTargetSite(site);
    setHasSelectedSite(true);
  };

  const handleCopyPage = async (isTemplate: boolean): Promise<void> => {
    setIsTemplate(isTemplate);
  
    let promotedState: PromotedState = PromotedState.NotPromoted;
  
    if (publish && promote) {
      promotedState = PromotedState.Promoted;
    } else if (!publish && promote) {
      promotedState = PromotedState.PromoteOnPublish;
    }
  
    try {
      await copyPage(isTemplate, publish, promotedState); // Await the promise to handle it properly
    } catch (error) {
      console.error('Error copying page:', error); // Log the error for debugging
    }
  };

  if (isDone) {
    return (
      <SuccessActions
        message={message}
        onReset={handleReset}
        targetSite={selectedTargetSite ?? undefined}
        isTemplate={isTemplate}
      />
    );
  }

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <SourcePageDetails pageName={pageName} />
      <TargetSiteSelector
        context={context}
        selectSite={handleSiteSelect}
        isSubmitting={isSubmitting}
        loading={false}
        error={null}
      />

      <Stack horizontal tokens={{ childrenGap: 32 }} verticalAlign="center">
        <Toggle
          label="Publish Page"
          checked={publish}
          onChange={(e, checked) => {
            setPublish(!!checked);
            if (!checked) setPromote(false);
          }}
          onText="Publish"
          offText="Save as draft"
          disabled={isSubmitting || !hasSelectedSite} // Disable toggle when submitting or no site is selected
          />

        <Toggle
          label="Promote as news post"
          checked={promote}
          onChange={(e, checked) => setPromote(!!checked)}
          onText="News"
          offText="Not news"
          disabled={isSubmitting || !hasSelectedSite} // Disable toggle when submitting or no site is selected
          />
      </Stack>

      <Text variant="small" style={{ color: '#666' }}>
        If you select "Promote as news" without publishing, the page will be saved as a draft news post.
      </Text>

      <CopyPageActions
        isSubmitting={isSubmitting}
        copyPage={handleCopyPage}
        disabled={!hasSelectedSite || isSubmitting}
        message={message}
        isTemplate={isTemplate}
      />
    </Stack>
  );
};

export default CopyPageForm;