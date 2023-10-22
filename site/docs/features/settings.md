---
sidebar_position: 3
---
import { Settings } from "../../src/components/settings";

# Settings

`useUnauthenticatedSettings` and `useAuthenticatedSettings` are simple React hooks with ready-made, headless backends that you can pull into your app to implement any persistent settings.
For example, you may want to store the user's preference for light or dark mode, which page they want as their homescreen, or the layout for their dashboard widgets.
Instead of finding a place to store each tiny bit of state on your own backend or settling for inadequate browser storage, use this feature.

## Features

Each of your users can have an unlimited number of namespaces, each containing an object of settings. You can read the current settings per namespace and update a subset of the settings.

### Authenticated vs Un-Authenticated

The backend for the *un*-authenticated hook doesn't validate user identities and the backend for the authenticated hook does validate user identities.
This means that the *un*-authenticated relies on whatever `userId` you pass to it or generates a random ID tied to the user's device.
Unauthenticated features require no additional setup and are suitable for situations where users should not have to log in before interacting with the feature or where you don't want to connect your identity provider.
Authenticated features require a [one-time setup](../authentication.md) and will require passing in the access token from your identity-provider at runtime.

## Installation

Install the backend in your State Backed organization with:
```bash
npx @statebacked/headless install unauthenticated-settings
```

or

```bash
npx @statebacked/headless install authenticated-settings
```

Be sure to record the `orgId` provided by this command.

## Usage

```javascript
import { useUnauthenticatedToggle } from "@statebacked/headless";

export const YourComponent = () => {
  const {
    error,
    value,
    isLoading,
    toggle,
    set,
  } = useUnauthenticatedToggle({
    // TODO: replace with your org ID, printed during the install
    orgId: "org_ORG-ID-FROM-INSTALL",
    // TODO: replace with the ID of whatever we're rating
    itemId: "id-of-the-item-we're-rating",
    // optional, will use a device-specific ID, stored in localStorage if not provided
    userId: "CURRENT_USER_ID",
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
      <button onClick={() => set(true)}>Turn on</button>
    </div>
  )
}
```

## Live example

<Settings />

## Parameters

- `orgId`: The ID for the State Backed organization that you installed the feature in (printed when running `npx @statebacked/headless install unauthenticated-settings`)
- `namespace`: The namespace for this group of settings
- `defaultValue`: The default settings for this namespace (used for any settings the user has not yet explicitly set)
- `userId?`: The optional ID of the current user. If not provided, a random ID will be used and stored in `localStorage`.
- `localStorageKey?`: The optional key to use to store the user ID in `localStorage`. Defaults to "headless-user-id".

## Return properties

- `state`: "loading" | "error" | "data"
- `error?`: Any error that occurred (set if state === "error")
- `value`: The settings for this user for this namespace, merging explicitly-set user values with the provided default value
- `isLoading`: True if state === "loading"
- `isError`: True if state === "error"
- `set`: Function that sets a subset of the user's settings
