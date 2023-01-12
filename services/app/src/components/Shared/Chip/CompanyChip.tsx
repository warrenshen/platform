import { Box } from "@material-ui/core";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { BankCompanyLabel } from "lib/enum";
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
  companyType: String;
}

const CompanyToColor: any = {
  [BankCompanyLabel.ParentCompany]: CompanyChipOrange, // Orange,
  [BankCompanyLabel.Company]: CompanyChipOrange, // Orange,
};

export default function CompanyChip({ companyType }: Props) {
  return (
    <Chip backgroundColor={CompanyToColor[companyType.toString()]}>
      <Box mt={1}>
        <Text textVariant={TextVariants.Label} color={PlainWhite}>
          {companyType as BankCompanyLabel}
        </Text>
      </Box>
    </Chip>
  );
}
