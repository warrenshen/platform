import { Box, IconButton } from "@material-ui/core";
import { SwapHoriz } from "@material-ui/icons";
import BespokeBank from "components/Shared/BankToBankTransfer/BespokeBank";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import { BankAccounts, Companies } from "generated/graphql";

export enum PaymentTransferType {
  ToBank = "repayment",
  FromBank = "advance",
}

interface Props {
  type: PaymentTransferType;
  companyId: Companies["id"];
  onCompanyBankAccountSelection: (id: BankAccounts["id"]) => void;
  onBespokeBankAccountSelection: (id: BankAccounts["id"]) => void;
}

function BankToBankTransfer(props: Props) {
  return (
    <Box display="flex">
      {props.type === PaymentTransferType.ToBank && (
        <>
          <CompanyBank {...props} />
          <IconButton size="small" disabled>
            <SwapHoriz />
          </IconButton>
          <BespokeBank {...props} />
        </>
      )}
      {props.type === PaymentTransferType.FromBank && (
        <>
          <BespokeBank {...props} />
          <IconButton size="small" disabled>
            <SwapHoriz />
          </IconButton>
          <CompanyBank {...props} />
        </>
      )}
    </Box>
  );
}

export default BankToBankTransfer;
