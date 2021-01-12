import { Box, IconButton } from "@material-ui/core";
import { SwapHoriz } from "@material-ui/icons";
import BespokeBank from "components/Shared/BankToBankTransfer/BespokeBank";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import { Companies } from "generated/graphql";

export enum PaymentTransferDirection {
  ToBank = "to_bank",
  FromBank = "from_bank",
}

interface Props {
  direction: PaymentTransferDirection;
  companyId: Companies["id"];
  onCompanyBankAccountSelection?: () => void;
  onBespokeBankAccountSelection?: () => void;
}

function BankToBankTransfer(props: Props) {
  return (
    <Box display="flex">
      {props.direction === PaymentTransferDirection.ToBank && (
        <>
          <CompanyBank companyId={props.companyId}></CompanyBank>
          <IconButton size="small" disabled>
            <SwapHoriz></SwapHoriz>
          </IconButton>
          <BespokeBank companyId={props.companyId}></BespokeBank>
        </>
      )}
      {props.direction === PaymentTransferDirection.FromBank && (
        <>
          <BespokeBank companyId={props.companyId}></BespokeBank>
          <IconButton size="small" disabled>
            <SwapHoriz></SwapHoriz>
          </IconButton>
          <CompanyBank companyId={props.companyId}></CompanyBank>
        </>
      )}
    </Box>
  );
}

export default BankToBankTransfer;
