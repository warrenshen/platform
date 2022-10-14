import {
  DisabledSecondaryTextColor,
  TextColor,
} from "components/Shared/Colors/GlobalColors";
import { Maybe } from "generated/graphql";
import styled from "styled-components";

const DataPointBox = styled.div<{}>`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
`;

const ModalSubtitle = styled.p<{}>`
  color: ${DisabledSecondaryTextColor};
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 133.3%;
  margin: 0;
  margin-bottom: 8px;
`;

const ModalText = styled.p<{}>`
  color: ${TextColor};
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 133.3%;
  margin: 0;
`;

interface Props {
  subtitle: Maybe<string>;
  text: Maybe<string>;
}

export default function ModalDataPoint({ subtitle, text }: Props) {
  return (
    <DataPointBox>
      <ModalSubtitle>{subtitle}</ModalSubtitle>
      <ModalText>{text}</ModalText>
    </DataPointBox>
  );
}
