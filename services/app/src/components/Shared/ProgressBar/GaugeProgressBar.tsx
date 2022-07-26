import { Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import styled from "styled-components";

const Container = styled.div<{
  containerWidth: number;
  containerHeight: number;
}>`
  display: flex;
  flex-direction: column;
  justify-content: center;

  position: relative;
  width: ${(props) => props.containerWidth.toString() + "px"};
  height: ${(props) => props.containerHeight.toString() + "px"};
`;

const Gauge = styled.div<{ gaugeWidth: number }>`
  position: absolute;
  top: 0px;
  left: 0px;

  width: ${(props) => props.gaugeWidth.toString() + "px"};
  height: ${(props) => props.gaugeWidth.toString() + "px"};
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

const TitleText = styled(Typography)<{ $fontSize: number; $fontColor: string }>`
  color: ${(props) => props.$fontColor};
  font-size: ${(props) => props.$fontSize.toString() + "px"};
  font-weight: 400;
`;

const green = "rgba(118, 147, 98, 1)";
const orange = "rgba(230, 126, 34, 1)";

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
  underMax: {
    color: green,
  },
  overMax: {
    color: orange,
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
  containerWidth: number;
  containerHeight?: number;
}

export default function GaugeProgressBar({
  value,
  valueFontSize,
  caption,
  containerWidth,
  containerHeight,
}: Props) {
  const classes = useStyles();

  const isOverMax = !!value && value > 100;
  const cappedValue = !value ? 0.0 : isOverMax ? 100.0 : value;

  return (
    <Container
      containerWidth={containerWidth}
      containerHeight={containerHeight || containerWidth}
    >
      <Gauge gaugeWidth={containerWidth}>
        <BorderCircularBackground
          variant={"determinate"}
          size={containerWidth}
          thickness={1}
          value={50}
          className={classes.bottom}
        />
        <BorderCircularProgress
          variant={"determinate"}
          size={containerWidth}
          thickness={1}
          value={cappedValue * 0.5}
          className={!!isOverMax ? classes.overMax : ""}
        />
      </Gauge>
      <Copy>
        <TitleText
          $fontSize={valueFontSize}
          $fontColor={!!isOverMax ? orange : green}
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
