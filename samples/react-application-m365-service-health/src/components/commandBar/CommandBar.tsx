import { Button, Divider, } from "@fluentui/react-components";

import { ICommandBarProps } from "./ICommandBarProps";
import React from "react";
import Stack from "../stack/Stack";

export const CommandBar: React.FC<ICommandBarProps> = ({ options, className, style, faritems }) => {
  return (
    <>
      <Stack
        direction="horizontal"
        gap={"s"}
        className={className}
        style={style}
      >
        {options.map((option, index) => (
           
          <Button
            key={index}
            appearance={option?.appearance ?? "subtle"}
            icon={option.icon}
            onClick={option.onClick}
            disabled={option.disabled}
            style={option.style}
            className={option.className}
          >
            {option.label}
          </Button>
         
        ))}
        <Stack direction="horizontal" gap={"s"} justifyContent="end" width={"100%"}>
          {faritems &&
            faritems.map((option, index) => (
                
              <Button
                key={index}
                appearance={option?.appearance ?? "subtle"}
                icon={option.icon}
                onClick={option.onClick}
                disabled={option.disabled}
                style={option.style}
                className={option.className}
              >
                {option.label ? option.label : <></>}
              </Button>
            ))}
        </Stack>
      </Stack>

      <Divider />
    </>
  );
};

export default CommandBar;
