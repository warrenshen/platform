import { Box } from "@material-ui/core";
import CompanyLicenseDrawer from "components/CompanyLicenses/CompanyLicenseDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { CompanyLicenseFragment } from "generated/graphql";
import { useState } from "react";

interface Props {
  label: string;
  companyLicense: CompanyLicenseFragment;
}

export default function CompanyLicenseDrawerLauncher({
  label,
  companyLicense,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <CompanyLicenseDrawer
          companyLicense={companyLicense}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </Box>
  );
}
