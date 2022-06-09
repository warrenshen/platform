import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import CustomerSurveillanceOnPauseReasonsForm from "components/CustomerSurveillance/CustomerSurveillanceOnPauseReasonsForm";
import CertificationMonthDropdown from "components/EbbaApplication/CertificationMonthDropdown";
import { CertificationOption } from "components/EbbaApplication/CertificationMonthDropdown";
import {
  CustomerSurveillanceFragment,
  CustomerSurveillanceResultFragment,
} from "generated/graphql";
import { previousXMonthsCertificationDates } from "lib/date";
import {
  QualifyForEnum,
  QualifyForToLabel,
  SurveillanceStatusEnum,
  SurveillanceStatusToLabel,
} from "lib/enum";
import { Dispatch, SetStateAction } from "react";

interface Props {
  customer: CustomerSurveillanceFragment;
  surveillanceResult: CustomerSurveillanceResultFragment;
  setSurveillanceResult: Dispatch<
    SetStateAction<CustomerSurveillanceResultFragment>
  >;
}

const CustomerSurveillanceStatusUpdateForm = ({
  customer,
  surveillanceResult,
  setSurveillanceResult,
}: Props) => {
  const certificationDateOptions: CertificationOption[] =
    previousXMonthsCertificationDates(12).map((certificationDate) => ({
      certificationDate,
      isOptionDisabled: false,
    }));

  return (
    <Box mt={4} key={customer.name}>
      <Box display="flex" flexDirection="column" width={400}>
        <Box mb={2}>
          <Typography variant="h6">{customer.name}</Typography>
        </Box>
        <FormControl>
          <Box display="flex" flexDirection="row" mb={3}>
            <CertificationMonthDropdown
              isRequired={false}
              initialValue={surveillanceResult["qualifying_date"]}
              onChange={({ target: { value } }) => {
                const surveillanceMatch =
                  customer.all_surveillance_results.find((result) => {
                    return result.qualifying_date === value;
                  });
                const matchedQualifyingProduct = !!surveillanceMatch
                  ? (surveillanceMatch.qualifying_product as QualifyForEnum)
                  : QualifyForEnum.None;
                const matchedSurveillanceStatus = !!surveillanceMatch
                  ? (surveillanceMatch.surveillance_status as SurveillanceStatusEnum)
                  : null;
                const matchedBankNote = !!surveillanceMatch
                  ? surveillanceMatch.bank_note
                  : null;

                setSurveillanceResult({
                  ...surveillanceResult,
                  bank_note: matchedBankNote || "",
                  qualifying_product: matchedQualifyingProduct,
                  qualifying_date: value,
                  surveillance_status: matchedSurveillanceStatus || null,
                });
              }}
              certificationDateOptions={certificationDateOptions}
            />
          </Box>
          <Box mb={3}>
            <Autocomplete
              autoHighlight
              blurOnSelect
              value={surveillanceResult["surveillance_status"]}
              options={Object.values(SurveillanceStatusEnum)}
              getOptionLabel={(option: string) => {
                return SurveillanceStatusToLabel[
                  option as SurveillanceStatusEnum
                ];
              }}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  label="Surveillance Status"
                  variant="outlined"
                />
              )}
              onChange={(_event, status) => {
                if (!!status) {
                  setSurveillanceResult({
                    ...surveillanceResult,
                    surveillance_status: status as SurveillanceStatusEnum,
                    surveillance_info: {},
                  });
                }
              }}
            />
          </Box>
          {surveillanceResult["surveillance_status"] ===
            SurveillanceStatusEnum.OnPause && (
            <Box mb={3}>
              <Typography variant="body2" color="textSecondary">
                On Pause Surveillance Reasons
              </Typography>
              <CustomerSurveillanceOnPauseReasonsForm
                isDisabled={false}
                customer={customer}
                surveillanceResult={surveillanceResult}
                setSurveillanceResult={setSurveillanceResult}
              />
            </Box>
          )}
          <Box mb={3}>
            <Autocomplete
              autoHighlight
              blurOnSelect
              value={surveillanceResult["qualifying_product"] as QualifyForEnum}
              options={Object.values(QualifyForEnum)}
              getOptionLabel={(option: QualifyForEnum) =>
                QualifyForToLabel[option]
              }
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  label="Qualifying For"
                  variant="outlined"
                />
              )}
              onChange={(_event, qualifyingProduct) => {
                setSurveillanceResult({
                  ...surveillanceResult,
                  qualifying_product: qualifyingProduct as QualifyForEnum,
                });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column">
            <TextField
              label="Bank Note"
              value={surveillanceResult["bank_note"]}
              onChange={({ target: { value } }) => {
                setSurveillanceResult({
                  ...surveillanceResult,
                  bank_note: value,
                });
              }}
            />
          </Box>
        </FormControl>
      </Box>
    </Box>
  );
};

export default CustomerSurveillanceStatusUpdateForm;
