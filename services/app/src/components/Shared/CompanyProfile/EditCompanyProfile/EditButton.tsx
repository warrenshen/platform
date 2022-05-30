import { Button, Theme, createStyles, makeStyles } from "@material-ui/core";
import { CompanyFragment } from "generated/graphql";
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
  company: CompanyFragment;
  handleDataChange: () => void;
}

function EditButton({ company, handleDataChange }: Props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <EditCompanyProfileModal
          company={company}
          handleClose={() => {
            setOpen(false);
            handleDataChange();
          }}
        />
      )}
      <Button
        className={classes.editButton}
        onClick={() => setOpen(true)}
        color="default"
        variant="outlined"
        size="small"
      >
        Edit
      </Button>
    </>
  );
}

export default EditButton;
