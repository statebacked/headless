import React from "react";
import { useUnauthenticatedToggle } from "@statebacked/headless";
import BrowserOnly from '@docusaurus/BrowserOnly';

export const Toggle = () => {
  return (
    <BrowserOnly>
      {() => <_Toggle />}
    </BrowserOnly>
  )
}

const _Toggle = () => {
  const {
    error,
    value,
    isLoading,
    toggle,
  } = useUnauthenticatedToggle({
    orgId: "org_ZiMaUawZQ_KJOHwIijPIoQ",
    itemId: "documentation-example",
  });

  if (error) {
    return (
      <p className="error">Oops, we're having some trouble loading your toggle state.</p>
    );
  }

  if (isLoading) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <div>
      <button onClick={toggle}>{value ? "Turn off" : "Turn on"}</button>
      <p>Current state: {value ? "On" : "Off"}</p>
    </div>
  );
}