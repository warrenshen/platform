import { Box, Checkbox, FormControlLabel, Typography } from "@material-ui/core";
import CustomerSurveillanceOnPauseReasonsForm from "components/CustomerSurveillance/CustomerSurveillanceOnPauseReasonsForm";
import CustomerSurveillanceResultsDataGrid from "components/CustomerSurveillance/CustomerSurveillanceResultsDataGrid";
import CustomerSurveillanceStatusChip from "components/CustomerSurveillance/CustomerSurveillanceStatusChip";
import CustomerSurveillanceStatusNoteModal from "components/CustomerSurveillance/CustomerSurveillanceStatusNoteModal";
import MetrcLogo from "components/Shared/Images/MetrcLogo.png";
import Modal from "components/Shared/Modal/Modal";
import {
  CustomerSurveillanceFragment,
  useGetCustomersSurveillanceByCompanyIdQuery,
} from "generated/graphql";
import {
  getBorrowingBaseApplicationDate,
  getBorrowingBaseExpirationDate,
  getCustomerProductType,
  getCustomerQualifyingProduct,
  getCustomerSurveillanceStatus,
  getFinancialReportApplicationDate,
  getFinancialReportExpirationDate,
  getLoansAwaitingForAdvanceAmount,
  getMostPastDueLoanDays,
  getPercentagePastDue,
  getSurveillanceBankNote,
  isCustomerFinancialsMetrcBased,
} from "lib/customerSurveillance";
import {
  ProductTypeEnum,
  ProductTypeToLabel,
  SurveillanceStatusEnum,
} from "lib/enum";
import { ChangeEvent, useState } from "react";

interface Props {
  customerId: CustomerSurveillanceFragment["id"];
  targetDate: string;
  handleClose: () => void;
}

export default function CustomerSurveillanceDrawer({
  customerId,
  targetDate,
  handleClose,
}: Props) {
  const [selectedBankNote, setSelectedBankNote] = useState(null);
  const [showSurveillanceDetails, setShowSurveillanceDetails] = useState(true);

  const { data, error } = useGetCustomersSurveillanceByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      target_date: targetDate,
      id: customerId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const customer = data?.customer;
  const surveillanceResult = customer?.target_surveillance_result[0];

  const surveillanceStatus = !!customer
    ? getCustomerSurveillanceStatus(customer)
    : null;

  const productType = !!customer ? getCustomerProductType(customer) : null;

  const isMetrcBased = !!customer
    ? isCustomerFinancialsMetrcBased(customer)
    : null;

  const [, percentagePastDueString] = !!customer
    ? getPercentagePastDue(customer)
    : [0, "0%"];

  return (
    <Modal
      title={`Customer Surveillance Details`}
      contentWidth={700}
      handleClose={handleClose}
    >
      {!!customer && (
        <>
          {!!selectedBankNote && (
            <CustomerSurveillanceStatusNoteModal
              customerName={customer.name}
              surveillanceStatusNote={selectedBankNote || ""}
              handleClose={() => setSelectedBankNote(null)}
            />
          )}
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Customer
            </Typography>
            <Typography variant={"body1"}>{customer?.name}</Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Surveillance Stage
            </Typography>
            {!!surveillanceStatus && (
              <CustomerSurveillanceStatusChip
                surveillanceStatus={surveillanceStatus}
              />
            )}
            {!surveillanceStatus && (
              <Typography variant={"body1"}>
                No status for the selected date
              </Typography>
            )}
          </Box>
          {!!surveillanceStatus &&
            surveillanceStatus === SurveillanceStatusEnum.OnPause && (
              <Box display="flex" flexDirection="column" mt={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showSurveillanceDetails}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setShowSurveillanceDetails(event.target.checked);
                      }}
                      color="primary"
                    />
                  }
                  label={"Show Surveillance Notes?"}
                />
                {!!showSurveillanceDetails && (
                  // <p>hello</p>
                  <CustomerSurveillanceOnPauseReasonsForm
                    isDisabled
                    customer={customer}
                    surveillanceResult={surveillanceResult}
                  />
                )}
              </Box>
            )}
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Product Type
            </Typography>
            <Typography variant={"body1"}>
              {ProductTypeToLabel[productType as ProductTypeEnum]}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Qualifying For
            </Typography>
            <Typography variant={"body1"}>
              {getCustomerQualifyingProduct(customer)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Bank Note
            </Typography>
            <Typography variant={"body1"}>
              {getSurveillanceBankNote(customer)}
            </Typography>
          </Box>
          {!isMetrcBased && (
            <>
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Most Recent Financial Report
                </Typography>
                <Typography variant={"body1"}>
                  {getFinancialReportApplicationDate(customer)}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Financial Report Expiration Date
                </Typography>
                <Typography variant={"body1"}>
                  {getFinancialReportExpirationDate(customer)}
                </Typography>
              </Box>
            </>
          )}
          {!!isMetrcBased && (
            <>
              <Typography variant="subtitle2" color="textSecondary">
                Most Recent Financial Report
              </Typography>
              <Box height={24} mb={0.5}>
                <img src={MetrcLogo} alt="Metrc Logo" width={24} height={24} />
              </Box>
            </>
          )}
          {!!productType && productType === ProductTypeEnum.LineOfCredit && (
            <>
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Most Recent Borrowing Base
                </Typography>
                <Typography variant={"body1"}>
                  {getBorrowingBaseApplicationDate(customer)}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Borrowing Base Expiration Date
                </Typography>
                <Typography variant={"body1"}>
                  {getBorrowingBaseExpirationDate(customer)}
                </Typography>
              </Box>
            </>
          )}
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Percentage Past Due
            </Typography>
            <Typography variant={"body1"}>{percentagePastDueString}</Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Most Overdue Loan Days
            </Typography>
            <Typography variant={"body1"}>
              {getMostPastDueLoanDays(customer)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Total Amount of Loans Awaiting Advances
            </Typography>
            <Typography variant={"body1"}>
              {getLoansAwaitingForAdvanceAmount(customer)}
            </Typography>
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
        </>
      )}
    </Modal>
  );
}
