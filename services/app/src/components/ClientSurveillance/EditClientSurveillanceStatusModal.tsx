import { Box, Typography } from "@material-ui/core";
import ClientSurveillanceStatusNoteModal from "components/ClientSurveillance/ClientSurveillanceStatusNoteModal";
import CompanyProductQualificationDataGrid from "components/CompanyProductQualifications/CompanyProductQualificationsDataGrid";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  CompanyProductQualifications,
  useGetCompanyProductQualificationsByDateQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  createCompanyQualifyingProductMutation,
  updateCompanyQualifyingProductMutation,
} from "lib/api/companies";
import {
  getFirstDayOfMonth,
  getLastDateOfMonth,
  todayAsDateStringServer,
  todayMinusXMonthsDateStringServer,
} from "lib/date";
import { ActionType, QualifyForEnum, SurveillanceStatusEnum } from "lib/enum";
import { useEffect, useMemo, useState } from "react";

import ClientSurveillanceStatusUpdateForm from "../Customer/ClientSurveillanceStatusUpdateForm";

interface Props {
  actionType: ActionType;
  company: Companies;
  qualifyingDate: string;
  handleClose: () => void;
}

const NumberOfMonthsShowed = 6;

const newCompanyProductQualification: Partial<CompanyProductQualifications> = {
  qualifying_product: QualifyForEnum.None,
  bank_note: "",
};

export default function EditClientSurveillanceStatusModal({
  actionType,
  company,
  qualifyingDate,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [companyProductQualification, setCompanyProductQualification] =
    useState(newCompanyProductQualification);
  const [selectedQualifyingDate, setSelectedQualifyingDate] =
    useState(qualifyingDate);
  const [
    clickedBankNoteProductQualificationId,
    setClickedBankNoteProductQualificationId,
  ] = useState(null);

  const { refetch } = useGetCompanyProductQualificationsByDateQuery({
    variables: {
      company_id: company.id,
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

  const { id, qualifying_product } = companyProductQualification;

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
    createCompanyQualifyingProduct,
    { loading: isCreateCompanyQualifyingProductLoading },
  ] = useCustomMutation(createCompanyQualifyingProductMutation);
  const [
    updateCompanyQualifyingProduct,
    { loading: isUpdateCompanyQualifyingProductLoading },
  ] = useCustomMutation(updateCompanyQualifyingProductMutation);

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
        ? await createCompanyQualifyingProduct({
            variables: {
              company_id: company.id,
              surveillance_status_note: surveillanceStatusNote,
              qualify_for: qualifyingProduct,
              qualifying_date: selectedQualifyingDate,
            },
          })
        : await updateCompanyQualifyingProduct({
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
      refetchProductQualificationsList();
      handleClose();
      snackbar.showSuccess(
        `Successfully ${ActionType.New ? "created" : "updated"}`
      );
    }
  };

  const handleClickProductQualificationBankNote = useMemo(
    () =>
      (companyProductQualificationId: CompanyProductQualifications["id"]) => {
        setClickedBankNoteProductQualificationId(companyProductQualificationId);
      },
    [setClickedBankNoteProductQualificationId]
  );

  const isPrimaryActionDisabled =
    (company.surveillance_status === surveillanceStatus &&
      qualifying_product === qualifyingProduct &&
      company.surveillance_status_note === surveillanceStatusNote) ||
    !surveillanceStatus ||
    !qualifyingProduct ||
    isCreateCompanyQualifyingProductLoading ||
    isUpdateCompanyQualifyingProductLoading;

  const renderBankNoteModal = () => {
    if (!!clickedBankNoteProductQualificationId) {
      const companyProductQualification =
        data?.company_product_qualifications.find(
          ({ id }) => id === clickedBankNoteProductQualificationId
        );

      return (
        <ClientSurveillanceStatusNoteModal
          companyName={company.name}
          surveillanceStatusNote={companyProductQualification?.bank_note || ""}
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
