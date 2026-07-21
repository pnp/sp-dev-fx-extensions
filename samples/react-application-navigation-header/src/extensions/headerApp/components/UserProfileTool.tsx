import * as React from 'react';
import { Popover, PopoverTrigger, PopoverSurface, Avatar, Spinner } from '@fluentui/react-components';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { IUserProfile } from '../models/IHeaderServices';
import type { HeaderServices } from '../services/HeaderServices';
import { sanitizeUrl } from '../utils/url';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './HeaderTools.module.scss';

export interface IUserProfileToolProps {
  strings: IHeaderStrings;
  services: HeaderServices;
}

const UserProfileTool: React.FC<IUserProfileToolProps> = (props) => {
  const { strings, services } = props;
  const [open, setOpen] = React.useState(false);
  const [profile, setProfile] = React.useState<IUserProfile | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    let isDisposed = false;

    const load = async (): Promise<void> => {
      setIsLoading(true);
      const result = await services.getCurrentUser();
      if (!isDisposed) {
        setProfile(result);
      }
      setIsLoading(false);
    };

    void load();

    return () => {
      isDisposed = true;
    };
  }, [services]);

  const handleOpenChange = React.useCallback((e: unknown, data: { open: boolean }): void => {
    setOpen(data.open);
    if (data.open) {
      emitNavigationTelemetry({
        action: 'user-menu-open',
        level: 'service'
      });
    }
  }, []);

  const profileUrl = '/_layouts/15/EditProfile.aspx';

  return (
    <div className={styles.headerTool}>
      {isLoading ? (
        <Spinner size="small" />
      ) : (
        <>
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger>
              <button
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-label={strings.UserMenuAriaLabel || 'User menu'}
                className={styles.userProfileButton}
                onClick={() => setOpen(!open)}
                type="button"
              >
                <Avatar
                  name={profile?.displayName || 'User'}
                  image={{ src: profile?.avatarUrl }}
                  size={32}
                />
              </button>
            </PopoverTrigger>

            <PopoverSurface className={styles.userCallout}>
              <div className={styles.userCalloutContent}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--header-border, #edebe9)' }}>
                  <Avatar
                    name={profile?.displayName || 'User'}
                    image={{ src: profile?.avatarUrl }}
                    size={48}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--header-body-text, #323130)' }}>
                      {profile?.displayName || 'User'}
                    </span>
                    {profile?.jobTitle ? (
                      <span style={{ fontSize: '12px', color: 'var(--header-subtext, #605e5c)' }}>{profile.jobTitle}</span>
                    ) : null}
                    {profile?.department ? (
                      <span style={{ fontSize: '12px', color: 'var(--header-subtext, #605e5c)' }}>{profile.department}</span>
                    ) : null}
                  </div>
                </div>

                <div className={styles.userActions} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px' }}>
                  <a
                    className={styles.userActionLink}
                    href={sanitizeUrl(profileUrl) || '#'}
                    onClick={(): void =>
                      emitNavigationTelemetry({
                        action: 'user-profile-click',
                        level: 'service'
                      })
                    }
                  >
                    {strings.MyProfileLabel || 'My profile'}
                  </a>
                  <a
                    className={styles.userActionLink}
                    href={sanitizeUrl('/_layouts/15/SignOut.aspx') || '#'}
                  >
                    {strings.SignOutLabel || 'Sign out'}
                  </a>
                </div>
              </div>
            </PopoverSurface>
          </Popover>
        </>
      )}
    </div>
  );
};

export default React.memo(UserProfileTool);
