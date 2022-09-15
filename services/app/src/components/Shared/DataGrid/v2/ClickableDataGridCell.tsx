import { Button, makeStyles } from "@material-ui/core";
import { PrimaryDefaultColor } from "components/Shared/Colors/GlobalColors";
import { Link } from "react-router-dom";
import styled from "styled-components";

const ButtonText = styled.span`
  width: 100%;
  height: 20px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${PrimaryDefaultColor};
`;

const useStyles = makeStyles({
  clickableCell: {
    justifyContent: "flex-start",
    alignItems: "center",

    width: "100%",
    height: 40,
    minWidth: 0,
    padding: "4px 6px",

    color: "var(--table-accent-color)",
    textAlign: "left",
    textTransform: "initial",
    "&:hover": {
      background: "none",
    },
    overflow: "hidden",
  },
});

interface Props {
  dataCy?: string;
  label: string;
  url?: string;
  onClick?: () => void;
}

export default function ClickableDataGridCell({
  dataCy,
  label,
  url,
  onClick,
}: Props) {
  const classes = useStyles();

  return (
    <Button
      data-cy={dataCy}
      className={classes.clickableCell}
      {...(url ? { component: Link, to: url } : {})}
      onClick={onClick}
    >
      <ButtonText>{label}</ButtonText>
    </Button>
  );
}
