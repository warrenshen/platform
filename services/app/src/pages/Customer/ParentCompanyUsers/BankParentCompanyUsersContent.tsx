import { Box } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { ParentCompanies } from "generated/graphql";

import ManageParentCompanyUsersArea from "./ManageParentCompanyUsersArea";

interface Props {
  companyId: ParentCompanies["id"];
}

export default function BankParentCompanyUsersContent({ companyId }: Props) {
  return (
    <PageContent title={"Users"}>
      <Box mr={6}>
        <ManageParentCompanyUsersArea parentCompanyId={companyId} />
      </Box>
    </PageContent>
  );
}
