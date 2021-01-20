import Settings from "components/Shared/Settings";
import useAppBarTitle from "hooks/useAppBarTitle";
import React from "react";
import { useTitle } from "react-use";

function SettingsPage() {
  useTitle("Settings | Bespoke");
  useAppBarTitle("Settings");

  return <Settings></Settings>;
}

export default SettingsPage;
