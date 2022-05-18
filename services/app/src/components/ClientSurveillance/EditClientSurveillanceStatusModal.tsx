import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  CompanyProductQualifications,
  useGetCompanyProductQualificationsByDateQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import ClientSurveillanceStatusUpdateForm from "../Customer/ClientSurveillanceStatusUpdateForm";
import useCustomMutation from "hooks/useCustomMutation";
import {
  createCompanyQualifyingProductMutation,
  updateCompanyQualifyingProductMutation,
} from "lib/api/companies";
import { ActionType, BankStatusEnum, QualifyForEnum } from "lib/enum";
import {
  getFirstDayOfMonth,
  getLastDateOfMonth,
  todayAsDateStringServer,
  todayMinusXMonthsDateStringServer,
} from "lib/date";
import CompanyProductQualificationDataGrid from "components/CompanyProductQualifications/CompanyProductQualificationsDataGrid";
import ClientBankStatusNoteModal from "./ClientBankStatusNoteModal";

interface Props {
  actionType: ActionType;
  client: Companies;
  qualifyingDate: string;
  handleClose: () => void;
}

const NumberOfMonthsShowed = 6;

const newCompanyProductQualification: Partial<CompanyProductQualifications> = {
  qualifying_product: QualifyForEnum.NONE,
  bank_note: "",
};

export default function EditClientSurveillanceStatusModal({
  actionType,
  client: { id: company_id, bank_status = BankStatusEnum.GOOD_STANDING, name },
  qualifyingDate,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [
    companyProductQualification,
    setCompanyProductQualification,
  ] = useState(newCompanyProductQualification);
  const [selectedQualifyingDate, setSelectedQualifyingDate] = useState(
    qualifyingDate
  );
  const [
    clickedBankNoteProductQualificationId,
    setClickedBankNoteProductQualificationId,
  ] = useState(null);

  const { refetch } = useGetCompanyProductQualificationsByDateQuery({
    variables: {
      company_id: company_id,
      start_date: getFirstDayOfMonth(selectedQualifyingDate),
      end_date: getLastDateOfMonth(selectedQualifyingDate),
      limit: 1,
    },
    onCompleted: (data) => {
      const existingCompanyProductQualification = data
        ?.company_product_qualifications[0] as CompanyProductQualifications;

      if (
        actionType === ActionType.Update &&
        existingCompanyProductQualification
      ) {
        setCompanyProductQualification(existingCompanyProductQualification);
      } else {
        setCompanyProductQualification(newCompanyProductQualification);
      }
    },
  });

  const {
    data,
    refetch: refetchProductQualificationsList,
    error,
  } = useGetCompanyProductQualificationsByDateQuery({
    variables: {
      company_id: company_id,
      start_date: todayMinusXMonthsDateStringServer(NumberOfMonthsShowed),
      end_date: todayAsDateStringServer(),
      limit: NumberOfMonthsShowed,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const { id, qualifying_product, bank_note } = companyProductQualification;

  const [bankStatus, setBankStatus] = useState(bank_status as BankStatusEnum);
  const [bankStatusNote, setBankStatusNote] = useState(bank_note || "");
  const [qualifyingProduct, setQualifyingProduct] = useState(
    qualifying_product as QualifyForEnum
  );

  const [
    createCompanyQualifyingProduct,
    { loading: isCreateCompanyQualifyingProductLoading },
  ] = useCustomMutation(createCompanyQualifyingProductMutation);
  const [
    updateCompanyQualifyingProduct,
    { loading: isUpdateCompanyQualifyingProductLoading },
  ] = useCustomMutation(updateCompanyQualifyingProductMutation);

  useEffect(() => {
    setBankStatusNote(bank_note || "");
    setQualifyingProduct(qualifying_product as QualifyForEnum);
  }, [bank_note, qualifying_product]);

  const handleQualifyingDateChange = useMemo(
    () => (value: string | null) => value && setSelectedQualifyingDate(value),
    [setSelectedQualifyingDate]
  );

  const handleClickSave = async () => {
    const response =
      actionType === ActionType.New
        ? await createCompanyQualifyingProduct({
            variables: {
              company_id,
              bank_status_note: bankStatusNote,
              qualify_for: qualifyingProduct,
              qualifying_date: selectedQualifyingDate,
            },
          })
        : await updateCompanyQualifyingProduct({
            variables: {
              company_product_qualification_id: id,
              bank_status_note: bankStatusNote,
              qualify_for: qualifyingProduct,
            },
          });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      refetch();
      refetchProductQualificationsList();
      handleClose();
      snackbar.showSuccess(
        `Successfully ${ActionType.New ? "created" : "updated"}`
      );
    }
  };

  const handleClickProductQualificationBankNote = useMemo(
    () => (
      companyProductQualificationId: CompanyProductQualifications["id"]
    ) => {
      setClickedBankNoteProductQualificationId(companyProductQualificationId);
    },
    [setClickedBankNoteProductQualificationId]
  );

  const isPrimaryActionDisabled =
    (bank_status === bankStatus &&
      qualifying_product === qualifyingProduct &&
      bank_note === bankStatusNote) ||
    !bankStatus ||
    !qualifyingProduct ||
    isCreateCompanyQualifyingProductLoading ||
    isUpdateCompanyQualifyingProductLoading;

  const renderBankNoteModal = () => {
    if (!!clickedBankNoteProductQualificationId) {
      const companyProductQualification = data?.company_product_qualifications.find(
        ({ id }) => id === clickedBankNoteProductQualificationId
      );

      return (
        <ClientBankStatusNoteModal
          companyName={name}
          bankStatusNote={companyProductQualification?.bank_note || ""}
          handleClose={() => setClickedBankNoteProductQualificationId(null)}
        />
      );
    }
  };

  return (
    <Modal
      isPrimaryActionDisabled={isPrimaryActionDisabled}
      title={"Edit Client Surveillance Status"}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSave}
    >
      {renderBankNoteModal()}
      <Box mt={2}>
        <ClientSurveillanceStatusUpdateForm
          name={name}
          bankStatus={bankStatus}
          bankStatusNote={bankStatusNote}
          setBankStatus={setBankStatus}
          setBankStatusNote={setBankStatusNote}
          qualifyingDate={selectedQualifyingDate}
          handleQualifyingDateChange={handleQualifyingDateChange}
          qualifyFor={qualifyingProduct}
          setQualifyFor={setQualifyingProduct}
        />
      </Box>
      <Box mt={5}>
        <Typography variant="h6">
          Qualifying Products for the past 6 months
        </Typography>
        <CompanyProductQualificationDataGrid
          productQualifications={data?.company_product_qualifications || []}
          handleClickProductQualificationBankNote={
            handleClickProductQualificationBankNote
          }
        />
      </Box>
    </Modal>
  );
}
