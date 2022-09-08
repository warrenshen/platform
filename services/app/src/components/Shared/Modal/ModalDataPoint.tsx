import { Box, Typography } from "@material-ui/core";
import {
  DisabledSecondaryTextColor,
  TextColor,
} from "components/Shared/Colors/GlobalColors";
import { Maybe } from "generated/graphql";
import styled from "styled-components";

const DataPointBox = styled(Box)<{}>`
  margin-bottom: 24px;
`;

const ModalSubtitle = styled(Typography)<{}>`
  color: ${DisabledSecondaryTextColor};
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 133.3%;
  margin-bottom: 8px;
`;

const ModalText = styled(Typography)<{}>`
  color: ${TextColor};
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 133.3%;
`;

interface Props {
  subtitle: Maybe<string>;
  text: Maybe<string>;
}

export default function ModalDataPoint({ subtitle, text }: Props) {
  return (
    <DataPointBox display="flex" flexDirection="column">
      <ModalSubtitle variant="subtitle2" color="textSecondary">
        {subtitle}
      </ModalSubtitle>
      <ModalText variant={"body1"}>{text}</ModalText>
    </DataPointBox>
  );
}
