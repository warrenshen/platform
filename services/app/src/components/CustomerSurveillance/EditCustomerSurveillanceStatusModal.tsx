import { Box, Typography } from "@material-ui/core";
import CustomerSurveillanceResultsDataGrid from "components/CustomerSurveillance/CustomerSurveillanceResultsDataGrid";
import CustomerSurveillanceStatusNoteModal from "components/CustomerSurveillance/CustomerSurveillanceStatusNoteModal";
import CustomerSurveillanceStatusUpdateForm from "components/CustomerSurveillance/CustomerSurveillanceStatusUpdateForm";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  CustomerSurveillanceResults,
  useGetCustomerSurveillanceResultsByDateQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  createCustomerSurveillanceResultMutation,
  updateCustomerSurveillanceResultMutation,
} from "lib/api/companies";
import {
  getFirstDayOfMonth,
  getLastDateOfMonth,
  todayAsDateStringServer,
  todayMinusXMonthsDateStringServer,
} from "lib/date";
import { ActionType, QualifyForEnum, SurveillanceStatusEnum } from "lib/enum";
import { useEffect, useMemo, useState } from "react";

interface Props {
  actionType: ActionType;
  company: Companies;
  qualifyingDate: string;
  handleClose: () => void;
}

const NumberOfMonthsShowed = 6;

const newCustomerSurveillanceResult: Partial<CustomerSurveillanceResults> = {
  qualifying_product: QualifyForEnum.None,
  bank_note: "",
};

export default function EditCustomerSurveillanceStatusModal({
  actionType,
  company,
  qualifyingDate,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [customerSurveillanceResult, setCustomerSurveillanceResult] = useState(
    newCustomerSurveillanceResult
  );
  const [selectedQualifyingDate, setSelectedQualifyingDate] =
    useState(qualifyingDate);
  const [
    clickedBankNoteSurveillanceResultId,
    setClickedBankNoteSurveillanceResultId,
  ] = useState(null);

  const { refetch } = useGetCustomerSurveillanceResultsByDateQuery({
    variables: {
      company_id: company.id,
      start_date: getFirstDayOfMonth(selectedQualifyingDate),
      end_date: getLastDateOfMonth(selectedQualifyingDate),
      limit: 1,
    },
    onCompleted: (data) => {
      const existingCustomerSurveillanceResult = data
        ?.customer_surveillance_results[0] as CustomerSurveillanceResults;

      if (
        actionType === ActionType.Update &&
        existingCustomerSurveillanceResult
      ) {
        setCustomerSurveillanceResult(existingCustomerSurveillanceResult);
      } else {
        setCustomerSurveillanceResult(newCustomerSurveillanceResult);
      }
    },
  });

  const {
    data,
    refetch: refetchSurveillanceResultsList,
    error,
  } = useGetCustomerSurveillanceResultsByDateQuery({
    variables: {
      company_id: company.id,
      start_date: todayMinusXMonthsDateStringServer(NumberOfMonthsShowed),
      end_date: todayAsDateStringServer(),
      limit: NumberOfMonthsShowed,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const { id, qualifying_product } = customerSurveillanceResult;

  const [surveillanceStatus, setSurveillanceStatus] = useState(
    company.surveillance_status as SurveillanceStatusEnum
  );
  const [surveillanceStatusNote, setSurveillanceStatusNote] = useState(
    company.surveillance_status_note || ""
  );
  const [qualifyingProduct, setQualifyingProduct] = useState(
    qualifying_product as QualifyForEnum
  );

  const [
    createCustomerSurveillanceResult,
    { loading: isCreateCustomerSurveillanceResultLoading },
  ] = useCustomMutation(createCustomerSurveillanceResultMutation);
  const [
    updateCustomerSurveillanceResult,
    { loading: isUpdateCustomerSurveillanceResultLoading },
  ] = useCustomMutation(updateCustomerSurveillanceResultMutation);

  useEffect(() => {
    setSurveillanceStatusNote(company.surveillance_status_note || "");
    setQualifyingProduct(qualifying_product as QualifyForEnum);
  }, [company, qualifying_product]);

  const handleQualifyingDateChange = useMemo(
    () => (value: string | null) => value && setSelectedQualifyingDate(value),
    [setSelectedQualifyingDate]
  );

  const handleClickSave = async () => {
    const response =
      actionType === ActionType.New
        ? await createCustomerSurveillanceResult({
            variables: {
              company_id: company.id,
              surveillance_status_note: surveillanceStatusNote,
              qualify_for: qualifyingProduct,
              qualifying_date: selectedQualifyingDate,
            },
          })
        : await updateCustomerSurveillanceResult({
            variables: {
              company_product_qualification_id: id,
              surveillance_status_note: surveillanceStatusNote,
              qualify_for: qualifyingProduct,
            },
          });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      refetch();
      refetchSurveillanceResultsList();
      handleClose();
      snackbar.showSuccess(
        `Successfully ${ActionType.New ? "created" : "updated"}`
      );
    }
  };

  const handleClickSurveillanceResultsBankNote = useMemo(
    () => (customerSurveillanceResultsId: CustomerSurveillanceResults["id"]) => {
      setClickedBankNoteSurveillanceResultId(customerSurveillanceResultsId);
    },
    [setClickedBankNoteSurveillanceResultId]
  );

  const isPrimaryActionDisabled =
    (company.surveillance_status === surveillanceStatus &&
      qualifying_product === qualifyingProduct &&
      company.surveillance_status_note === surveillanceStatusNote) ||
    !surveillanceStatus ||
    !qualifyingProduct ||
    isCreateCustomerSurveillanceResultLoading ||
    isUpdateCustomerSurveillanceResultLoading;

  const renderBankNoteModal = () => {
    if (!!clickedBankNoteSurveillanceResultId) {
      const customerSurveillanceResult =
        data?.customer_surveillance_results.find(
          ({ id }) => id === clickedBankNoteSurveillanceResultId
        );

      return (
        <CustomerSurveillanceStatusNoteModal
          companyName={company.name}
          surveillanceStatusNote={customerSurveillanceResult?.bank_note || ""}
          handleClose={() => setClickedBankNoteSurveillanceResultId(null)}
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
        <CustomerSurveillanceStatusUpdateForm
          name={company.name}
          surveillanceStatus={surveillanceStatus}
          surveillanceStatusNote={surveillanceStatusNote}
          setSurveillanceStatus={setSurveillanceStatus}
          setSurveillanceStatusNote={setSurveillanceStatusNote}
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
        <CustomerSurveillanceResultsDataGrid
          surveillanceResults={data?.customer_surveillance_results || []}
          handleClickSurveillanceResultsBankNote={
            handleClickSurveillanceResultsBankNote
          }
        />
      </Box>
    </Modal>
  );
}
