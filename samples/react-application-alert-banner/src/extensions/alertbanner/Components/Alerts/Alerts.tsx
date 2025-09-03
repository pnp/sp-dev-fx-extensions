import * as React from "react";
import { logger } from '../Services/LoggerService';
import { MessageBar, MessageBarBody, MessageBarTitle, tokens } from "@fluentui/react-components";
import styles from "./Alerts.module.scss";
import { IAlertsProps, IAlertType, AlertPriority } from "./IAlerts";
import AlertItem from "../AlertItem/AlertItem";
import AlertSettingsTabs from "../Settings/AlertSettingsTabs";
import { ISettingsData } from "../Settings/Tabs/SettingsTab";
import { EditModeDetector } from "../Utils/EditModeDetector";
import { useAlerts } from "../Context/AlertsContext";
import { StorageService } from "../Services/StorageService";

const Alerts: React.FC<IAlertsProps> = (props) => {
  const { state, initializeAlerts, removeAlert, hideAlertForever } = useAlerts();
  const { alerts, alertTypes, isLoading, hasError, errorMessage } = state;

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isInEditMode, setIsInEditMode] = React.useState(false);
  
  // Carousel settings
  const [carouselEnabled, setCarouselEnabled] = React.useState(false);
  const [carouselInterval, setCarouselInterval] = React.useState(5000); // 5 seconds default
  const carouselTimer = React.useRef<number | null>(null);
  const storageService = React.useRef<StorageService>(StorageService.getInstance());

  // Store initial props to prevent unnecessary re-initialization
  const initialPropsRef = React.useRef<{
    siteIds: string[];
    alertTypesJson: string;
    userTargetingEnabled: boolean;
    notificationsEnabled: boolean;
  } | null>(null);

  // Initialize alerts and edit mode detection on mount
  React.useEffect(() => {
    const currentProps = {
      siteIds: props.siteIds || [],
      alertTypesJson: props.alertTypesJson,
      userTargetingEnabled: props.userTargetingEnabled,
      notificationsEnabled: props.notificationsEnabled,
    };

    // Only initialize if props have actually changed
    if (!initialPropsRef.current || 
        JSON.stringify(initialPropsRef.current) !== JSON.stringify(currentProps)) {
      
      logger.debug('Alerts', 'Initializing alerts with props', currentProps);
      initialPropsRef.current = currentProps;
      
      initializeAlerts({
        graphClient: props.graphClient,
        context: props.context,
        ...currentProps
      });
    } else {
      logger.debug('Alerts', 'Props unchanged, skipping alert re-initialization');
    }

    setIsInEditMode(EditModeDetector.isPageInEditMode());
    const cleanup = EditModeDetector.onEditModeChange(setIsInEditMode);
    return cleanup;
  }, [props.graphClient, JSON.stringify(props.siteIds), props.alertTypesJson, props.userTargetingEnabled, props.notificationsEnabled, initializeAlerts]);

  // Effect to reset index when alerts change
  React.useEffect(() => {
    if (alerts.length > 0 && currentIndex >= alerts.length) {
      setCurrentIndex(alerts.length - 1);
    } else if (alerts.length === 0) {
      setCurrentIndex(0);
    }
  }, [alerts, currentIndex]);

  // Carousel timer effect
  React.useEffect(() => {
    if (carouselEnabled && alerts.length > 1) {
      carouselTimer.current = window.setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % alerts.length);
      }, carouselInterval);
    } else if (carouselTimer.current) {
      window.clearInterval(carouselTimer.current);
      carouselTimer.current = null;
    }

    // Cleanup
    return () => {
      if (carouselTimer.current) {
        window.clearInterval(carouselTimer.current);
      }
    };
  }, [carouselEnabled, carouselInterval, alerts.length]);

  // ✅ STORAGE FIX: Use StorageService instead of direct localStorage access
  React.useEffect(() => {
    const savedCarouselEnabled = storageService.current.getFromLocalStorage<boolean>('carouselEnabled');
    const savedCarouselInterval = storageService.current.getFromLocalStorage<number>('carouselInterval');
    
    if (savedCarouselEnabled) {
      setCarouselEnabled(savedCarouselEnabled);
    }
    if (savedCarouselInterval && savedCarouselInterval >= 2000 && savedCarouselInterval <= 30000) {
      setCarouselInterval(savedCarouselInterval);
    }
  }, []);

  const handleSettingsChange = React.useCallback((settings: ISettingsData) => {
    if (props.onSettingsChange) {
      props.onSettingsChange(settings);
    }
    // The context will handle reloading alert types if they changed via its own logic
  }, [props.onSettingsChange]);

  // Save carousel settings when they change
  React.useEffect(() => {
    storageService.current.saveToLocalStorage('carouselEnabled', carouselEnabled);
  }, [carouselEnabled]);

  React.useEffect(() => {
    storageService.current.saveToLocalStorage('carouselInterval', carouselInterval);
  }, [carouselInterval]);

  // Carousel navigation with useCallback optimization
  const goToNext = React.useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % alerts.length);
  }, [alerts.length]);

  const goToPrevious = React.useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + alerts.length) % alerts.length);
  }, [alerts.length]);

  // Carousel pause functionality with useCallback optimization
  const handleMouseEnter = React.useCallback(() => {
    if (carouselTimer.current) {
      window.clearInterval(carouselTimer.current);
      carouselTimer.current = null;
    }
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    if (carouselEnabled && alerts.length > 1) {
      carouselTimer.current = window.setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % alerts.length);
      }, carouselInterval);
    }
  }, [carouselEnabled, alerts.length, carouselInterval]);

  if (isLoading) {
    return null; // Hide loading, let alerts load silently in the background
  }

  if (hasError) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '100vw',
        margin: '0',
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        backgroundColor: tokens.colorNeutralBackground1,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        fontFamily: tokens.fontFamilyBase,
      }}>
        <MessageBar 
          intent="error"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            borderRadius: tokens.borderRadiusMedium,
            boxShadow: tokens.shadow4,
          }}
        >
          <MessageBarBody>
            <MessageBarTitle style={{ 
              color: tokens.colorPaletteRedForeground1,
              fontWeight: tokens.fontWeightSemibold,
              fontSize: tokens.fontSizeBase300
            }}>
              Unable to Load Alerts
            </MessageBarTitle>
            <div style={{
              marginTop: tokens.spacingVerticalXS,
              fontSize: tokens.fontSizeBase200,
              lineHeight: tokens.lineHeightBase200,
            }}>
              {errorMessage || "An error occurred while loading alerts. Please try refreshing the page or contact your administrator if the problem persists."}
            </div>
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const hasAlerts = alerts.length > 0;

  if (!hasAlerts && !isInEditMode) {
    return null; // Hide component completely if no alerts and not in edit mode
  }

  return (
    <div className={styles.alerts}>
      {hasAlerts && (
        <div 
          className={styles.carousel}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <AlertItem
            key={alerts[currentIndex].id}
            item={alerts[currentIndex]}
            remove={removeAlert}
            hideForever={hideAlertForever}
            alertType={alertTypes[alerts[currentIndex].AlertType] || defaultAlertType}
            isCarousel={true}
            currentIndex={currentIndex + 1}
            totalAlerts={alerts.length}
            onNext={goToNext}
            onPrevious={goToPrevious}
          />
        </div>
      )}
      {isInEditMode && (
        <AlertSettingsTabs
          isInEditMode={isInEditMode}
          alertTypesJson={props.alertTypesJson}
          userTargetingEnabled={props.userTargetingEnabled || false}
          notificationsEnabled={props.notificationsEnabled || false}
          graphClient={props.graphClient}
          context={props.context}
          onSettingsChange={handleSettingsChange}
        />
      )}
    </div>
  );
};

// Define a default alert type in case an alert type is missing
const defaultAlertType: IAlertType = {
  name: "Default",
  iconName: "Info",
  backgroundColor: "#ffffff",
  textColor: "#000000",
  additionalStyles: "",
  priorityStyles: {
    [AlertPriority.Critical]: "border: 2px solid #E81123;",
    [AlertPriority.High]: "border: 1px solid #EA4300;",
    [AlertPriority.Medium]: "",
    [AlertPriority.Low]: "",
  },
};

export default Alerts;
