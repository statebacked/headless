---
sidebar_position: 2
---
import { Toggle } from "../../src/components/toggle";

# Toggle

`useUnauthenticatedToggle` and `useAuthenticatedToggle` are simple React hooks with ready-made, headless backends that you can pull into your app to implement any persistent toggles.
For example, we commonly need to show an experience to a user once and hide it once they've dismissed it.
Instead of finding a place to store that tiny bit of state on your own backend or settling for inadequate browser storage, use this feature.

## Features

Each of your users can have an unlimited number of toggles for features in your app. You can read the current state per feature and toggle or set the state.

### Authenticated vs Un-Authenticated

The backend for the *un*-authenticated hook doesn't validate user identities and the backend for the authenticated hook does validate user identities.
This means that the *un*-authenticated relies on whatever `userId` you pass to it or generates a random ID tied to the user's device.
Unauthenticated features require no additional setup and are suitable for situations where users should not have to log in before interacting with the feature or where you don't want to connect your identity provider.
Authenticated features require a [one-time setup](../authentication.md) and will require passing in the access token from your identity-provider at runtime.

## Installation

Install the backend in your State Backed organization with:
```bash
npx @statebacked/headless install unauthenticated-toggle
```

or

```bash
npx @statebacked/headless install authenticated-toggle
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

<Toggle />

## Parameters

- `orgId`: The ID for the State Backed organization that you installed the feature in (printed when running `npx @statebacked/headless install unauthenticated-toggle`)
- `itemId`: The ID of the item being toggled
- `userId?`: The optional ID of the current user. If not provided, a random ID will be used and stored in `localStorage`.
- `localStorageKey?`: The optional key to use to store the user ID in `localStorage`. Defaults to "headless-user-id".

## Return properties

- `state`: "loading" | "error" | "data"
- `error?`: Any error that occurred (set if state === "error")
- `value`: The boolean value of the toggle (set if state === "data")
- `isLoading`: True if state === "loading"
- `isError`: True if state === "error"
- `toggle`: Function that toggles the current value
- `turnOn`: Function that forces the value to true
- `turnOff`: Function that forces the value to false
- `set`: Function that sets the current value
