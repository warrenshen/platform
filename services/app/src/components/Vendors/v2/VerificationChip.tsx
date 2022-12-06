import { Box } from "@material-ui/core";
import {
  ApproveBlue,
  ApproveBlueBackground,
  UnverifiedRed,
  UnverifiedRedBackground,
} from "components/Shared/Colors/GlobalColors";
import { ReactComponent as CheckmarkIcon } from "components/Shared/Layout/Icons/Checkmark.svg";
import { ReactComponent as CrossMarkIcon } from "components/Shared/Layout/Icons/CrossMark.svg";
import Text, { TextVariants } from "components/Shared/Text/Text";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Chip = styled.div<{ $backgroundColor: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.$backgroundColor};

  height: 36px;
  width: 70px;
  left: 862px;
  top: 8px;
  border-radius: 4px;
  padding: 6px 8px 6px 8px;
`;

export default function VerificationChip({ value }: { value: any }) {
  const isVerified = !!value;

  const label = isVerified ? "Yes" : "No";

  return (
    <Wrapper>
      <Chip
        $backgroundColor={
          isVerified ? ApproveBlueBackground : UnverifiedRedBackground
        }
      >
        {isVerified ? <CheckmarkIcon /> : <CrossMarkIcon />}
        <Box mt={1} ml={1}>
          <Text
            color={isVerified ? ApproveBlue : UnverifiedRed}
            textVariant={TextVariants.Label}
          >
            {label}
          </Text>
        </Box>
      </Chip>
    </Wrapper>
  );
}
