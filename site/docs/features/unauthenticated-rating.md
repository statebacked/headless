---
sidebar_position: 1
---
import { Rating } from "../../src/components/rating";

# Unauthenticated Rating

`useUnauthenticatedRating` is a feature that implements user ratings of any items.
Each user can rate and update their rating and we provide an average rating with a count of how many users have rated each item.

## Installation

Install with `npx @simplystated/headless install unauthenticated-ratings`.

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
