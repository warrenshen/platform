import { Box, TextField } from "@material-ui/core";
import CompanyLicensesDataGrid from "components/CompanyLicenses/CompanyLicensesDataGrid";
import { useGetAllCompanyLicensesQuery } from "generated/graphql";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function CannabisLicensesTab() {
  const [licenseNumber, setLicenseNumber] = useState("");

  const { data } = useGetAllCompanyLicensesQuery({
    fetchPolicy: "network-only",
    variables: {
      license_number: licenseNumber,
    },
  });

  const companyLicenses = data?.company_licenses || [];

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box display="flex">
          <TextField
            label="License Number"
            value={licenseNumber}
            onChange={({ target: { value } }) => setLicenseNumber(value)}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <CompanyLicensesDataGrid companyLicenses={companyLicenses} />
      </Box>
    </Container>
  );
}
