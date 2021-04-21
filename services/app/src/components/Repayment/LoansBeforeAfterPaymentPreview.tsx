// This component shows all the details about a repayment
// before the user either clicks "Schedule" in the case of reverse_ach
// or "Close" in the case of all other payment types.
import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import { Loans } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { LoanBeforeAfterPayment } from "lib/types";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(2),
      backgroundColor: "#fafafa",
      borderRadius: 3,
    },
    loanBeforeAfterPayment: {
      display: "flex",
      alignItems: "center",

      width: "100%",
      marginTop: theme.spacing(2),
    },
    middle: {
      display: "flex",
      justifyContent: "center",
      width: 40,
    },
    loanBeforePayment: {
      display: "flex",
      justifyContent: "flex-end",

      flex: 1,
    },
    loanAfterPayment: {
      flex: 1,
    },
  })
);

interface Props {
  isSettlePayment: boolean;
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
  setLoanBeforeAfterPayment?: (
    loanId: Loans["id"],
    field: string,
    value: number | null
  ) => void;
}

function LoansBeforeAfterPaymentPreview({
  isSettlePayment,
  loansBeforeAfterPayment,
  setLoanBeforeAfterPayment,
}: Props) {
  const classes = useStyles();

  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <Box className={classes.container}>
      <Box className={classes.loanBeforeAfterPayment}>
        <Box className={classes.loanBeforePayment}>
          <Typography variant="h6">Loans before payment</Typography>
        </Box>
        <Box className={classes.middle}>
          <ArrowRightAlt />
        </Box>
        <Box className={classes.loanAfterPayment}>
          <Typography variant="h6">Loans after payment</Typography>
        </Box>
      </Box>
      <Box className={classes.loanBeforeAfterPayment}>
        <Box display="flex" flexDirection="column" width={"100%"}>
          <Box display="flex" width="100%">
            <Box display="flex" justifyContent="space-between" flex={1}>
              <Box display="flex" justifyContent="flex-start" width={"25%"}>
                <Typography variant="subtitle2" align="left">
                  Identifier
                </Typography>
              </Box>
              <Box display="flex" justifyContent="flex-end" width={"25%"}>
                <Typography variant="subtitle2" align="right">
                  Principal
                </Typography>
              </Box>
              <Box display="flex" justifyContent="flex-end" width={"25%"}>
                <Typography variant="subtitle2" align="right">
                  Interest
                </Typography>
              </Box>
              <Box display="flex" justifyContent="flex-end" width={"25%"}>
                <Typography variant="subtitle2" align="right">
                  Late Fees
                </Typography>
              </Box>
            </Box>
            <Box className={classes.middle}>
              <ArrowRightAlt />
            </Box>
            <Box display="flex" justifyContent="space-between" flex={1}>
              <Box display="flex" justifyContent="flex-end" width={"33%"}>
                <Typography variant="subtitle2" align="right">
                  Principal
                </Typography>
              </Box>
              <Box display="flex" justifyContent="flex-end" width={"33%"}>
                <Typography variant="subtitle2" align="right">
                  Interest
                </Typography>
              </Box>
              <Box display="flex" justifyContent="flex-end" width={"33%"}>
                <Typography variant="subtitle2" align="right">
                  Fees
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" width={"100%"}>
            {loansBeforeAfterPayment.map((loanBeforeAfterPayment) => {
              const {
                loan_id: loanId,
                loan_identifier: loanIdentifier,
                loan_balance_before: loanBalanceBefore,
                loan_balance_after: loanBalanceAfter,
                transaction,
              } = loanBeforeAfterPayment;

              return (
                <Box key={loanId} display="flex" width={"100%"} mt={2}>
                  <Box display="flex" flexDirection="column" flex={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Box
                        display="flex"
                        justifyContent="flex-start"
                        width={"25%"}
                      >
                        <Typography variant="subtitle2" align="left">
                          {loanIdentifier}
                        </Typography>
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        width={"25%"}
                      >
                        <Typography variant="subtitle2" align="right">
                          {formatCurrency(
                            loanBalanceBefore.outstanding_principal_balance
                          )}
                        </Typography>
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        width={"25%"}
                      >
                        <Typography variant="subtitle2" align="right">
                          {formatCurrency(
                            loanBalanceBefore.outstanding_interest
                          )}
                        </Typography>
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        width={"25%"}
                      >
                        <Typography variant="subtitle2" align="right">
                          {formatCurrency(loanBalanceBefore.outstanding_fees)}
                        </Typography>
                      </Box>
                    </Box>
                    {isSettlePayment &&
                      isEditMode &&
                      setLoanBeforeAfterPayment && (
                        <Box display="flex" mb={2}>
                          <Box mr={1}>
                            <CurrencyInput
                              label={"To Principal"}
                              textAlign="right"
                              value={transaction.to_principal}
                              handleChange={(value) =>
                                setLoanBeforeAfterPayment(
                                  loanId,
                                  "to_principal",
                                  value
                                )
                              }
                            />
                          </Box>
                          <Box mr={1}>
                            <CurrencyInput
                              label={"To Interest"}
                              textAlign="right"
                              value={transaction.to_interest}
                              handleChange={(value) =>
                                setLoanBeforeAfterPayment(
                                  loanId,
                                  "to_interest",
                                  value
                                )
                              }
                            />
                          </Box>
                          <Box>
                            <CurrencyInput
                              label={"To Fees"}
                              textAlign="right"
                              value={transaction.to_fees}
                              handleChange={(value) =>
                                setLoanBeforeAfterPayment(
                                  loanId,
                                  "to_fees",
                                  value
                                )
                              }
                            />
                          </Box>
                        </Box>
                      )}
                  </Box>
                  <Box className={classes.middle}>
                    <ArrowRightAlt />
                  </Box>
                  <Box
                    key={loanId}
                    display="flex"
                    flexDirection="column"
                    flex={1}
                  >
                    <Box display="flex" justifyContent="space-between">
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        width={"33%"}
                      >
                        <Typography variant="subtitle2" align="right">
                          {formatCurrency(
                            loanBalanceAfter.outstanding_principal_balance
                          )}
                        </Typography>
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        width={"33%"}
                      >
                        <Typography variant="subtitle2" align="right">
                          {formatCurrency(
                            loanBalanceAfter.outstanding_interest
                          )}
                        </Typography>
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        width={"33%"}
                      >
                        <Typography variant="subtitle2" align="right">
                          {formatCurrency(loanBalanceAfter.outstanding_fees)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
          {isSettlePayment && (
            <Box width={"100%"} height={48} mt={2}>
              <Button
                variant="contained"
                color="default"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? "Stop Editing" : "Edit Payment"}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default LoansBeforeAfterPaymentPreview;
