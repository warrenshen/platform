import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import LinearProgressBar from "components/Shared/ProgressBar/LinearProgressBar";
import { LoansInsertInput } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import { formatCurrency } from "lib/number";
import { Artifact } from "lib/finance/loans/artifacts";
import { round } from "lodash";
import { IdComponent } from "./interfaces";

export interface ArtifactListItem {
  id: string;
  copy: string;
}

interface Props {
  canEditArtifact: boolean;
  artifactTitle: string;
  productType: ProductTypeEnum;
  loan: LoansInsertInput;
  approvedArtifacts: ArtifactListItem[];
  selectedArtifact?: Artifact;
  InfoCard: IdComponent;
  setLoan: (loan: LoansInsertInput) => void;
  idToArtifact: { [artifact_id: string]: Artifact };
}

export default function ArtifactLoanForm({
  canEditArtifact,
  artifactTitle,
  productType,
  loan,
  approvedArtifacts,
  selectedArtifact,
  idToArtifact,
  InfoCard,
  setLoan,
}: Props) {
  const artifactsList = approvedArtifacts.filter((a) => {
    const artifact = idToArtifact[a.id];

    if (!artifact) {
      console.warn(
        `Warning: ${a.id} was not returned by the artifact response. This indicates a bug`
      );
      return false;
    }

    return artifact.amount_remaining > 0;
  });

  if (!artifactsList || artifactsList.length === 0) {
    return null;
  }

  const roundedLimitPercent = selectedArtifact
    ? round(
        (100 * (selectedArtifact.amount_remaining || 0.0)) /
          selectedArtifact.total_amount,
        1
      )
    : 0.0;

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        <FormControl>
          <InputLabel id="artifact-select-label">{artifactTitle}</InputLabel>
          <Select
            disabled={!canEditArtifact || artifactsList.length <= 0}
            defaultValue=""
            id="artifact-select"
            labelId="artifact-select-label"
            value={loan.artifact_id}
            onChange={({ target: { value } }) => {
              const maxAmountAvailable =
                idToArtifact[value as string].amount_remaining;
              setLoan({
                ...loan,
                artifact_id: value,
                amount: maxAmountAvailable,
              });
            }}
          >
            {artifactsList?.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.copy}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {selectedArtifact && (
        <>
          <Box display="flex" flexDirection="column" mt={3}>
            <InfoCard id={selectedArtifact.artifact_id} />
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            width={300}
            mt={2}
          >
            <LinearProgressBar value={roundedLimitPercent} />
            <Box mt={1}>
              <Typography variant="body2">
                {`${
                  selectedArtifact
                    ? formatCurrency(selectedArtifact.amount_remaining)
                    : "TBD"
                } left to finance`}
              </Typography>
            </Box>
          </Box>
        </>
      )}
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          id="requested-payment-date-date-picker"
          label="Requested Payment Date"
          disablePast
          disableNonBankDays
          value={loan.requested_payment_date}
          onChange={(value) =>
            setLoan({
              ...loan,
              requested_payment_date: value,
            })
          }
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            {`This is the date you want ${
              ![
                ProductTypeEnum.InvoiceFinancing,
                ProductTypeEnum.LineOfCredit,
              ].includes(productType)
                ? "the vendor "
                : ""
            }to receive financing. Within
            banking limitations, Bespoke Financial will try to adhere to this
            request.`}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <CurrencyInput
          label={"Amount"}
          value={loan.amount}
          handleChange={(value) =>
            setLoan({
              ...loan,
              amount: value,
            })
          }
        />
      </Box>
    </Box>
  );
}
