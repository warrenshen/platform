import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  UserRolesEnum,
  useGetCompanyWithDetailsByCompanyIdQuery,
  useGetMostRecentFinancialSummaryAndContractByCompanyIdQuery,
} from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import { routes } from "lib/routes";
import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  requiredRoles: Array<UserRolesEnum>;
}

export default function PrivateRoute(props: Props) {
  const { children } = props;
  const {
    user: { companyId, role },
    setUserProductType,
    setUserIsActiveContract,
    isSignedIn,
  } = useContext(CurrentUserContext);

  const canVisitRoute =
    props.requiredRoles && !!role ? props.requiredRoles.includes(role) : false;

  const shouldRender = isSignedIn && canVisitRoute;

  const { data, error } = useGetCompanyWithDetailsByCompanyIdQuery({
    skip: companyId === null,
    variables: {
      companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;

  const {
    data: financialSummaryAndContractData,
    error: financialSummaryAndContractError,
  } = useGetMostRecentFinancialSummaryAndContractByCompanyIdQuery({
    skip: companyId === null,
    variables: {
      companyId,
    },
  });

  if (financialSummaryAndContractError) {
    alert(
      `Error in query (details in console): ${financialSummaryAndContractError.message}`
    );
  }

  const mostRecentFinancialSummary =
    financialSummaryAndContractData?.financial_summaries[0];

  const productType = mostRecentFinancialSummary?.product_type
    ? mostRecentFinancialSummary.product_type
    : financialSummaryAndContractData?.contracts[0]?.product_type;

  const isActiveContract = !!company?.contract;

  useEffect(() => {
    if (!isRoleBankUser(role) && productType) {
      setUserProductType(productType as ProductTypeEnum);
      setUserIsActiveContract(isActiveContract);
    }
  }, [
    role,
    isActiveContract,
    productType,
    setUserProductType,
    setUserIsActiveContract,
  ]);

  return <>{shouldRender ? children : <Navigate to={routes.signIn} />}</>;
}
