---
sidebar_position: 1
---
import { Rating } from "../../src/components/rating";

# Rating

`useUnauthenticatedRating` and `useAuthenticatedRating` are simple React hooks with ready-made, headless backends that you can pull into your app to implement user ratings of anything.

## Features

Each of your users can rate and update their rating on any item and we provide an average rating with a count of how many users have rated each item.

### Authenticated vs Un-Authenticated

The backend for the *un*-authenticated hook doesn't validate user identities and the backend for the authenticated hook does validate user identities.
This means that the *un*-authenticated relies on whatever `userId` you pass to it or generates a random ID tied to the user's device.
Unauthenticated features require no additional setup and are suitable for situations where users should not have to log in before interacting with the feature or where you don't want to connect your identity provider.
Authenticated features require a [one-time setup](../authentication.md) and will require passing in the access token from your identity-provider at runtime.

## Installation

Install the backend in your State Backed organization with:
```bash
npx @statebacked/headless install unauthenticated-ratings
```

or

```bash
npx @statebacked/headless install authenticated-ratings
```

Be sure to record the `orgId` provided by this command.

## Usage

```javascript
import { useUnauthenticatedRating } from "@statebacked/headless";

export const YourComponent = () => {
  const {
    error,
    rating,
    isLoading,
    userRating,
    ratingCount,
    rate,
  } = useUnauthenticatedRating({
    // TODO: replace with your org ID, printed during the install
    orgId: "org_ORG-ID-FROM-INSTALL",
    // TODO: replace with the ID of whatever we're rating
    itemId: "id-of-the-item-we're-rating",
    // optional, will use a device-specific ID, stored in localStorage if not provided
    userId: "CURRENT_USER_ID",
  });

  if (error) {
    return (
      <p className="error">Oops, we're having some trouble loading ratings.</p>
    );
  }

  if (isLoading) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <div>
      <p>
        Current rating: {rating} (out of {ratingCount} review{ratingCount === 1 ? "" : "s"})
      </p>
      <div>
        <button className={userRating === 0 ? "chosen" : ""} onClick={() => rate(0)}>☆☆☆☆☆</button>
        <button className={userRating === 1 ? "chosen" : ""} onClick={() => rate(1)}>★☆☆☆☆</button>
        <button className={userRating === 2 ? "chosen" : ""} onClick={() => rate(2)}>★★☆☆☆</button>
        <button className={userRating === 3 ? "chosen" : ""} onClick={() => rate(3)}>★★★☆☆</button>
        <button className={userRating === 4 ? "chosen" : ""} onClick={() => rate(4)}>★★★★☆</button>
        <button className={userRating === 5 ? "chosen" : ""} onClick={() => rate(5)}>★★★★★</button>
      </div>
    </div>
  );
}
```

## Live example

<Rating />

## Parameters

- `orgId`: The ID for the State Backed organization that you installed the feature in (printed when running `npx @statebacked/headless install unauthenticated-ratings`)
- `itemId`: The ID of the item being rated
- `userId?`: The optional ID of the current user. If not provided, a random ID will be used and stored in `localStorage`.
- `localStorageKey?`: The optional key to use to store the user ID in `localStorage`. Defaults to "headless-rating-user-id".

## Return properties

- `state`: "loading" | "unrated" | "error" | "rated"
- `error?`: Any error that occurred (set if state === "error")
- `rating?`: The average rating of the item across all users (set if state === "rated")
- `isLoading`: True if state === "loading"
- `isError`: True if state === "error"
- `hasRating`: True if state === "rated", indicating at least one user has rated the item
- `hasUserRated`: True if the current user has rated the item
- `userRating?`: The current user's rating of the item
- `ratingCount?`: The total number of users who have rated the item
- `rate`: Function that accepts a rating for the current user and saves it
