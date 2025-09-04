import * as React from 'react';
import { CheckmarkCircle24Filled, CircleSmall24Regular, ErrorCircle24Filled } from '@fluentui/react-icons';
import { Spinner } from '@fluentui/react-components';
import styles from './ProgressIndicator.module.scss';

export enum StepStatus {
  Pending = 'pending',
  InProgress = 'in-progress', 
  Completed = 'completed',
  Failed = 'failed'
}

export interface IProgressStep {
  id: string;
  name: string;
  description?: string;
  status: StepStatus;
  error?: string;
}

export interface IProgressIndicatorProps {
  steps: IProgressStep[];
  title?: string;
  showStepDescriptions?: boolean;
  variant?: 'horizontal' | 'vertical';
}

/**
 * Progress indicator component for multi-step operations
 */
const ProgressIndicator: React.FC<IProgressIndicatorProps> = ({ 
  steps, 
  title = 'Progress',
  showStepDescriptions = false,
  variant = 'vertical'
}) => {
  const completedSteps = steps.filter(step => step.status === StepStatus.Completed).length;
  const failedSteps = steps.filter(step => step.status === StepStatus.Failed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const getStepIcon = (step: IProgressStep): JSX.Element => {
    switch (step.status) {
      case StepStatus.Completed:
        return <CheckmarkCircle24Filled className={styles.completedIcon} />;
      case StepStatus.InProgress:
        return <Spinner size="tiny" />;
      case StepStatus.Failed:
        return <ErrorCircle24Filled className={styles.failedIcon} />;
      case StepStatus.Pending:
      default:
        return <CircleSmall24Regular className={styles.pendingIcon} />;
    }
  };

  const getStepClassName = (step: IProgressStep): string => {
    const baseClass = styles.step;
    switch (step.status) {
      case StepStatus.Completed:
        return `${baseClass} ${styles.completed}`;
      case StepStatus.InProgress:
        return `${baseClass} ${styles.inProgress}`;
      case StepStatus.Failed:
        return `${baseClass} ${styles.failed}`;
      case StepStatus.Pending:
      default:
        return `${baseClass} ${styles.pending}`;
    }
  };

  return (
    <div className={`${styles.progressIndicator} ${styles[variant]}`}>
      {/* Header with title and overall progress */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.summary}>
            {failedSteps > 0 ? (
              <span className={styles.errorSummary}>
                {failedSteps} of {totalSteps} steps failed
              </span>
            ) : (
              <span className={styles.progressSummary}>
                {completedSteps} of {totalSteps} steps completed
              </span>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className={styles.stepsList}>
        {steps.map((step, index) => (
          <div key={step.id} className={getStepClassName(step)}>
            <div className={styles.stepIndicator}>
              {getStepIcon(step)}
              {variant === 'vertical' && index < steps.length - 1 && (
                <div className={styles.stepConnector} />
              )}
            </div>
            
            <div className={styles.stepContent}>
              <div className={styles.stepName}>
                {step.name}
              </div>
              
              {showStepDescriptions && step.description && (
                <div className={styles.stepDescription}>
                  {step.description}
                </div>
              )}
              
              {step.status === StepStatus.Failed && step.error && (
                <div className={styles.stepError}>
                  Error: {step.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;