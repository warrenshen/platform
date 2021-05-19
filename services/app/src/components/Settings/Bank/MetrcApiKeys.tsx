import { MetrcApiKeyFragment } from "generated/graphql";

interface Props {
  metrcApiKey: MetrcApiKeyFragment;
}

export default function MetrcApiKeys(props: Props) {
  if (props.metrcApiKey) {
    return <div>Metrc API key is setup</div>;
  } else {
    return <div>No Metrc API key setup yet</div>;
  }
}
