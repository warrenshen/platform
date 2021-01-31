import { Link } from "@material-ui/core";
import ContractTermsModal, {
  ContractConfig,
} from "components/Shared/Settings/ContractTermsModal";
import { useState } from "react";

// Shows a link to open the contract terms and view it.

interface Props {
  linkText: string;
  contractConfig: ContractConfig;
  onSave?: (newContractConfig: ContractConfig) => void;
}

function ContractTermsLink(props: Props) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      {isModalOpen && (
        <ContractTermsModal
          onClose={() => {
            setModalOpen(false);
          }}
          onSave={(newContractConfig: ContractConfig) => {
            setModalOpen(false);
            if (props.onSave) {
              props.onSave(newContractConfig);
            }
          }}
          contractConfig={props.contractConfig}
        ></ContractTermsModal>
      )}
      <Link
        href="#"
        onClick={() => {
          setModalOpen(true);
        }}
      >
        {props.linkText}
      </Link>
    </>
  );
}

export default ContractTermsLink;
