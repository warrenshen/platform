import { Box } from "@material-ui/core";
import ParentCompanyDetailsViewCard from "components/ParentCompany/ParentCompanyDetailsViewCard";
import PageContent from "components/Shared/Page/PageContent";
import { ParentCompanies } from "generated/graphql";
import { useGetParentCompanyForBankParentCompanyPageQuery } from "generated/graphql";

interface Props {
  companyId: ParentCompanies["id"];
}

export default function BankParentCompanyDetailsContent({ companyId }: Props) {
  const { data, refetch } = useGetParentCompanyForBankParentCompanyPageQuery({
    variables: {
      id: companyId,
    },
  });

  const company = data?.parent_companies_by_pk || null;
  const companyName = company?.name ? company.name : "";

  return (
    <PageContent title={"Details"}>
      <Box ml={12} mr={6}>
        <ParentCompanyDetailsViewCard
          companyId={companyId}
          companyName={companyName}
          refetch={refetch}
        />
      </Box>
    </PageContent>
  );
}
