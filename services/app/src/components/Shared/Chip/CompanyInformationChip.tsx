import { Box } from "@material-ui/core";
import Text, { TextVariants } from "components/Shared/Text/Text";
import styled from "styled-components";

import { CompanyChipOrange, PlainWhite } from "../Colors/GlobalColors";

const Chip = styled.div<{ backgroundColor: string }>`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 1;

  width: fit-content;
  height: 30px;
  padding: 2px 17px;
  border-radius: 4px;
  background-color: ${(props) => props.backgroundColor};
  color: white;
`;

interface Props {
  labelText: string;
}

export default function CompanyInformationChip({ labelText }: Props) {
  return (
    <Chip backgroundColor={CompanyChipOrange}>
      <Box mt={1}>
        <Text textVariant={TextVariants.Label} color={PlainWhite}>
          {labelText}
        </Text>
      </Box>
    </Chip>
  );
}
