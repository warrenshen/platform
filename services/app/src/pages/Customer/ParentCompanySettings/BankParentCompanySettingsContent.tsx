import { Box } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import {
  ParentCompanies,
  useGetParentCompanyWithSettingsQuery,
} from "generated/graphql";

import ManageParentCompanyEmailSettings from "./ManageParentCompanyEmailSettings";
import ManageParentCompanyUsersArea from "./ManageParentCompanyUsersArea";

interface Props {
  parentCompanyId: ParentCompanies["id"];
}

export default function BankParentCompanySettingsContent({
  parentCompanyId,
}: Props) {
  const { data, refetch } = useGetParentCompanyWithSettingsQuery({
    variables: {
      parent_company_id: parentCompanyId,
    },
  });
  const parentCompany = data?.parent_companies_by_pk;
  const emails = parentCompany?.settings?.emails || [];

  return (
    <PageContent title={"Settings"}>
      <Box mr={6}>
        <ManageParentCompanyUsersArea parentCompanyId={parentCompanyId} />
        <ManageParentCompanyEmailSettings
          parentCompanyId={parentCompanyId}
          emailTypesEnabled={emails}
          refetch={refetch}
        />
      </Box>
    </PageContent>
  );
}
