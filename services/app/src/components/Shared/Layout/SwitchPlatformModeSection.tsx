import { Box } from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import CardDivider from "components/Shared/Card/CardDivider";
import Text, { TextVariants } from "components/Shared/Text/Text";

interface Props {
  label: string;
  buttonText: string;
  onClick: () => void;
}

const SwitchPlatformModeSection = ({ label, buttonText, onClick }: Props) => {
  return (
    <Box>
      <Box mx={3}>
        <CardDivider marginBottom={"8px"} />
        <Text textVariant={TextVariants.Label} alignment={"center"}>
          {label}
        </Text>
      </Box>
      <Box mx={1.5} mb={1}>
        <PrimaryButton
          width={"100%"}
          text={buttonText}
          onClick={onClick}
          margin={"0px"}
        />
      </Box>
      <Box mx={3}>
        <CardDivider marginBottom={"16px"} />
      </Box>
    </Box>
  );
};

export default SwitchPlatformModeSection;
