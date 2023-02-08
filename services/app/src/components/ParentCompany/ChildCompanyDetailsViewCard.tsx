import { Box } from "@material-ui/core";
import EditChildCompanyModal from "components/ParentCompany/EditChildCompanyModal";
import CardLine from "components/Shared/Card/CardLine";
import CompanyInformationChip from "components/Shared/Chip/CompanyInformationChip";
import { PrimaryDefaultColor } from "components/Shared/Colors/GlobalColors";
import { ReactComponent as EditIcon } from "components/Shared/Layout/Icons/EditPencil.svg";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useNavigate } from "react-router-dom";

import CardContainer from "../Shared/Card/CardContainer";
import ModalButton from "../Shared/Modal/ModalButton";

interface Props {
  companyId: string;
  companyName: string;
  isCustomer: boolean;
  isVendor: boolean;
  isPayor: boolean;
  identifier: string;
  dba: string;
  timezone: string;
  usState: string;
  employerIdentificationNumber: string;
  address: string;
  phoneNumber: string;
  submittedAt: string;
  refetch: () => void;
}

export default function ChildCompanyDetailsViewCard({
  companyId,
  companyName,
  isCustomer,
  isVendor,
  isPayor,
  identifier,
  dba,
  timezone,
  usState,
  employerIdentificationNumber,
  address,
  phoneNumber,
  submittedAt,
  refetch,
}: Props) {
  const navigate = useNavigate();

  return (
    <CardContainer width={"600px"}>
      <Box>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex">
            <Text
              materialVariant="h3"
              color={PrimaryDefaultColor}
              textVariant={TextVariants.SubHeader}
              dataCy="child-company-name"
              handleClick={() =>
                navigate(
                  getBankCompanyRoute(companyId, BankCompanyRouteEnum.Overview)
                )
              }
            >
              {`${companyName}`}
            </Text>
          </Box>
          <Box display="flex">
            <ModalButton
              label={""}
              startIcon={<EditIcon />}
              dataCy="edit-child-company-button"
              color={undefined}
              variant={"text"}
              modal={({ handleClose }) => (
                <EditChildCompanyModal
                  companyId={companyId}
                  name={companyName}
                  identifier={identifier}
                  dbaName={dba}
                  state={usState}
                  employerIdentificationNumber={employerIdentificationNumber}
                  address={address}
                  timezone={timezone}
                  phoneNumber={phoneNumber}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Box>
        </Box>
        <Box mb={2} mt={-2}>
          <Box display="flex">
            {isCustomer && (
              <Box display="flex" mr={1}>
                <CompanyInformationChip labelText="Customer" />
              </Box>
            )}
            {isVendor && (
              <Box display="flex" mr={1}>
                <CompanyInformationChip labelText="Vendor" />
              </Box>
            )}
            {isPayor && (
              <Box display="flex" mr={1}>
                <CompanyInformationChip labelText="Payor" />
              </Box>
            )}
          </Box>
        </Box>
        <CardLine
          dataCy={"child-company-identifier"}
          labelText={"Identifier"}
          valueText={identifier}
        />
        <CardLine
          dataCy={"child-company-dba"}
          labelText={"DBA"}
          valueText={dba}
        />
        <CardLine
          dataCy={"child-company-state"}
          labelText={"US State"}
          valueText={usState}
        />
        <CardLine
          dataCy={"child-company-ein"}
          labelText={"EIN"}
          valueText={employerIdentificationNumber}
        />
        <CardLine
          dataCy={"child-company-address"}
          labelText={"Address"}
          valueText={address}
        />
        <CardLine
          dataCy={"child-company-phone-number"}
          labelText={"Phone Number"}
          valueText={phoneNumber}
        />
        <CardLine labelText={"Submitted At"} valueText={submittedAt} />
      </Box>
    </CardContainer>
  );
}
