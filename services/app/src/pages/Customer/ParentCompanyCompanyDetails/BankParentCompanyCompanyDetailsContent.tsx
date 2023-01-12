import PageContent from "components/Shared/Page/PageContent";
import { ParentCompanies } from "generated/graphql";
import styled from "styled-components";

const SectionSpace = styled.div`
  height: 24px;
`;

interface Props {
  companyId: ParentCompanies["id"];
}

export default function BankParentCompanyCompanyDetailsContent({
  companyId,
}: Props) {
  return (
    <PageContent title={"Company Details"}>
      <SectionSpace>Company details</SectionSpace>
    </PageContent>
  );
}
