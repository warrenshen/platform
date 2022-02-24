import { Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
`;

const Gauge = styled.div`
  position: relative;
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
    color: "rgba(122, 151, 101, 0.15)",
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
  valueFontSize: number;
  caption: string;
  circleSize: number;
}

export default function GaugeProgressBar({
  value,
  valueFontSize,
  caption,
  circleSize,
}: Props) {
  const classes = useStyles();
  const gaugeWidth = circleSize.toString() + "px";
  const valueFont = valueFontSize.toString() + "px";

  return (
    <Container>
      <Gauge
        style={{
          width: gaugeWidth,
          height: gaugeWidth,
        }}
      >
        <BorderCircularBackground
          variant={"determinate"}
          size={circleSize}
          thickness={1}
          value={50}
          className={classes.bottom}
        />
        <BorderCircularProgress
          variant={"determinate"}
          size={circleSize}
          thickness={1}
          value={(value || 0.0) * 0.5}
        />
      </Gauge>
      <Copy>
        <TitleText
          style={{
            fontSize: valueFont,
          }}
        >
          {value !== null ? `${value}%` : "TBD"}
        </TitleText>
        <Typography variant="body1" color="textSecondary">
          {caption}
        </Typography>
      </Copy>
    </Container>
  );
}
