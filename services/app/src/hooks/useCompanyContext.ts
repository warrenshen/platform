import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useContext } from "react";
import { useParams } from "react-router-dom";

export interface CustomerParams {
  companyId: string;
}

function useCompanyContext() {
  const { companyId: companyIdFromParams } = useParams<CustomerParams>();
  const {
    user: { companyId: companyIdForUser },
  } = useContext(CurrentUserContext);

  return (
    companyIdFromParams ||
    (companyIdForUser === "None" ? null : companyIdForUser)
  );
}

export default useCompanyContext;
