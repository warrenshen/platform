import {
  Box,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  TextField,
  makeStyles,
} from "@material-ui/core";
import {
  CustomerSurveillanceFragment,
  CustomerSurveillanceResultFragment,
} from "generated/graphql";
import {
  SurveillanceOnPauseReasonEnum,
  SurveillanceOnPauseReasonNotesEnum,
  SurveillanceOnPauseReasonToLabel,
} from "lib/enum";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

const useStyles = makeStyles({
  form: {
    width: "100%",
  },
});

interface Props {
  isDisabled: boolean;
  customer: CustomerSurveillanceFragment;
  surveillanceResult?: CustomerSurveillanceResultFragment;
  setSurveillanceResult?: Dispatch<
    SetStateAction<CustomerSurveillanceResultFragment>
  >;
}

const CustomerSurveillanceOnPauseReasonsForm = ({
  isDisabled,
  customer,
  surveillanceResult,
  setSurveillanceResult,
}: Props) => {
  const classes = useStyles();

  return (
    <List component="div">
      {Object.entries(SurveillanceOnPauseReasonEnum).map(([key, value]) => (
        <>
          <ListItem key={`${value}-${isDisabled.toString()}`} value={value}>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={isDisabled}
                  checked={
                    !!surveillanceResult
                      ? surveillanceResult.surveillance_info[value]
                      : false
                  }
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (
                      value === SurveillanceOnPauseReasonEnum.Underwriting &&
                      !event.target.checked
                    ) {
                      !!setSurveillanceResult &&
                        !!surveillanceResult &&
                        setSurveillanceResult({
                          ...surveillanceResult,
                          surveillance_info: {
                            ...surveillanceResult.surveillance_info,
                            [value]: event.target.checked,
                            [SurveillanceOnPauseReasonNotesEnum.Underwriting]:
                              "",
                          },
                        });
                    } else if (
                      value === SurveillanceOnPauseReasonEnum.ClientSuccess &&
                      !event.target.checked
                    ) {
                      !!setSurveillanceResult &&
                        !!surveillanceResult &&
                        setSurveillanceResult({
                          ...surveillanceResult,
                          surveillance_info: {
                            ...surveillanceResult.surveillance_info,
                            [SurveillanceOnPauseReasonNotesEnum.ClientSuccess]:
                              "",
                          },
                        });
                    } else {
                      !!setSurveillanceResult &&
                        !!surveillanceResult &&
                        setSurveillanceResult({
                          ...surveillanceResult,
                          surveillance_info: {
                            ...surveillanceResult.surveillance_info,
                            [value]: event.target.checked,
                          },
                        });
                    }
                  }}
                  color="primary"
                />
              }
              label={
                SurveillanceOnPauseReasonToLabel[
                  value as SurveillanceOnPauseReasonEnum
                ]
              }
            />
          </ListItem>
          {!!surveillanceResult &&
            !!surveillanceResult.surveillance_info[
              SurveillanceOnPauseReasonEnum.Underwriting
            ] &&
            value === SurveillanceOnPauseReasonEnum.Underwriting && (
              <Box mb={3}>
                <TextField
                  disabled={isDisabled}
                  multiline
                  className={classes.form}
                  label={"Underwriting Details"}
                  value={
                    surveillanceResult.surveillance_info[
                      SurveillanceOnPauseReasonNotesEnum.Underwriting
                    ]
                  }
                  onChange={({ target: { value } }) =>
                    !!setSurveillanceResult &&
                    !!surveillanceResult &&
                    setSurveillanceResult({
                      ...surveillanceResult,
                      surveillance_info: {
                        ...surveillanceResult.surveillance_info,
                        [SurveillanceOnPauseReasonNotesEnum.Underwriting]:
                          value,
                      },
                    })
                  }
                />
              </Box>
            )}
          {!!surveillanceResult &&
            !!surveillanceResult.surveillance_info[
              SurveillanceOnPauseReasonEnum.ClientSuccess
            ] &&
            value === SurveillanceOnPauseReasonEnum.ClientSuccess && (
              <Box mb={3}>
                <TextField
                  disabled={isDisabled}
                  multiline
                  className={classes.form}
                  label={"Client Success Details"}
                  value={
                    surveillanceResult.surveillance_info[
                      SurveillanceOnPauseReasonNotesEnum.ClientSuccess
                    ]
                  }
                  onChange={({ target: { value } }) =>
                    !!setSurveillanceResult &&
                    !!surveillanceResult &&
                    setSurveillanceResult({
                      ...surveillanceResult,
                      surveillance_info: {
                        ...surveillanceResult.surveillance_info,
                        [SurveillanceOnPauseReasonNotesEnum.ClientSuccess]:
                          value,
                      },
                    })
                  }
                />
              </Box>
            )}
        </>
      ))}
    </List>
  );
};

export default CustomerSurveillanceOnPauseReasonsForm;
