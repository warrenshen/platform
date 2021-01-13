import { Box, IconButton } from "@material-ui/core";
import { SwapHoriz } from "@material-ui/icons";
import BespokeBank from "components/Shared/BankToBankTransfer/BespokeBank";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import { BankAccounts, Companies } from "generated/graphql";

export enum PaymentTransferDirection {
  ToBank = "to_bank",
  FromBank = "from_bank",
}

interface Props {
  direction: PaymentTransferDirection;
  companyId: Companies["id"];
  onCompanyBankAccountSelection: (id: BankAccounts["id"]) => void;
  onBespokeBankAccountSelection: (id: BankAccounts["id"]) => void;
}

function BankToBankTransfer(props: Props) {
  return (
    <Box display="flex">
      {props.direction === PaymentTransferDirection.ToBank && (
        <>
          <CompanyBank {...props}></CompanyBank>
          <IconButton size="small" disabled>
            <SwapHoriz></SwapHoriz>
          </IconButton>
          <BespokeBank {...props}></BespokeBank>
        </>
      )}
      {props.direction === PaymentTransferDirection.FromBank && (
        <>
          <BespokeBank {...props}></BespokeBank>
          <IconButton size="small" disabled>
            <SwapHoriz></SwapHoriz>
          </IconButton>
          <CompanyBank {...props}></CompanyBank>
        </>
      )}
    </Box>
  );
}

export default BankToBankTransfer;
