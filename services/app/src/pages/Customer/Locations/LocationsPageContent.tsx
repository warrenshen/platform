import { Box, Button, Divider, Typography } from "@material-ui/core";
import CustomerFinancialSummaryPreview from "components/CustomerFinancialSummary/CustomerFinancialSummaryPreview";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  ParentCompanies,
  useGetParentCompanyWithCompaniesQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { switchLocationMutation } from "lib/api/auth";
import { setAccessToken, setRefreshToken } from "lib/auth/tokenStorage";
import { todayAsDateStringServer } from "lib/date";
import { customerRoutes } from "lib/routes";
import { useContext } from "react";
import { useHistory } from "react-router-dom";

interface Props {
  parentCompanyId: ParentCompanies["id"];
}

export default function CustomerLocationsPageContent({
  parentCompanyId,
}: Props) {
  const history = useHistory();
  const snackbar = useSnackbar();
  const { resetUser, user } = useContext(CurrentUserContext);

  const { data, error } = useGetParentCompanyWithCompaniesQuery({
    skip: !parentCompanyId,
    fetchPolicy: "network-only",
    variables: {
      parent_company_id: parentCompanyId,
      date: todayAsDateStringServer(),
    },
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  const companies = data?.parent_companies_by_pk?.companies || [];

  const [switchLocation, { loading: isSwitchLocationLoading }] =
    useCustomMutation(switchLocationMutation);

  const handleClickSwitchLocation = async (companyId: Companies["id"]) => {
    const response = await switchLocation({
      variables: {
        company_id: companyId,
        impersonator_user_id: user.impersonator_user_id,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Could not switch location. Error: ${response.msg}`);
    } else {
      setAccessToken(response.data?.access_token);
      setRefreshToken(response.data?.refresh_token);
      resetUser();
      history.push(customerRoutes.overview);
    }
  };

  return (
    <PageContent title={"Select Location"}>
      <Box display="flex" flexDirection="column" mt={2}>
        {companies.map((company, index) => (
          <Box key={company.id}>
            <Box display="flex" flexDirection="column">
              <Box display="flex" justifyContent="space-between">
                <Typography variant={"h5"}>
                  <strong>{company.name}</strong>
                </Typography>
                <Button
                  disabled={isSwitchLocationLoading}
                  color="primary"
                  variant="contained"
                  data-cy={`select-location-button-${index}`}
                  onClick={() => handleClickSwitchLocation(company.id)}
                >
                  Select Location
                </Button>
              </Box>
              <Box display="flex" mt={4}>
                <CustomerFinancialSummaryPreview
                  financialSummary={company?.financial_summaries[0] || null}
                />
              </Box>
            </Box>
            {index < companies.length - 1 && (
              <Box mb={6}>
                <Divider />
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </PageContent>
  );
}
