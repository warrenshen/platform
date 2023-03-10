import { Box } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { ParentCompanies } from "generated/graphql";

import ManageParentCompanyUsersArea from "./ManageParentCompanyUsersArea";

interface Props {
  parentCompanyId: ParentCompanies["id"];
}

export default function BankParentCompanyUsersContent({
  parentCompanyId,
}: Props) {
  return (
    <PageContent title={"Users"}>
      <Box mr={6}>
        <ManageParentCompanyUsersArea parentCompanyId={parentCompanyId} />
      </Box>
    </PageContent>
  );
}
