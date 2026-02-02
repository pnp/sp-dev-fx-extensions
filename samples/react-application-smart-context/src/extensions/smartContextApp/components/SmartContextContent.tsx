import * as React from 'react';
import { Text, Icon } from '@fluentui/react';
import styles from './SmartContextContent.module.scss';
import { ISmartContextData } from '../services/ICopilotService';
import {
  Section,
  TldrItem,
  PersonItem,
  AttributionItem,
  PendingActionItem,
  KeyDecisionItem,
  TimelineItem,
  MyRoleCard,
  SmartContextHeader,
  SmartContextFooter
} from './sections';

export interface ISmartContextContentProps {
  data: ISmartContextData;
}

const MAX_ATTRIBUTIONS_VISIBLE = 10;

export const SmartContextContent: React.FC<ISmartContextContentProps> = (props) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [showAllAttributions, setShowAllAttributions] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [props.data]);

  const parsedData = props.data;

  // Prepare items for each section
  const pendingActionItems = (parsedData.pendingActions || []).map((action, index) => (
    <PendingActionItem key={index} action={action} index={index} />
  ));
  
  const keyDecisionItems = (parsedData.keyDecisions || []).map((decision, index) => (
    <KeyDecisionItem key={index} decision={decision} index={index} />
  ));
  
  const timelineItems = (parsedData.timeline || []).map((event, index) => (
    <TimelineItem 
      key={index} 
      event={event} 
      index={index} 
      isLast={index === (parsedData.timeline?.length || 0) - 1} 
    />
  ));
  
  const tldrItems = (parsedData.tldr || []).map((item, index) => (
    <TldrItem key={index} item={item} index={index} />
  ));
  
  const peopleItems = (parsedData.people || []).map((person, index) => (
    <PersonItem key={index} person={person} index={index} />
  ));
  
  const allAttributions = (parsedData.attributions || [])
    .filter(item => item.attributionType === 'citation');
  
  // Separate by attributionSource: model (high relevance) vs grounding (related)
  const sourceAttributions = allAttributions.filter(item => item.attributionSource === 'model');
  const relatedAttributions = allAttributions.filter(item => item.attributionSource === 'grounding');
  
  // Combine into grouped items with sub-headers
  const attributionItems: React.ReactElement[] = [];
  
  if (sourceAttributions.length > 0) {
    attributionItems.push(
      <div key="sources-header" className={styles.attributionGroupHeader}>
        <Icon iconName="DocumentSet" />
        <Text>Sources</Text>
      </div>
    );
    sourceAttributions.forEach((item, index) => {
      attributionItems.push(
        <AttributionItem key={`source-${index}`} item={item} index={index} />
      );
    });
  }
  
  if (relatedAttributions.length > 0) {
    const visibleRelated = showAllAttributions 
      ? relatedAttributions 
      : relatedAttributions.slice(0, MAX_ATTRIBUTIONS_VISIBLE);
    
    attributionItems.push(
      <div key="related-header" className={styles.attributionGroupHeader}>
        <Icon iconName="Link" />
        <Text>Related</Text>
      </div>
    );
    visibleRelated.forEach((item, index) => {
      attributionItems.push(
        <AttributionItem key={`related-${index}`} item={item} index={sourceAttributions.length + index} />
      );
    });
  }
  
  const hasMoreAttributions = relatedAttributions.length > MAX_ATTRIBUTIONS_VISIBLE;
  const visibleRelatedCount = showAllAttributions 
    ? relatedAttributions.length 
    : Math.min(relatedAttributions.length, MAX_ATTRIBUTIONS_VISIBLE);
  const remainingCount = relatedAttributions.length - visibleRelatedCount;

  return (
    <div className={`${styles.smartContextContent} ${isVisible ? styles.visible : ''}`}>
      <SmartContextHeader />

      {parsedData.myRole && <MyRoleCard myRole={parsedData.myRole} />}

      <div className={styles.sectionsContainer}>
        {pendingActionItems.length > 0 && (
          <Section
            title="Pending Actions"
            icon="TaskList"
            description="Items that may need your attention"
            items={pendingActionItems}
            isEmpty={false}
            className={styles.pendingActions}
            animationIndex={0}
          />
        )}
        
        <Section
          title="TLDR"
          icon="Lightbulb"
          description="Key insights at a glance"
          items={tldrItems}
          isEmpty={tldrItems.length === 0}
          className={styles.tldr}
          animationIndex={1}
        />
        
        {keyDecisionItems.length > 0 && (
          <Section
            title="Key Decisions"
            icon="DecisionSolid"
            description="Important decisions made"
            items={keyDecisionItems}
            isEmpty={false}
            className={styles.keyDecisions}
            animationIndex={2}
          />
        )}
        
        {timelineItems.length > 0 && (
          <Section
            title="Activity Timeline"
            icon="Timeline"
            description="Recent activity and events"
            items={timelineItems}
            isEmpty={false}
            className={styles.timeline}
            animationIndex={3}
          />
        )}
        
        <Section
          title="People"
          icon="People"
          description="Relevant people from your network"
          items={peopleItems}
          isEmpty={peopleItems.length === 0}
          className={styles.people}
          animationIndex={4}
        />
        
        <Section
          title="References"
          icon="Library"
          description="Sources and related content"
          items={attributionItems}
          isEmpty={attributionItems.length === 0}
          className={styles.content}
          animationIndex={5}
          showMoreButton={{
            hasMore: hasMoreAttributions,
            isExpanded: showAllAttributions,
            onToggle: () => setShowAllAttributions(!showAllAttributions),
            remainingCount: remainingCount
          }}
        />
      </div>

      <SmartContextFooter />
    </div>
  );
};
