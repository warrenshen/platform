import {
  Button,
  Card,
  CardActions,
  CardContent,
  createStyles,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import {
  BankVendorPartnershipDocument,
  BankVendorPartnershipQuery,
  BankVendorPartnershipQueryVariables,
  Companies,
  CompanyVendorPartnerships,
  ContactFragment,
  useAddVendorContactMutation,
  UsersInsertInput,
  useUpdateVendorContactMutation,
} from "generated/graphql";
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      width: 240,
    },
    nameInput: {
      width: 200,
    },
  })
);

export enum CardState {
  Viewing = "viewing",
  Editing = "editing",
  Creating = "creating",
}

interface Props {
  contact?: ContactFragment;
  creating?: boolean;
  onCreateComplete?: () => void;
  companyId?: Companies["id"];
  companyVendorPartnershipId: CompanyVendorPartnerships["id"];
}

function ContactCard(props: Props) {
  const classes = useStyles();
  const [contact, setContact] = useState<UsersInsertInput>(
    props.contact || { company_id: props.companyId }
  );
  const [cardState, setCardState] = useState<CardState>(
    props.creating ? CardState.Creating : CardState.Viewing
  );
  const [updateContact] = useUpdateVendorContactMutation();
  const [addContact] = useAddVendorContactMutation();

  useEffect(() => {
    setContact(props.contact || { company_id: props.companyId });
  }, [props.companyId, props.contact]);

  return (
    <Card className={classes.card}>
      <CardContent>
        {cardState !== CardState.Viewing ? (
          <>
            <TextField
              label="First Name"
              required
              className={classes.nameInput}
              value={contact.first_name}
              onChange={({ target: { value } }) => {
                setContact({ ...contact, first_name: value });
              }}
            ></TextField>
            <TextField
              label="Last Name"
              required
              className={classes.nameInput}
              value={contact.last_name}
              onChange={({ target: { value } }) => {
                setContact({ ...contact, last_name: value });
              }}
            ></TextField>
            <TextField
              label="Email"
              required
              className={classes.nameInput}
              value={contact.email}
              onChange={({ target: { value } }) => {
                setContact({ ...contact, email: value });
              }}
            ></TextField>
            <TextField
              label="Phone Number"
              className={classes.nameInput}
              value={contact.phone_number}
              onChange={({ target: { value } }) => {
                setContact({ ...contact, phone_number: value });
              }}
            ></TextField>
          </>
        ) : (
          <>
            <Typography variant="subtitle1">
              {props?.contact?.full_name}
            </Typography>
            <Typography variant="subtitle1">{props?.contact?.email}</Typography>
            <Typography variant="subtitle1">
              {props?.contact?.phone_number}
            </Typography>
          </>
        )}
      </CardContent>

      <CardActions>
        {cardState === CardState.Viewing ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setCardState(CardState.Editing)}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setCardState(CardState.Viewing);
                props.onCreateComplete && props.onCreateComplete();
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={
                !contact.first_name || !contact.last_name || !contact.email
              }
              variant="contained"
              size="small"
              color="primary"
              onClick={async () => {
                if (cardState === CardState.Editing) {
                  await updateContact({
                    variables: {
                      userId: contact.id,
                      contact: {
                        first_name: contact.first_name,
                        last_name: contact.last_name,
                        email: contact.email,
                        phone_number: contact.phone_number,
                      },
                    },
                    optimisticResponse: {
                      update_users_by_pk: {
                        ...(contact as ContactFragment),
                      },
                    },
                  });
                } else if (cardState === CardState.Creating) {
                  await addContact({
                    variables: {
                      contact,
                    },
                    optimisticResponse: {
                      insert_users_one: {
                        ...(contact as ContactFragment),
                      },
                    },
                    update: (proxy, { data: optimisticResponse }) => {
                      if (props.companyId) {
                        const data = proxy.readQuery<
                          BankVendorPartnershipQuery,
                          BankVendorPartnershipQueryVariables
                        >({
                          query: BankVendorPartnershipDocument,
                          variables: { id: props.companyVendorPartnershipId },
                        });

                        if (
                          !data?.company_vendor_partnerships_by_pk?.vendor ||
                          !optimisticResponse?.insert_users_one
                        ) {
                          return;
                        }

                        proxy.writeQuery<
                          BankVendorPartnershipQuery,
                          BankVendorPartnershipQueryVariables
                        >({
                          query: BankVendorPartnershipDocument,
                          variables: { id: props.companyVendorPartnershipId },
                          data: {
                            company_vendor_partnerships_by_pk: {
                              ...data.company_vendor_partnerships_by_pk,
                              vendor: {
                                ...data.company_vendor_partnerships_by_pk
                                  .vendor,
                                users: [
                                  ...data.company_vendor_partnerships_by_pk
                                    .vendor.users,
                                  optimisticResponse.insert_users_one,
                                ],
                              },
                            },
                          },
                        });
                      }
                    },
                  });
                  props.onCreateComplete && props.onCreateComplete();
                }
                setCardState(CardState.Viewing);
              }}
            >
              Submit
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
}

export default ContactCard;
