import { useState } from "react";
import { Box } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import { Companies } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import ClientSurveillanceStatusUpdateForm from "../Customer/ClientSurveillanceStatusUpdateForm";
import useCustomMutation from "hooks/useCustomMutation";
import { updateCompanyBankStatusMutation } from "lib/api/companies";
import { BankStatusEnum, QualifyForEnum } from "lib/enum";

interface Props {
  client: Companies;
  handleClose: () => void;
}

export default function EditClientSurveillanceStatusModal({
  client,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [bankStatus, setBankStatus] = useState(
    (client.bank_status as BankStatusEnum) || BankStatusEnum.GOOD_STANDING
  );
  const [qualifyFor, setQualifyFor] = useState(
    (client.qualify_for as QualifyForEnum) ||
      QualifyForEnum.DISPENSARY_FINANCING
  );
  const [bankStatusNote, setBankStatusNote] = useState(
    client.bank_status_note || ""
  );

  const [updateCompanyBankStatus] = useCustomMutation(
    updateCompanyBankStatusMutation
  );

  const handleClickSave = async () => {
    const response = await updateCompanyBankStatus({
      variables: {
        company_id: client.id,
        bank_status: bankStatus,
        bank_status_note: bankStatusNote,
        qualify_for: qualifyFor,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("Successfully updated company's status");
      handleClose();
    }
  };

  const isPrimaryActionDisabled =
    (client.bank_status === bankStatus &&
      client.qualify_for === qualifyFor &&
      client.bank_status_note === bankStatusNote) ||
    !bankStatus ||
    !qualifyFor;

  return (
    <Modal
      isPrimaryActionDisabled={isPrimaryActionDisabled}
      title={"Edit Client Surveillance Status"}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSave}
    >
      <Box mt={2}>
        <ClientSurveillanceStatusUpdateForm
          key={client.id}
          name={client.name}
          qualifyFor={qualifyFor}
          bankStatus={bankStatus}
          bankStatusNote={bankStatusNote}
          setBankStatus={setBankStatus}
          setBankStatusNote={setBankStatusNote}
          setQualifyFor={setQualifyFor}
        />
      </Box>
    </Modal>
  );
}
