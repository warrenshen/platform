import { Tab, Tabs } from "@material-ui/core";
import BankAccountInformationDrawerTab from "components/BankAccount/BankAccountInformationDrawerTab";
import BankLoanGeneralInformationDrawerTab from "components/Loan/v2/BankLoanGeneralInformationDrawerTab";
import BankPurchaseOrderGeneralInformationDrawerTab from "components/PurchaseOrder/v2/BankPurchaseOrderGeneralInformationDrawerTab";
import BankPurchaseOrderOnlyForBankDrawerTab from "components/PurchaseOrder/v2/BankPurchaseOrderOnlyForBankDrawerTab";
import Modal from "components/Shared/Modal/Modal";
import {
  LoanFragment,
  Loans,
  PurchaseOrderWithRelationshipsFragment,
  useGetLoanWithRelationshipsQuery,
} from "generated/graphql";
import {
  BankLoansDrawerTabLabelNew,
  BankLoansDrawerTabLabelsNew,
} from "lib/enum";
import { createLoanCustomerIdentifier } from "lib/loans";
import { useState } from "react";
import styled from "styled-components";

export interface LoanViewModalProps {
  loan: LoanFragment;
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

  if (!loan) {
    return null;
  }

  const customerIdentifier = createLoanCustomerIdentifier(loan);

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
          marginLeft: "100px",
          marginRight: "100px",
        }}
      >
        {BankLoansDrawerTabLabelsNew.map((label) => {
          if (!isBankUser && label === BankLoansDrawerTabLabelNew.OnlyForBank) {
            return null;
          }

          return (
            <Tab
              // Replace space with underscore and change to lower case
              // eg:- Not Confirmed Pos to not-confirmed-pos
              data-cy={label.replace(/\s+/g, "-").toLowerCase()}
              key={label}
              label={label}
              style={{ width: "200px" }}
            />
          );
        })}
      </Tabs>
      <SectionSpace />
      {selectedTabIndex === 0 ? (
        <BankLoanGeneralInformationDrawerTab loan={loan} />
      ) : selectedTabIndex === 1 ? (
        <BankPurchaseOrderGeneralInformationDrawerTab
          purchaseOrder={purchaseOrder}
        />
      ) : selectedTabIndex === 2 ? (
        <BankAccountInformationDrawerTab purchaseOrder={purchaseOrder} />
      ) : (
        <BankPurchaseOrderOnlyForBankDrawerTab purchaseOrder={purchaseOrder} />
      )}
    </Modal>
  );
};

export default BankLoanDrawer;
