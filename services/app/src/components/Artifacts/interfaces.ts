import { Scalars } from "generated/graphql";

export interface IdProps {
  id: Scalars["uuid"];
}

export type IdComponent = (props: IdProps) => JSX.Element | null;
