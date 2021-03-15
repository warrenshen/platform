import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogTitle,
  makeStyles,
  Theme,
} from "@material-ui/core";
import RegisterThirdPartyForm from "components/ThirdParties/RegisterThirdPartyForm";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  CompaniesInsertInput,
  CompanyTypeEnum,
  ListPayorPartnershipsByCompanyIdDocument,
  useAddPayorPartnershipMutation,
  UserRolesEnum,
  UsersInsertInput,
} from "generated/graphql";
import { InventoryNotifier } from "lib/notifications/inventory";
import { CustomerParams } from "pages/Bank/Customer";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
  })
);

interface Props {
  handleClose: () => void;
}

export default function RegisterPayorModal({ handleClose }: Props) {
  const {
    user: { companyId: userCompanyId, role },
  } = useContext(CurrentUserContext);

  const { companyId: paramsCompanyId } = useParams<CustomerParams>();
  const [errorMessage, setErrorMessage] = useState("");

  const companyId = paramsCompanyId || userCompanyId;

  const classes = useStyles();

  const [payor, setPayor] = useState<CompaniesInsertInput>({ name: "" });

  const [contact, setContact] = useState<UsersInsertInput>({
    first_name: "",
    email: "",
    last_name: "",
    phone_number: "",
  });
  const [AddPayorPartnership, { loading }] = useAddPayorPartnershipMutation();
  const notifier = new InventoryNotifier();

  const handleRegisterClick = async () => {
    try {
      const response = await AddPayorPartnership({
        variables: {
          payorPartnership: {
            company_id:
              role === UserRolesEnum.BankAdmin ? companyId : undefined,
            payor: {
              data: {
                name: payor.name,
                company_type: CompanyTypeEnum.Payor,
                users: {
                  data: [{ ...contact }],
                },
                settings: {
                  data: {},
                },
              },
            },
          },
        },
        refetchQueries: [
          {
            query: ListPayorPartnershipsByCompanyIdDocument,
            variables: {
              companyId: companyId,
            },
          },
        ],
      });

      const payorId =
        response.data?.insert_company_payor_partnerships_one?.payor_id;
      if (!payorId) {
        setErrorMessage("Error! Empty payor id provided");
        return;
      }
      const emailResp = await notifier.sendPayorAgreementWithCustomer({
        company_id: companyId,
        payor_id: payorId,
      });

      if (emailResp.status !== "OK") {
        setErrorMessage("Could not send email. Error: " + emailResp.msg);
        return;
      }

      handleClose();
    } catch (error) {
      setErrorMessage(
        "Could not create Payor. Please fill out all required fields and ensure the email is not already taken."
      );
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>Register Payor</DialogTitle>
      <RegisterThirdPartyForm
        companyType={CompanyTypeEnum.Payor}
        role={role}
        contact={contact}
        setContact={setContact}
        company={payor}
        setCompany={setPayor}
        errorMessage={errorMessage}
      />
      <DialogActions>
        <Box display="flex">
          <Box pr={1}>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
          <Button
            disabled={
              loading ||
              !payor.name ||
              !contact.first_name ||
              !contact.last_name ||
              !contact.email
            }
            onClick={handleRegisterClick}
            variant="contained"
            color="primary"
          >
            Register
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
