import { Box } from "@material-ui/core";
import ParentCompanyDetailsViewCard from "components/ParentCompany/ParentCompanyDetailsViewCard";
import PageContent from "components/Shared/Page/PageContent";
import { ParentCompanies } from "generated/graphql";
import { useGetParentCompanyForBankParentCompanyPageQuery } from "generated/graphql";

interface Props {
  parentCompanyId: ParentCompanies["id"];
}

export default function BankParentCompanyDetailsContent({
  parentCompanyId,
}: Props) {
  const { data, refetch } = useGetParentCompanyForBankParentCompanyPageQuery({
    variables: {
      id: parentCompanyId,
    },
  });

  const parentCompany = data?.parent_companies_by_pk || null;
  const parentCompanyName = parentCompany?.name ? parentCompany.name : "";

  return (
    <PageContent title={"Details"}>
      <Box ml={12} mr={6}>
        <ParentCompanyDetailsViewCard
          parentCompanyId={parentCompanyId}
          parentCompanyName={parentCompanyName}
          refetch={refetch}
        />
      </Box>
    </PageContent>
  );
}
