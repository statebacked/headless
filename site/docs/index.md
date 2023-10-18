---
slug: /
sidebar_position: 1
title: Getting Started
---
import { Rating } from "../src/components/rating";

# Getting started with State Backed Headless Features

Headless features are full-bodied, production-ready features, complete with scalable backend data storage, available through simple React hooks.
Connect any UI elements you'd like.

To use any headless hook, you first install the feature by running `npx @statebacked/headless install <feature-name>`.

Then, you can use the corresponding React hook anywhere in your app. No backend work to worry about.

## Using your first feature

Our ratings feature allows you to easily add ratings (e.g. star ratings) to any entity in your app.

1. Install it with `npx @statebacked/headless install unauthenticated-ratings`.

2. Then, you can use it like this:

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

### Live example

<Rating />

## Open source

All Headless features are fully [open source](https://github.com/statebacked/headless).
Feel free to check out the code, modify it, and deploy it yourself.

## State Backed

All Headless features are built on top of [State Backed](https://www.statebacked.dev), our state machine backend as a service.
When you install a feature, we will ask you to create a State Backed account if you don't already have one (no password or credit card required).
Then, we'll install the state machines that make up the Headless feature you asked to install into your State Backed account.

This makes it easy to update anything you want to change whenever you want by simply forking the machine definition from GitHub and deploying a new version of the corresponding State Backed machine.

Because State Backed has a generous free tier, casual usage of Headless features should be completely free.
You can [upgrade](https://docs.statebacked.dev/docs/pricing) your State Backed account to the Hobby tier ($20 / month) for an increased limit of 100k operations per month or upgrade to the Business tier for 2,500,000 operations per month if your app really takes off.

Or feel free to host the state machines yourself if you'd prefer.

## Other features

Want to request a feature? Shoot us a message at [feature-requests@statebacked.dev](mailto:feature-requests@statebacked.dev) and we'll be happy to help!
