import { Box } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { ParentCompanies } from "generated/graphql";

import ManageParentCompanyUsersArea from "./ManageParentCompanySettingsArea";

interface Props {
  companyId: ParentCompanies["id"];
}

export default function BankParentCompanySettingsContent({ companyId }: Props) {
  return (
    <PageContent title={"Settings"}>
      <Box mr={6}>
        <ManageParentCompanyUsersArea parentCompanyId={companyId} />
      </Box>
    </PageContent>
  );
}
