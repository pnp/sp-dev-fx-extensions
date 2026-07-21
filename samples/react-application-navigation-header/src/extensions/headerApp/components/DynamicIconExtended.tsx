import * as React from 'react';
import {
  Document20Regular,
  Key20Regular,
  LockClosed20Regular,
  LockOpen20Regular,
  Shield20Regular,
  Warning20Regular,
  Info20Regular,
  CheckmarkCircle20Regular,
  DismissCircle20Regular,
  Heart20Regular,
  Cloud20Regular,
  Send20Regular,
  People20Regular,
  Group20Regular,
  Phone20Regular,
  Video20Regular,
  Camera20Regular,
  PhotoFilter20Regular,
  Location20Regular,
  Pin20Regular,
  Gift20Regular,
  ShoppingBag20Regular,
  Money20Regular,
  Trophy20Regular,
  Sparkle20Regular,
  Lightbulb20Regular,
  Toolbox20Regular,
  Rocket20Regular,
  CompassNorthwest20Regular,
  Flag20Regular,
  Building20Regular,
  Briefcase20Regular,
  HatGraduation20Regular,
  Book20Regular,
  News20Regular,
  Database20Regular,
  Server20Regular,
  Code20Regular,
  ChevronRight20Regular,
  ChevronLeft20Regular,
  ChevronUp20Regular,
  ChevronDown20Regular,
  DocumentPdf20Regular,
  Notebook20Regular,
  Add20Regular,
  Delete20Regular,
  Edit20Regular,
  Save20Regular,
  Share20Regular,
  ArrowDownload20Regular,
  ArrowUpload20Regular,
  Copy20Regular,
  Filter20Regular,
  ArrowClockwise20Regular,
  Play20Regular,
  Pause20Regular,
  Stop20Regular,
  Speaker120Regular,
  MicrophoneChat20Regular,
  MusicNote120Regular,
  DocumentFolder20Regular,
  Link20Regular,
  Grid20Regular,
  Eye20Regular
} from '@fluentui/react-icons';

export interface IDynamicIconExtendedProps {
  normalizedName: string;
  className?: string;
}

const DynamicIconExtended: React.FC<IDynamicIconExtendedProps> = ({ normalizedName, className }) => {
  switch (normalizedName) {
    case 'key':
      return <Key20Regular className={className} />;
    case 'lock':
      return <LockClosed20Regular className={className} />;
    case 'unlock':
      return <LockOpen20Regular className={className} />;
    case 'shield':
      return <Shield20Regular className={className} />;
    case 'warning':
      return <Warning20Regular className={className} />;
    case 'info':
      return <Info20Regular className={className} />;
    case 'completed':
    case 'check':
      return <CheckmarkCircle20Regular className={className} />;
    case 'cancel':
    case 'close':
      return <DismissCircle20Regular className={className} />;
    case 'heart':
    case 'like':
      return <Heart20Regular className={className} />;
    case 'cloud':
      return <Cloud20Regular className={className} />;
    case 'send':
      return <Send20Regular className={className} />;
    case 'people':
      return <People20Regular className={className} />;
    case 'group':
      return <Group20Regular className={className} />;
    case 'phone':
      return <Phone20Regular className={className} />;
    case 'video':
      return <Video20Regular className={className} />;
    case 'camera':
    case 'frontcamera':
      return <Camera20Regular className={className} />;
    case 'photo2':
    case 'photo':
      return <PhotoFilter20Regular className={className} />;
    case 'mapPin':
    case 'location':
      return <Location20Regular className={className} />;
    case 'pin':
      return <Pin20Regular className={className} />;
    case 'giftcard':
    case 'gift':
      return <Gift20Regular className={className} />;
    case 'shoppingcart':
    case 'cart':
      return <ShoppingBag20Regular className={className} />;
    case 'money':
    case 'finance':
      return <Money20Regular className={className} />;
    case 'trophy':
      return <Trophy20Regular className={className} />;
    case 'specialevent':
    case 'sparkles':
      return <Sparkle20Regular className={className} />;
    case 'lightbulb':
    case 'idea':
      return <Lightbulb20Regular className={className} />;
    case 'developertools':
    case 'tools':
      return <Toolbox20Regular className={className} />;
    case 'rocket':
      return <Rocket20Regular className={className} />;
    case 'compassnw':
    case 'compass':
      return <CompassNorthwest20Regular className={className} />;
    case 'flag':
      return <Flag20Regular className={className} />;
    case 'officebuilding':
    case 'building':
      return <Building20Regular className={className} />;
    case 'work':
    case 'briefcase':
      return <Briefcase20Regular className={className} />;
    case 'education':
      return <HatGraduation20Regular className={className} />;
    case 'bookanswers':
    case 'book':
      return <Book20Regular className={className} />;
    case 'news':
      return <News20Regular className={className} />;
    case 'database':
      return <Database20Regular className={className} />;
    case 'server':
      return <Server20Regular className={className} />;
    case 'filecode':
    case 'code':
      return <Code20Regular className={className} />;
    case 'chevronright':
      return <ChevronRight20Regular className={className} />;
    case 'chevronleft':
      return <ChevronLeft20Regular className={className} />;
    case 'chevronup':
      return <ChevronUp20Regular className={className} />;
    case 'chevrondown':
      return <ChevronDown20Regular className={className} />;
    case 'exceldocument':
    case 'excel':
    case 'powerpointdocument':
    case 'powerpoint':
    case 'pdf':
      return <DocumentPdf20Regular className={className} />;
    case 'worddocument':
    case 'word':
      return <Document20Regular className={className} />;
    case 'onenotedocument':
    case 'onenote':
      return <Notebook20Regular className={className} />;
    case 'outlooklogo':
    case 'outlook':
      return <Document20Regular className={className} />;
    case 'sharepointlogo':
    case 'sharepoint':
      return <Document20Regular className={className} />;
    case 'add':
    case 'plus':
      return <Add20Regular className={className} />;
    case 'delete':
    case 'trash':
      return <Delete20Regular className={className} />;
    case 'edit':
    case 'pencil':
      return <Edit20Regular className={className} />;
    case 'save':
    case 'disk':
      return <Save20Regular className={className} />;
    case 'share':
      return <Share20Regular className={className} />;
    case 'download':
      return <ArrowDownload20Regular className={className} />;
    case 'upload':
      return <ArrowUpload20Regular className={className} />;
    case 'copy':
      return <Copy20Regular className={className} />;
    case 'filter':
      return <Filter20Regular className={className} />;
    case 'refresh':
    case 'sync':
      return <ArrowClockwise20Regular className={className} />;
    case 'play':
      return <Play20Regular className={className} />;
    case 'pause':
      return <Pause20Regular className={className} />;
    case 'circlestop':
    case 'stop':
      return <Stop20Regular className={className} />;
    case 'volume3':
    case 'volume':
      return <Speaker120Regular className={className} />;
    case 'microphone':
      return <MicrophoneChat20Regular className={className} />;
    case 'musicinfocus':
    case 'music':
      return <MusicNote120Regular className={className} />;
    case 'folderhorizontal':
    case 'folder':
      return <DocumentFolder20Regular className={className} />;
    case 'link':
      return <Link20Regular className={className} />;
    case 'tiles':
      return <Grid20Regular className={className} />;
    case 'redeye':
    case 'view':
    case 'eye':
      return <Eye20Regular className={className} />;
    default:
      return <Document20Regular className={className} />;
  }
};

export default DynamicIconExtended;
