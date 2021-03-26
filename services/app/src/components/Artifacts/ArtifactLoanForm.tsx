import {
  Box,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import { LoansInsertInput } from "generated/graphql";
import { Artifact } from "lib/finance/loans/artifacts";
import { IdComponent } from "./interfaces";

const useStyles = makeStyles(() =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

export interface ArtifactListItem {
  id: string;
  copy: string;
}

interface Props {
  artifactTitle: string;
  canEditArtifact: boolean;
  loan: LoansInsertInput;
  approvedArtifacts: ArtifactListItem[];
  selectedArtifact?: Artifact;
  InfoCard: IdComponent;
  setLoan: (loan: LoansInsertInput) => void;
  idToArtifact: { [artifact_id: string]: Artifact };
}

export default function ArtifactLoanForm({
  artifactTitle,
  canEditArtifact,
  loan,
  approvedArtifacts,
  selectedArtifact,
  idToArtifact,
  InfoCard,
  setLoan,
}: Props) {
  const classes = useStyles();

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

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row">
        <FormControl className={classes.inputField}>
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
        <Box display="flex" mt={3}>
          <InfoCard id={selectedArtifact.artifact_id} />
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={2}>
        <DatePicker
          className={classes.inputField}
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
            This is the date you want the vendor to receive financing. Given
            enough advance notice, Bespoke Financial will adhere to this
            request.
          </Typography>
        </Box>
      </Box>
      <Box mt={3}>
        <FormControl className={classes.inputField}>
          <CurrencyInput
            label={"Amount"}
            value={loan.amount}
            handleChange={(value: number) =>
              setLoan({
                ...loan,
                amount: value,
              })
            }
          />
        </FormControl>
      </Box>
    </Box>
  );
}
