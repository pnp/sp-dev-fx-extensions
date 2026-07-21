import * as React from 'react';
import {
  Search20Regular,
  History20Regular,
  Person20Regular,
  Alert20Regular,
  Apps20Regular,
  Globe20Regular,
  Settings20Regular,
  Emoji20Regular,
  Print20Regular,
  ArrowUp20Regular,
  Accessibility20Regular,
  List20Regular,
  Document20Regular,
  Tag20Regular,
  ChartMultiple20Regular,
  OrganizationHorizontal20Regular,
  MoreHorizontal20Regular,
  Question20Regular,
  Home20Regular,
  FlashRegular,
  Chat20Regular,
  Mail20Regular,
  Calendar20Regular,
  Star20Regular,
  Bookmark20Regular,
  Grid20Regular
} from '@fluentui/react-icons';

const DynamicIconExtended = React.lazy(() => import(/* webpackChunkName: 'header-icons-extended' */ './DynamicIconExtended'));

export interface IDynamicIconProps {
  iconName?: string;
  className?: string;
}

export const DynamicIcon: React.FC<IDynamicIconProps> = ({ iconName, className }) => {
  if (!iconName) {
    return null;
  }

  const normalized = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');

  switch (normalized) {
    case 'search':
      return <Search20Regular className={className} />;
    case 'querylist':
    case 'history':
      return <History20Regular className={className} />;
    case 'contact':
    case 'person':
      return <Person20Regular className={className} />;
    case 'ringer':
    case 'alert':
      return <Alert20Regular className={className} />;
    case 'appicondefault':
    case 'waffle':
      return <Apps20Regular className={className} />;
    case 'grid':
    case 'tiles':
      return <Grid20Regular className={className} />;
    case 'lightningbolt':
    case 'flash':
      return <FlashRegular className={className} />;
    case 'localelanguage':
    case 'globe':
      return <Globe20Regular className={className} />;
    case 'bookmark':
    case 'singlebookmark':
    case 'singlebookmarksolid':
      return <Bookmark20Regular className={className} />;
    case 'favoritestar':
    case 'star':
      return <Star20Regular className={className} />;
    case 'settings':
      return <Settings20Regular className={className} />;
    case 'help':
      return <Question20Regular className={className} />;
    case 'feedback':
    case 'emoji':
      return <Emoji20Regular className={className} />;
    case 'print':
      return <Print20Regular className={className} />;
    case 'uparrow':
    case 'up':
      return <ArrowUp20Regular className={className} />;
    case 'accessibility':
      return <Accessibility20Regular className={className} />;
    case 'bulletedlistbullets':
    case 'list':
      return <List20Regular className={className} />;
    case 'page':
    case 'document':
    case 'worddocument':
    case 'word':
    case 'outlooklogo':
    case 'outlook':
    case 'sharepointlogo':
    case 'sharepoint':
      return <Document20Regular className={className} />;
    case 'tag':
      return <Tag20Regular className={className} />;
    case 'chart':
    case 'chartmultiple':
      return <ChartMultiple20Regular className={className} />;
    case 'bulletedtreelist':
    case 'organizationhorizontal':
      return <OrganizationHorizontal20Regular className={className} />;
    case 'more':
    case 'morehorizontal':
      return <MoreHorizontal20Regular className={className} />;
    case 'home':
      return <Home20Regular className={className} />;
    case 'mail':
      return <Mail20Regular className={className} />;
    case 'calendar':
      return <Calendar20Regular className={className} />;
    case 'message':
    case 'chat':
    case 'teamslogo':
    case 'teams':
      return <Chat20Regular className={className} />;
    default:
      return (
        <React.Suspense fallback={<Document20Regular className={className} />}>
          <DynamicIconExtended normalizedName={normalized} className={className} />
        </React.Suspense>
      );
  }
};
