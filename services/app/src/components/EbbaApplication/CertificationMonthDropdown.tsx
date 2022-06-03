import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import {
  Companies,
  EbbaApplicationsInsertInput,
  useGetEbbaApplicationsByCompanyIdQuery,
} from "generated/graphql";
import {
  formatDateString,
  formatDateStringAsMonth,
  previousXMonthsCertificationDates,
} from "lib/date";
import { CustomerSurveillanceCategoryEnum } from "lib/enum";
import { useMemo } from "react";

interface Props {
  isBankUser: boolean;
  isDisabled?: boolean;
  companyId: Companies["id"];
  ebbaApplication: EbbaApplicationsInsertInput;
  setEbbaApplication: (ebbaApplication: EbbaApplicationsInsertInput) => void;
  bankUserMonthsBack: number;
  customerUserMonthsBack?: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: "100%",
    },
  })
);

export default function CertificationMonthDropdown({
  isBankUser,
  isDisabled = false,
  companyId,
  ebbaApplication,
  setEbbaApplication,
  bankUserMonthsBack,
  customerUserMonthsBack = 4,
}: Props) {
  const classes = useStyles();

  const { data, error } = useGetEbbaApplicationsByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
      category: CustomerSurveillanceCategoryEnum.FinancialReport,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const certificationDateOptions = useMemo(() => {
    const existingEbbaApplications = data?.ebba_applications || [];
    const existingEbbaApplicationDates = existingEbbaApplications.map(
      (ebbaApplication) => ebbaApplication.application_date
    );
    // 1. Allow bank user to select months up to 12 months back (configurable for CS dashboard)
    // 2. Allow customer user to selects months up to 4 months back (configurable, but defaulting to 4)
    return previousXMonthsCertificationDates(
      isBankUser ? bankUserMonthsBack : customerUserMonthsBack
    ).map((certificationDate) => ({
      isOptionDisabled:
        existingEbbaApplicationDates.indexOf(certificationDate) >= 0,
      certificationDate,
    }));
  }, [
    isBankUser,
    data?.ebba_applications,
    bankUserMonthsBack,
    customerUserMonthsBack,
  ]);

  return (
    <Box>
      <FormControl className={classes.inputField}>
        <InputLabel id="select-certification-date-label" required>
          Certification Month
        </InputLabel>
        <Select
          id="select-certification-date"
          labelId="select-certification-date-label"
          disabled={isDisabled}
          value={ebbaApplication.application_date}
          onChange={({ target: { value } }) =>
            setEbbaApplication({
              ...ebbaApplication,
              application_date: value,
            })
          }
        >
          {certificationDateOptions.map(
            ({ certificationDate, isOptionDisabled }) => (
              <MenuItem
                key={certificationDate}
                disabled={isOptionDisabled}
                value={certificationDate}
              >
                {`${formatDateStringAsMonth(
                  certificationDate
                )}: submit financial report as of ${formatDateString(
                  certificationDate
                )}`}
              </MenuItem>
            )
          )}
        </Select>
      </FormControl>
    </Box>
  );
}
