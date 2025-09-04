import * as React from 'react';
import { useState } from 'react';
import { Stack, Spinner, Text, Link, Icon } from '@fluentui/react';
import { SitePicker } from '@pnp/spfx-controls-react/lib/SitePicker';

interface Site {
  title: string;
  url: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any, @rushstack/no-new-null */
interface TargetSiteSelectorProps {
  context: any;
  selectSite: (site: { title: string; url: string }) => void;
  isSubmitting: boolean;
  loading: boolean;
  error: Error | null; 
}
/* eslint-enable @typescript-eslint/no-explicit-any, @rushstack/no-new-null */

export const TargetSiteSelector: React.FC<TargetSiteSelectorProps> = ({
  context,
  selectSite,
  isSubmitting,
  loading,
  error,
}) => {
  const [selectedSite, setSelectedSite] = useState<{ title: string; url: string } | null>(null);

  const onSiteChange = (sites: Site[]): void => {
    if (sites.length > 0) {
      const site = sites[0];
      const siteDetails = { title: site.title, url: site.url };
      console.log(site);

      setSelectedSite(siteDetails);
      selectSite(siteDetails);
    }
  };

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <Text variant="large">🌐 Select Destination Site</Text>

      {loading && <Spinner label="Loading sites..." />}
      {error && <Text style={{ color: 'red' }}>{error.message}</Text>}

      {!loading && !error && (
        <SitePicker
          context={context}
          label="Destination Site"
          mode="site"
          multiSelect={false}
          onChange={onSiteChange}
          placeholder="Select a destination site"
          disabled={isSubmitting}
          allowSearch={true}
        />
      )}

      {selectedSite && (
        <Stack
          horizontal
          verticalAlign="center"
          tokens={{ childrenGap: 12 }}
          styles={{
            root: {
              background: '#f3f2f1',
              padding: 12,
              borderRadius: 4,
              marginTop: 8,
            }
          }}
        >
          <Icon iconName="Globe" styles={{ root: { fontSize: 20, color: '#0078d4' } }} />
          <Stack>
            <Text variant="small">Selected Site</Text>
            <Link
              href={String(selectedSite.url)}
              target="_blank"
              styles={{ root: { fontSize: 14, fontWeight: 600 } }}
            >
              {selectedSite.title}
            </Link>
            <Text variant="tiny" styles={{ root: { color: '#605E5C' } }}>
              {selectedSite.url}
            </Text>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
