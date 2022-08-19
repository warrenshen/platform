import {
  Box,
  FormControl,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import FileUploader from "components/Shared/File/FileUploader";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  Companies,
  EbbaApplicationFilesInsertInput,
  EbbaApplicationsInsertInput,
  Files,
  RequestStatusEnum,
} from "generated/graphql";
import { FileTypeEnum } from "lib/enum";
import { formatCurrency } from "lib/number";
import { useMemo } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  isActionTypeUpdate: boolean;
  isAccountsReceivableVisible: boolean;
  isInventoryVisible: boolean;
  isBankUser: boolean;
  isCashVisible: boolean;
  isCashInDacaVisible: boolean;
  isCustomAmountVisible: boolean;
  companyId: Companies["id"];
  frozenFileIds?: Files["id"][];
  calculatedBorrowingBase: number | null;
  ebbaApplication: EbbaApplicationsInsertInput;
  ebbaApplicationFiles: EbbaApplicationFilesInsertInput[];
  setEbbaApplication: (ebbaApplication: EbbaApplicationsInsertInput) => void;
  setEbbaApplicationFiles: (
    ebbaApplicationFiles: EbbaApplicationFilesInsertInput[]
  ) => void;
}

export default function EbbaApplicationBorrowingBaseForm({
  isActionTypeUpdate,
  isAccountsReceivableVisible,
  isInventoryVisible,
  isCashVisible,
  isCashInDacaVisible,
  isCustomAmountVisible,
  companyId,
  frozenFileIds,
  calculatedBorrowingBase,
  ebbaApplication,
  ebbaApplicationFiles,
  setEbbaApplication,
  setEbbaApplicationFiles,
  isBankUser,
}: Props) {
  const classes = useStyles();

  const isEditDisabled =
    (ebbaApplication?.status === RequestStatusEnum.ApprovalRequested ||
      ebbaApplication?.status === RequestStatusEnum.Approved) &&
    !isBankUser;

  const isFileUploaderDisabled =
    ebbaApplication?.status === RequestStatusEnum.Approved && !isBankUser;

  const ebbaApplicationFileIds = useMemo(
    () =>
      ebbaApplicationFiles.map(
        (ebbaApplicationFile) => ebbaApplicationFile.file_id
      ),
    [ebbaApplicationFiles]
  );

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={4}>
        {!isActionTypeUpdate && (
          <Box mb={1}>
            <Typography variant="subtitle2">
              What date would you like to submit a borrowing base certification
              for (ex. month end or date of submission)? All financial values
              provided below should be as of this date.
            </Typography>
          </Box>
        )}
        <Box>
          <DateInput
            autoFocus
            disabled={isActionTypeUpdate && !isBankUser}
            disableFuture
            required
            dataCy={"borrow-base-modal-date-picker"}
            className={classes.inputField}
            id="application-month-date-picker"
            label="Borrowing Base Date"
            disablePast={false}
            value={ebbaApplication.application_date}
            onChange={(value) =>
              setEbbaApplication({
                ...ebbaApplication,
                application_date: value,
              })
            }
          />
        </Box>
      </Box>
      <Box mt={4}>
        <Alert severity="info">
          <Typography variant="body1">
            {`Important: all financial values provided below should be AS OF the borrowing base date specified above.`}
          </Typography>
        </Alert>
      </Box>
      {isAccountsReceivableVisible && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="subtitle2">
            As of the borrowing base date specified above, how much AR do you
            have under 30 days?
          </Typography>
          <Box mt={1}>
            <FormControl className={classes.inputField}>
              <CurrencyInput
                isDisabled={isEditDisabled}
                isRequired
                dataCy={"borrowing-base-modal-accounts-receivable"}
                label={"Accounts Receivable Balance"}
                value={ebbaApplication.monthly_accounts_receivable}
                handleChange={(value) =>
                  setEbbaApplication({
                    ...ebbaApplication,
                    monthly_accounts_receivable: value,
                  })
                }
              />
            </FormControl>
          </Box>
        </Box>
      )}
      {isInventoryVisible && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="subtitle2">
            As of the borrowing base date specified above, how much inventory do
            you have?
          </Typography>
          <Box mt={1}>
            <FormControl className={classes.inputField}>
              <CurrencyInput
                isDisabled={isEditDisabled}
                isRequired
                dataCy={"borrowing-base-modal-inventory-balance"}
                label={"Inventory Balance"}
                value={ebbaApplication.monthly_inventory}
                handleChange={(value) =>
                  setEbbaApplication({
                    ...ebbaApplication,
                    monthly_inventory: value,
                  })
                }
              />
            </FormControl>
          </Box>
        </Box>
      )}
      {isCashVisible && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="subtitle2">
            As of the borrowing base date specified above, how much cash do you
            have in deposit accounts?
          </Typography>
          <Box mt={1}>
            <FormControl className={classes.inputField}>
              <CurrencyInput
                isDisabled={isEditDisabled}
                isRequired
                dataCy={"borrowing-base-modal-cash"}
                label={"Cash in Deposit Accounts"}
                value={ebbaApplication.monthly_cash}
                handleChange={(value) =>
                  setEbbaApplication({
                    ...ebbaApplication,
                    monthly_cash: value,
                  })
                }
              />
            </FormControl>
          </Box>
        </Box>
      )}
      {isCashInDacaVisible && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="subtitle2">
            As of the borrowing base date specified above, how much cash do you
            have in DACA?
          </Typography>
          <Box mt={1}>
            <FormControl className={classes.inputField}>
              <CurrencyInput
                isDisabled={isEditDisabled}
                isRequired
                dataCy={"borrowing-base-modal-cash-daca"}
                label={"Cash in DACA"}
                value={ebbaApplication.amount_cash_in_daca}
                handleChange={(value) =>
                  setEbbaApplication({
                    ...ebbaApplication,
                    amount_cash_in_daca: value,
                  })
                }
              />
            </FormControl>
          </Box>
        </Box>
      )}
      {isCustomAmountVisible && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="subtitle2">
            <strong>
              [BANK ADMIN ONLY] OPTIONAL custom borrowing base adjustment.
              Please leave a description for the adjustment (description is
              visible to the client).
            </strong>
          </Typography>
          <Box display="flex" flexDirection="column" mt={1}>
            <FormControl>
              <CurrencyInput
                isDisabled={isEditDisabled}
                dataCy={"borrowing-base-modal-custom-amount"}
                label={"Adjustment Amount"}
                value={ebbaApplication.amount_custom}
                handleChange={(value) =>
                  setEbbaApplication({
                    ...ebbaApplication,
                    amount_custom: value,
                  })
                }
              />
            </FormControl>
          </Box>
          <Box display="flex" flexDirection="column" mt={1}>
            <TextField
              disabled={isEditDisabled}
              data-cy={"borrowing-base-modal-custom-amount-text"}
              label={"Adjustment Amount Description / Note"}
              value={ebbaApplication.amount_custom_note}
              onChange={({ target: { value } }) =>
                setEbbaApplication({
                  ...ebbaApplication,
                  amount_custom_note: value,
                })
              }
            />
          </Box>
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography data-cy={"modal-calculated-borrowing-base"} variant="body1">
          {`Calculated Borrowing Base: ${formatCurrency(
            calculatedBorrowingBase,
            "TBD"
          )}`}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          This borrowing base is calculated based on the financial information
          you entered above and your current active contract with Bespoke.
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={1}>
          <Typography variant="subtitle1" color="textSecondary">
            File Attachment(s)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please upload file attachment(s) that serve as proof of the above
            financial information. One file attachment for each number is
            preferred.
          </Typography>
        </Box>
        <FileUploader
          dataCy={"borrowing-base-modal-file-uploader"}
          disabled={isFileUploaderDisabled}
          companyId={companyId}
          fileType={FileTypeEnum.EbbaApplication}
          fileIds={ebbaApplicationFileIds}
          frozenFileIds={frozenFileIds}
          handleDeleteFileById={(fileId) =>
            setEbbaApplicationFiles(
              ebbaApplicationFiles.filter(
                (ebbaApplicationFile) => ebbaApplicationFile.file_id !== fileId
              )
            )
          }
          handleNewFiles={(files) =>
            setEbbaApplicationFiles([
              ...ebbaApplicationFiles,
              ...files.map((file) => ({
                ebba_application_id: ebbaApplication.id,
                file_id: file.id,
              })),
            ])
          }
        />
      </Box>
    </Box>
  );
}
