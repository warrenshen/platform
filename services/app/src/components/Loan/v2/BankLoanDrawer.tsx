import { Tab, Tabs } from "@material-ui/core";
import BankAccountInformationByLoanDrawerTab from "components/BankAccount/BankAccountInformationByLoanDrawerTab";
import BankAccountInformationDrawerTab from "components/BankAccount/BankAccountInformationDrawerTab";
import BankLoanGeneralInformationDrawerTab from "components/Loan/v2/BankLoanGeneralInformationDrawerTab";
import BankLoanOnlyForBankDrawerTab from "components/Loan/v2/BankLoanOnlyForBankDrawerTab";
import BankPurchaseOrderGeneralInformationDrawerTab from "components/PurchaseOrder/v2/BankPurchaseOrderGeneralInformationDrawerTab";
import Modal from "components/Shared/Modal/Modal";
import {
  LoanTypeEnum,
  LoanWithRelationshipsFragment,
  Loans,
  PurchaseOrderWithRelationshipsFragment,
  useGetLoanWithRelationshipsQuery,
} from "generated/graphql";
import {
  BankLoansDrawerTabLabelNew,
  BankLoansDrawerTabLabelsNew,
  UUIDEnum,
} from "lib/enum";
import { createLoanCustomerIdentifier } from "lib/loans";
import { useState } from "react";
import styled from "styled-components";

export interface LoanViewModalProps {
  loan: LoanWithRelationshipsFragment;
}

const SectionSpace = styled.div`
  height: 24px;
`;

interface Props {
  loanId: Loans["id"];
  isBankUser: boolean;
  handleClose: () => void;
}

const BankLoanDrawer = ({ loanId, isBankUser, handleClose }: Props) => {
  const { data } = useGetLoanWithRelationshipsQuery({
    fetchPolicy: "network-only",
    variables: {
      id: loanId,
      is_bank_user: isBankUser,
    },
  });
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const loan = data?.loans_by_pk;

  const purchaseOrder =
    loan?.purchase_order as PurchaseOrderWithRelationshipsFragment;

  const titleType = !!loan?.funded_at;
  const title = titleType ? "Loan" : "Financing Request";
  const loanType = loan?.loan_type;
  const isLoanLoC = loanType === LoanTypeEnum.LineOfCredit;

  if (!loan) {
    return null;
  }

  const customerIdentifier = createLoanCustomerIdentifier(loan);
  const debtFacilityName = loan?.loan_report?.debt_facility?.name || "-";
  const loanReportId = loan?.loan_report?.id || UUIDEnum.None;

  return (
    <Modal
      title={`${title} #${customerIdentifier}`}
      contentWidth={1000}
      handleClose={handleClose}
    >
      <Tabs
        centered
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_: any, value: number) => setSelectedTabIndex(value)}
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {BankLoansDrawerTabLabelsNew.map((label) => {
          if (!isBankUser && label === BankLoansDrawerTabLabelNew.OnlyForBank) {
            return null;
          }
          if (
            isLoanLoC &&
            label === BankLoansDrawerTabLabelNew.PurchaseOrderInformation
          ) {
            return null;
          }
          return (
            <Tab
              // Replace space with underscore and change to lower case
              // eg:- Not Confirmed Pos to not-confirmed-pos
              data-cy={label.replace(/\s+/g, "-").toLowerCase()}
              key={label}
              label={label}
              style={{ width: "250px" }}
            />
          );
        })}
      </Tabs>
      <SectionSpace />
      {!isLoanLoC &&
        (selectedTabIndex === 0 ? (
          <BankLoanGeneralInformationDrawerTab loan={loan} />
        ) : selectedTabIndex === 1 ? (
          <BankPurchaseOrderGeneralInformationDrawerTab
            purchaseOrder={purchaseOrder}
          />
        ) : selectedTabIndex === 2 ? (
          <BankAccountInformationDrawerTab purchaseOrder={purchaseOrder} />
        ) : (
          <BankLoanOnlyForBankDrawerTab
            loan={loan}
            debtFacilityName={debtFacilityName}
            loanReportId={loanReportId}
            isBankUser={isBankUser}
          />
        ))}
      {isLoanLoC &&
        (selectedTabIndex === 0 ? (
          <BankLoanGeneralInformationDrawerTab loan={loan} />
        ) : selectedTabIndex === 1 ? (
          <BankAccountInformationByLoanDrawerTab loan={loan} />
        ) : (
          <BankLoanOnlyForBankDrawerTab
            loan={loan}
            debtFacilityName={debtFacilityName}
            loanReportId={loanReportId}
            isBankUser={isBankUser}
          />
        ))}
    </Modal>
  );
};

export default BankLoanDrawer;
