import { Box, Typography } from "@material-ui/core";
import CustomerSurveillanceResultsDataGrid from "components/CustomerSurveillance/CustomerSurveillanceResultsDataGrid";
import CustomerSurveillanceStatusNoteModal from "components/CustomerSurveillance/CustomerSurveillanceStatusNoteModal";
import CustomerSurveillanceStatusUpdateForm from "components/CustomerSurveillance/CustomerSurveillanceStatusUpdateForm";
import Modal from "components/Shared/Modal/Modal";
import {
  CustomerSurveillanceFragment,
  CustomerSurveillanceResultFragment,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { certifyCustomerSurveillanceResultMutation } from "lib/api/customerSurveillance";
import { formatDateString, getEndOfPreviousMonth } from "lib/date";
import { useState } from "react";

interface Props {
  customer: CustomerSurveillanceFragment;
  handleClose: () => void;
}

export default function CertifyCustomerSurveillanceStatusModal({
  customer,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const initialMonthSelection = getEndOfPreviousMonth();

  // Used in form
  const [surveillanceResult, setSurveillanceResult] =
    useState<CustomerSurveillanceResultFragment>(
      !!customer?.target_surveillance_result?.[0]
        ? (customer
            .target_surveillance_result[0] as CustomerSurveillanceResultFragment)
        : ({
            id: "",
            bank_note: "",
            company_id: "",
            qualifying_product: "",
            qualifying_date: initialMonthSelection,
            surveillance_status: "",
          } as CustomerSurveillanceResultFragment)
    );

  // Used in data grid
  const [selectedBankNote, setSelectedBankNote] = useState(null);

  const [
    certifyCustomerSurveillanceResult,
    { loading: isCertifyCustomerSurveillanceResultLoading },
  ] = useCustomMutation(certifyCustomerSurveillanceResultMutation);

  const handleClickSave = async () => {
    const response = await certifyCustomerSurveillanceResult({
      variables: {
        company_id: customer.id,
        surveillance_status: surveillanceResult["surveillance_status"],
        surveillance_status_note: surveillanceResult["bank_note"],
        qualifying_product: surveillanceResult["qualifying_product"],
        qualifying_date: surveillanceResult["qualifying_date"],
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      handleClose();
      snackbar.showSuccess(
        `Successfully certified surveillance for ${
          customer.name
        } on ${formatDateString(surveillanceResult["qualifying_date"])}`
      );
    }
  };

  const isPrimaryActionDisabled =
    !surveillanceResult["surveillance_status"] ||
    !surveillanceResult["qualifying_product"] ||
    isCertifyCustomerSurveillanceResultLoading;

  return (
    <Modal
      isPrimaryActionDisabled={isPrimaryActionDisabled}
      title={"Edit Client Surveillance Status"}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSave}
    >
      {!!selectedBankNote && (
        <CustomerSurveillanceStatusNoteModal
          customerName={customer.name}
          surveillanceStatusNote={selectedBankNote || ""}
          handleClose={() => setSelectedBankNote(null)}
        />
      )}
      <Box mt={2}>
        <CustomerSurveillanceStatusUpdateForm
          customer={customer}
          surveillanceResult={surveillanceResult}
          setSurveillanceResult={setSurveillanceResult}
        />
      </Box>
      <Box mt={5}>
        <Typography variant="h6">Historical Surveillance</Typography>
        <CustomerSurveillanceResultsDataGrid
          surveillanceResults={customer?.all_surveillance_results || []}
          handleClickBankNote={(bankNote) => {
            setSelectedBankNote(bankNote);
          }}
        />
      </Box>
    </Modal>
  );
}
