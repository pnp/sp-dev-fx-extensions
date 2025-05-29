import { makeStyles } from '@fluentui/react-components';

export const useStyles = makeStyles({
  dialog: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    maxHeight: "600px",
    padding: 0,
  },
  dialogBody: {
    height: "calc(100% - 200px)",
  },
});
