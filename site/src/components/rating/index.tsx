import React from "react";
import { useUnauthenticatedRating } from "@statebacked/headless";
import styles from "./rating.module.css";

export const Rating = () => {
  const {
    error,
    rating,
    isLoading,
    userRating,
    ratingCount,
    rate,
  } = useUnauthenticatedRating({
    orgId: "org_ZiMaUawZQ_KJOHwIijPIoQ",
    itemId: "documentation-example",
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
      <div className={styles.buttons}>
        <button className={userRating === 0 ? styles.chosen : ""} onClick={() => rate(0)}>☆☆☆☆☆</button>
        <button className={userRating === 1 ? styles.chosen : ""} onClick={() => rate(1)}>★☆☆☆☆</button>
        <button className={userRating === 2 ? styles.chosen : ""} onClick={() => rate(2)}>★★☆☆☆</button>
        <button className={userRating === 3 ? styles.chosen : ""} onClick={() => rate(3)}>★★★☆☆</button>
        <button className={userRating === 4 ? styles.chosen : ""} onClick={() => rate(4)}>★★★★☆</button>
        <button className={userRating === 5 ? styles.chosen : ""} onClick={() => rate(5)}>★★★★★</button>
      </div>
    </div>
  )
}