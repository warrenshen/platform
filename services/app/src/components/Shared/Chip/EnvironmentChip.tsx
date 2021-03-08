import Chip from "components/Shared/Chip";

function EnvironmentChip() {
  switch (process.env.REACT_APP_BESPOKE_ENVIRONMENT) {
    case "production":
      return null;
    case "staging":
      return <Chip color={"white"} background={"#3498db"} label={"STAGING"} />;
    case "development":
    default:
      return <Chip color={"white"} background={"#2ecc71"} label={"LOCAL"} />;
  }
}

export default EnvironmentChip;
