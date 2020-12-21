import { Button, createStyles, makeStyles, Theme } from "@material-ui/core";
import { CompanyFragment } from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { useState } from "react";
import EditCompanyProfileModal from "./EditCompanyProfileModal";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    editButton: {
      marginTop: theme.spacing(2),
    },
  })
);

interface Props {
  company: Maybe<CompanyFragment>;
}

function EditButton({ company }: Props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <EditCompanyProfileModal
          company={company}
          handleClose={() => setOpen(false)}
        ></EditCompanyProfileModal>
      )}
      <Button
        className={classes.editButton}
        onClick={() => setOpen(true)}
        color="primary"
        variant="contained"
      >
        Edit
      </Button>
    </>
  );
}

export default EditButton;
