import BespokeFinancialLogo from "components/Shared/Images/BespokeFinancialLogo.png";
import { ReactNode } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100vh;

  background-color: rgb(246, 245, 243);
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  width: 400px;
  padding: 40px;
  border-radius: 3px;
  background-color: white;
`;

const OuterSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  height: 120px;
`;

interface Props {
  children: ReactNode;
}

export default function AuthPage({ children }: Props) {
  return (
    <Wrapper>
      <OuterSection>
        <img
          src={BespokeFinancialLogo}
          alt="Bespoke Financial Logo"
          width={195}
          height={40}
        />
      </OuterSection>
      <Container>{children}</Container>
      <OuterSection />
    </Wrapper>
  );
}
