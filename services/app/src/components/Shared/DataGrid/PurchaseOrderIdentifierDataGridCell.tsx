import { Box, Tooltip } from "@material-ui/core";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import MetrcLogo from "components/Shared/Images/MetrcLogo.png";
import { ColumnWidths } from "lib/tables";
import styled from "styled-components";

const MetrcLogoWrapper = styled(Box)`
  height: 24px;
  margin: auto 0;
  padding-top: 3px;
`;

interface Props {
  onClick: () => void;
  artifactName: string;
  isMetrcBased: boolean;
}

export default function PurchaseOrderIdentifierDataGridCell({
  onClick,
  artifactName,
  isMetrcBased,
}: Props) {
  return (
    <Box display="flex" flexDirection="row">
      <Box maxWidth={ColumnWidths.MinWidth - 40}>
        <ClickableDataGridCell onClick={onClick} label={artifactName} />
      </Box>
      {isMetrcBased && (
        <MetrcLogoWrapper>
          <Tooltip
            arrow
            interactive
            title={"Purchase order created from Metrc manifest"}
          >
            <img src={MetrcLogo} alt="Metrc Logo" width={24} height={24} />
          </Tooltip>
        </MetrcLogoWrapper>
      )}
    </Box>
  );
}
