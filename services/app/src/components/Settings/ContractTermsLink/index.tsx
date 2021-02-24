import { Link } from "@material-ui/core";
import ContractTermsModal from "components/Contract/UpdateContractTermsModal";
import { Contracts } from "generated/graphql";
import { useState } from "react";

// Shows a link to open the contract terms and view it.

interface Props {
  linkText: string;
  contractId: Contracts["id"];
}

function ContractTermsLink({ linkText, contractId }: Props) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      {isModalOpen && (
        <ContractTermsModal
          contractId={contractId}
          handleClose={() => setModalOpen(false)}
        />
      )}
      <Link
        href="#"
        onClick={() => {
          setModalOpen(true);
        }}
      >
        {linkText}
      </Link>
    </>
  );
}

export default ContractTermsLink;
