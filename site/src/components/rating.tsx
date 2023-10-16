import React from "react";
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

  return (
    <div>
      <p>
        Current rating: {rating} (out of {ratingCount} review{ratingCount === 1 ? "" : "s"})
      </p>
      <div>
        <button onClick={() => rate(0)}>☆☆☆☆☆</button>
        <button onClick={() => rate(1)}>★☆☆☆☆</button>
        <button onClick={() => rate(2)}>★★☆☆☆</button>
        <button onClick={() => rate(3)}>★★★☆☆</button>
        <button onClick={() => rate(4)}>★★★★☆</button>
        <button onClick={() => rate(5)}>★★★★★</button>
      </div>
    </div>
  )
}