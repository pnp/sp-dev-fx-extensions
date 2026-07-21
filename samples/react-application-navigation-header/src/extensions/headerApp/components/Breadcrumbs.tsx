import * as React from 'react';
import { ChevronRight16Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { INavigationItem } from '../models/INavigationItem';
import { sanitizeUrl } from '../utils/url';
import { resolveNavigationTrail } from '../utils/navigation';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './Utility.module.scss';

export interface IBreadcrumbsProps {
  strings: IHeaderStrings;
  items: INavigationItem[];
  activePath: string[];
  homeUrl: string;
  homeLabel?: string;
}

const Breadcrumbs: React.FC<IBreadcrumbsProps> = (props) => {
  const { strings, items, activePath, homeUrl, homeLabel } = props;
  const trail = React.useMemo(
    () => [{ id: 'home', label: homeLabel || 'Home', url: homeUrl, children: [], hasChildren: false }, ...resolveNavigationTrail(items, activePath)],
    [activePath, homeLabel, homeUrl, items]
  );

  if (trail.length <= 1) {
    return null;
  }

  return (
    <nav aria-label={strings.BreadcrumbsAriaLabel || 'Breadcrumbs'} className={styles.breadcrumbs}>
      <ol className={styles.breadcrumbsList}>
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          const url = sanitizeUrl(item.url);

          return (
            <li className={styles.breadcrumbsItem} key={item.id}>
              {isLast ? (
                <span aria-current="page" className={styles.breadcrumbsCurrent}>{item.label}</span>
              ) : (
                <a
                  className={styles.breadcrumbsLink}
                  href={url || '#'}
                  onClick={(): void =>
                    emitNavigationTelemetry({
                      action: 'breadcrumb-click',
                      level: 'service',
                      itemId: item.id,
                      itemLabel: item.label
                    })
                  }
                >
                  {item.label}
                </a>
              )}
              {!isLast ? <ChevronRight16Regular className={styles.breadcrumbsSeparator} /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default React.memo(Breadcrumbs);
