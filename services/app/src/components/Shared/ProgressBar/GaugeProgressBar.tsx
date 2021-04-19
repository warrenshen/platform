import { Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
`;

const Gauge = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  transform: rotate(-90deg);
`;

const Copy = styled.div`
  width: 100%;
  height: 100%;

  position: absolute;
  top: 0px;
  left: 0px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const TitleText = styled(Typography)`
  color: rgba(118, 147, 98, 1);
  font-size: 40px;
  font-weight: 400;
`;

const BorderCircularProgress = withStyles((theme) => ({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 5,
  },
  circle: {
    strokeLinecap: "round",
  },
}))(CircularProgress);

const BorderCircularBackground = withStyles((theme) => ({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 5,
  },
  circle: {
    strokeLinecap: "round",
  },
}))(CircularProgress);

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  bottom: {
    color: theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
  },
  top: {
    color: "#1a90ff",
    animationDuration: "550ms",
    position: "absolute",
    left: 0,
  },
  circle: {
    strokeLinecap: "round",
  },
}));

interface Props {
  value: number | null;
}

export default function GaugeProgressBar({ value }: Props) {
  const classes = useStyles();

  return (
    <Container>
      <Gauge>
        <BorderCircularBackground
          variant={"determinate"}
          size={300}
          thickness={1}
          value={50}
          className={classes.bottom}
        />
        <BorderCircularProgress
          variant={"determinate"}
          size={300}
          thickness={1}
          value={(value || 0.0) * 0.5}
        />
      </Gauge>
      <Copy>
        <TitleText>{value !== null ? `${value}%` : "TBD"}</TitleText>
        <Typography variant="body1" color="textSecondary">
          Borrowing Limit Used
        </Typography>
      </Copy>
    </Container>
  );
}
