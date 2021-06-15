import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: "flex-start";
  align-items: center;

  width: 100%;
  min-width: 0px;
  height: 50px;

  overflow: hidden;
`;

const Text = styled.span`
  width: 100%;
  height: 20px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

interface Props {
  label: string;
}

export default function TextDataGridCell({ label }: Props) {
  return (
    <Container>
      <Text>{label}</Text>
    </Container>
  );
}
