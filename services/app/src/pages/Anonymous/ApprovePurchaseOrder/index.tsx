import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useContext } from "react";

interface Props {
  location: any;
}
function ApprovePurchaseOrder(props: Props) {
  const location: any = props.location;
  const { user } = useContext(CurrentUserContext);

  if (!location.state) {
    return <div>No state provided</div>;
  }

  const payload = location.state.payload;
  return (
    <div>
      Approve purchase order page with payload {JSON.stringify(payload)}
      <br />
      User: {JSON.stringify(user)}
    </div>
  );
}

export default ApprovePurchaseOrder;
