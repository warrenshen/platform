import { Box, TextField } from "@material-ui/core";
import CompanyLicensesDataGrid from "components/CompanyLicenses/CompanyLicensesDataGrid";
import { useGetAllCompanyLicensesQuery } from "generated/graphql";
import { useState, useMemo } from "react";
import styled from "styled-components";
import { filter } from "lodash";

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
  });

  const companyLicenses = useMemo(() => {
    const filteredCompanyLicenses = filter(
      data?.company_licenses || [],
      (companyLicense: any) =>
        companyLicense.license_number
          .toLowerCase()
          .indexOf(licenseNumber.toLowerCase()) >= 0
    );
    return filteredCompanyLicenses;
  }, [licenseNumber, data?.company_licenses]);

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
