import { CurrentUserContext } from "contexts/CurrentUserContext";
import { isPlatformModeAllowedGivenAllowedRoles } from "contexts/CurrentUserProvider";
import {
  UserRolesEnum,
  useGetCompanyWithDetailsByCompanyIdQuery,
  useGetMostRecentFinancialSummaryAndContractByCompanyIdQuery,
} from "generated/graphql";
import { PlatformModeEnum, ProductTypeEnum } from "lib/enum";
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
    user: { companyId, allowedRoles, platformMode },
    setUserProductType,
    setUserIsActiveContract,
    isSignedIn,
  } = useContext(CurrentUserContext);

  const canVisitRoute =
    props.requiredRoles && allowedRoles
      ? props.requiredRoles.some((requiredRole) =>
          allowedRoles?.includes(requiredRole)
        )
      : false;

  const isPlatformModeAllowed = isPlatformModeAllowedGivenAllowedRoles(
    platformMode,
    allowedRoles
  );

  const shouldRender = isSignedIn && canVisitRoute && isPlatformModeAllowed;

  const { data, error } = useGetCompanyWithDetailsByCompanyIdQuery({
    skip: companyId === null || platformMode === PlatformModeEnum.Vendor,
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
    skip: companyId === null || platformMode === PlatformModeEnum.Vendor,
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
    if (platformMode !== PlatformModeEnum.Bank && productType) {
      setUserProductType(productType as ProductTypeEnum);
      setUserIsActiveContract(isActiveContract);
    }
  }, [
    platformMode,
    isActiveContract,
    productType,
    setUserProductType,
    setUserIsActiveContract,
  ]);

  return <>{shouldRender ? children : <Navigate to={routes.signIn} />}</>;
}
