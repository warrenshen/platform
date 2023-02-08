import ChildCompanyDetailsViewCard from "components/ParentCompany/ChildCompanyDetailsViewCard";
import PageContent from "components/Shared/Page/PageContent";
import {
  ParentCompanies,
  useGetParentCompanyWithChildCompaniesQuery,
} from "generated/graphql";
import { formatDatetimeString } from "lib/date";

interface Props {
  parentCompanyId: ParentCompanies["id"];
}

export default function BankParentCompanyCompanyDetailsContent({
  parentCompanyId,
}: Props) {
  const { data, refetch } = useGetParentCompanyWithChildCompaniesQuery({
    variables: {
      parent_company_id: parentCompanyId,
    },
  });

  const childCompanies = data?.parent_companies_by_pk?.child_companies || [];
  return (
    <>
      <PageContent title={"Details"}>
        {childCompanies.map((company) => (
          <ChildCompanyDetailsViewCard
            companyId={company?.id || "-"}
            companyName={company?.name || "-"}
            identifier={company?.identifier || "-"}
            isCustomer={company?.is_customer || false}
            isVendor={company?.is_vendor || false}
            isPayor={company?.is_payor || false}
            dba={company?.dba_name || "-"}
            usState={company?.state || "-"}
            timezone={company?.timezone || ""}
            employerIdentificationNumber={
              company?.employer_identification_number || "-"
            }
            address={company?.address || "-"}
            phoneNumber={company?.phone_number || "-"}
            submittedAt={formatDatetimeString(company?.created_at, false) || ""}
            refetch={refetch}
          />
        ))}
      </PageContent>
    </>
  );
}
