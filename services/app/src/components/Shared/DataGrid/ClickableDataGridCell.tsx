import { Box, Button, Link, makeStyles } from "@material-ui/core";
import { PrimaryDefaultColor } from "components/Shared/Colors/GlobalColors";
//import { Link } from "react-router-dom";
import styled from "styled-components";

const ButtonText = styled.span<{ $useNewColor?: boolean }>`
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
  Icon?: any;
  onClick?: () => void;
}

export default function ClickableDataGridCell({
  dataCy,
  label,
  url,
  Icon,
  onClick,
}: Props) {
  const classes = useStyles();

  return !!url ? (
    <Box display="flex">
      <Box mr={1}>{!!Icon && <Icon />}</Box>
      <Box mt="3px">
        <Link data-cy={dataCy} href={url} style={{ textDecoration: "none" }}>
          <ButtonText>{label}</ButtonText>
        </Link>
      </Box>
    </Box>
  ) : (
    <Box display="flex">
      <Box mr={1}>{!!Icon && <Icon />}</Box>
      <Box mt="3px">
        <Button
          data-cy={dataCy}
          className={classes.clickableCell}
          onClick={onClick}
        >
          <ButtonText>{label}</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
