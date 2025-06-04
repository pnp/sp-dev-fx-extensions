import * as React from "react";

import { IHealthServices, Issue } from "../../models/IServiceHealthResults";
import { format, parseISO } from "date-fns";

import { IIssueInformationProps } from "./IIssueInformationProps";
import { Icon } from "@iconify/react";
import { RenderLabel } from "../RenderLabel";
import Stack from "../stack/Stack";
import { StatusIndicator } from "../statusIndicator/StatusIndicator";
import TypographyControl from "../typographyControl/TypographyControl";
import strings from "M365ServiceHealthApplicationCustomizerStrings";
import { tokens } from "@fluentui/react-components";
import { useUtils } from "../../hooks/useUtils";

export const IssueInformation: React.FunctionComponent<
  IIssueInformationProps
> = (props: React.PropsWithChildren<IIssueInformationProps>) => {
  const { healthService } = props;
  const { getStatusLabel } = useUtils();

  const getIssueFromSelectedItem = React.useCallback(
    (selectedItem: IHealthServices): Issue => {
      return selectedItem.issues.find((issue) => !issue.endDateTime) as Issue;
    },
    []
  );

  const {
    id,
    title,

    classification,
    startDateTime,
    endDateTime,
    impactDescription,
  } = getIssueFromSelectedItem(healthService);

  return (
    <Stack rowGap="15px">
      <Stack rowGap="0px">
        <RenderLabel
          label={strings.IssueId}
          icon={<Icon icon="ix:id" color={tokens.colorBrandBackground} />}
        />
        <TypographyControl>{id}</TypographyControl>
      </Stack>

      <Stack rowGap="0px">
        <RenderLabel
          label={strings.IssueTitle}
          icon={
            <Icon
              icon="fluent:slide-text-title-16-regular"
              color={tokens.colorBrandBackground}
            />
          }
        />
        <TypographyControl>{title}</TypographyControl>
      </Stack>

      <Stack rowGap="6px">
        <RenderLabel
          label={strings.IssueStatus}
          icon={
            <Icon
              icon={"fluent:status-48-regular"}
              color={tokens.colorBrandBackground}
            />
          }
        />
        <Stack direction="horizontal" gap="5px">
          <StatusIndicator status={healthService.status} />
          <TypographyControl>
            {getStatusLabel(healthService.status)}
          </TypographyControl>
        </Stack>
      </Stack>

      <Stack rowGap="0px">
        <RenderLabel
          label={strings.IssueStartDate}
          icon={
            <Icon
              icon={"fluent:calendar-date-20-regular"}
              color={tokens.colorBrandBackground}
            />
          }
        />
        <TypographyControl>
          {startDateTime &&
            format(parseISO(startDateTime), "MMMM dd, yyyy HH:mm:ss")}
        </TypographyControl>
      </Stack>

      <Stack rowGap="0px">
        <RenderLabel
          label={strings.IssueEndDate}
          icon={
            <Icon
              icon={"fluent:calendar-date-20-regular"}
              color={tokens.colorBrandBackground}
            />
          }
        />
        <TypographyControl>
          {endDateTime &&
            format(parseISO(endDateTime), "MMMM dd, yyyy HH:mm:ss")}
        </TypographyControl>
      </Stack>

      <Stack rowGap="0px">
        <RenderLabel
          label={strings.IssueImpactDescription}
          icon={
            <Icon
              icon={"fluent:text-description-20-regular"}
              color={tokens.colorBrandBackground}
            />
          }
        />
        <TypographyControl>{impactDescription}</TypographyControl>
      </Stack>
      <Stack rowGap="0px">
        <RenderLabel
          label={strings.IssueClassification}
          icon={
            <Icon
              icon={"carbon:classification"}
              color={tokens.colorBrandBackground}
            />
          }
        />
        <TypographyControl>{classification}</TypographyControl>
      </Stack>
    </Stack>
  );
};
