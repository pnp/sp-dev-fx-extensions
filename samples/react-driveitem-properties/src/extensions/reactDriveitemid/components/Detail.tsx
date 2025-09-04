import { Button, Text } from "@fluentui/react-components";
import { CheckmarkFilled, CopyRegular } from "@fluentui/react-icons";
import * as React from "react";

export const Detail = (props: {
  value: string | undefined;
  label: string;
}): JSX.Element => {
  const [copied, setCopied] = React.useState<boolean>(false);
  const { value, label } = props;
  React.useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  }, [copied]);

  const onCopyClick = async (): Promise<void> => {
    await navigator.clipboard
      .writeText(value!)
      .then(() => {
        setCopied(true);
      })
      .catch((reason) => {
        console.log(reason);
        setCopied(false);
      });
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 10,
      }}
    >
      <Text>
        {label}: {value}
      </Text>
      {value && (
        <Button
          icon={!copied ? <CopyRegular /> : <CheckmarkFilled />}
          appearance="transparent"
          onClick={onCopyClick}
        />
      )}
    </div>
  );
};
