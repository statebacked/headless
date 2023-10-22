import React from "react";
import { useUnauthenticatedSettings } from "@statebacked/headless";
import BrowserOnly from '@docusaurus/BrowserOnly';

export const Settings = () => {
  return (
    <BrowserOnly>
      {() => <_Settings />}
    </BrowserOnly>
  )
}

const _Settings = () => {
  const {
    error,
    value,
    isLoading,
    set,
  } = useUnauthenticatedSettings({
    orgId: "org_ZiMaUawZQ_KJOHwIijPIoQ",
    namespace: "documentation-example",
    defaultValue: {
      colorMode: "dark",
      homepage: "https://www.statebacked.com"
    }
  });

  if (error) {
    return (
      <p className="error">Oops, we're having some trouble loading your settings.</p>
    );
  }

  if (isLoading) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <div>
      <fieldset>
        <label>Color mode:</label>
        <select value={value.colorMode} onChange={(e) => set({ colorMode: e.target.value })}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </fieldset>
      <fieldset>
        <label>Homepage:</label>
        <input
          type="text"
          value={value.homepage}
          onChange={(e) => set({ homepage: e.target.value })}
        />
      </fieldset>
    </div>
  );
}