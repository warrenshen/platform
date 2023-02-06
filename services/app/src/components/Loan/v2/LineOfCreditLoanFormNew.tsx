import { Box, Checkbox, FormControlLabel } from "@material-ui/core";
import FinancingRequestCreateCard from "components/PurchaseOrder/v2/FinancingRequestCreateCard";
import { SecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import ProgressBar from "components/Shared/ProgressBar/ProgressBar";
import Text, { TextVariants } from "components/Shared/Text/Text";
import AutocompleteVendors from "components/Vendors/AutocompleteVendors";
import {
  GetArtifactRelationsByCompanyIdQuery,
  LineOfCreditsInsertInput,
  LoansInsertInput,
  Vendors,
} from "generated/graphql";
import { CustomCheckboxChecked, CustomCheckboxUnchecked } from "icons";
import { ChangeEvent } from "react";

interface Props {
  lineOfCredit: LineOfCreditsInsertInput;
  loan: LoansInsertInput;
  vendors: GetArtifactRelationsByCompanyIdQuery["vendors"];
  adjustedTotalLimit: number;
  availableLimit: number;
  setLineOfCredit: (lineOfCredit: LineOfCreditsInsertInput) => void;
  setLoan: (loan: LoansInsertInput) => void;
}

const LineOfCreditLoanFormNew = ({
  lineOfCredit,
  loan,
  vendors,
  adjustedTotalLimit,
  availableLimit,
  setLineOfCredit,
  setLoan,
}: Props) => {
  const selectedVendor = vendors.find(
    (v) => v.id === lineOfCredit.recipient_vendor_id
  ) as Vendors;

  const amountBorrowed =
    adjustedTotalLimit - availableLimit + (loan.amount || 0);

  return (
    <Box display="flex" flexDirection="column">
      <Box>
        <ProgressBar
          amountFunded={amountBorrowed}
          totalAmount={adjustedTotalLimit}
        />
      </Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={!!lineOfCredit.is_credit_for_vendor}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setLineOfCredit({
                ...lineOfCredit,
                is_credit_for_vendor: event.target.checked,
                recipient_vendor_id: null,
              });
            }}
            color="primary"
            icon={<CustomCheckboxUnchecked />}
            checkedIcon={<CustomCheckboxChecked />}
          />
        }
        label={"Is financing to be sent to a vendor?"}
      />
      {lineOfCredit.is_credit_for_vendor && (
        <Box display="flex" flexDirection="column" mt={4}>
          <AutocompleteVendors
            selectableVendors={vendors}
            selectedVendor={selectedVendor}
            onChange={(event, newValue) => {
              setLineOfCredit({
                ...lineOfCredit,
                recipient_vendor_id:
                  newValue?.company_vendor_partnerships[0]?.vendor_id || null,
              });
            }}
            dataCy={"line-of-credit-loan-form-autocomplete-vendors"}
            label={"Recipient Vendor"}
          />
        </Box>
      )}
      <Box mt={2}>
        <Text
          textVariant={TextVariants.Paragraph}
          color={SecondaryTextColor}
          bottomMargin={24}
        >
          Check this box if you want the financing to be sent directly to one of
          your vendors.
        </Text>
      </Box>
      <FinancingRequestCreateCard
        loan={loan}
        hasBeenFocused={false}
        amountLeft={availableLimit}
        hasEdited={false}
        setLoan={setLoan}
        setHasEdited={() => {}}
      />
    </Box>
  );
};

export default LineOfCreditLoanFormNew;
