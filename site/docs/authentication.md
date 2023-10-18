---
sidebar_position: 3
title: Authentication
---

# Authentication

All of the State Backed Headless features come in *un*authenticated variants, which allow you to embed the feature in your app without dealing with user authentication at all.
However, if you'd like to ensure that some features are only used to authenticated users and to ensure that no user can ever impersonate another, you'll want to use the authenticated variant of a feature.

## Set it up

If you're using Auth0, run:

```bash
npx @statebacked/headless setup-auth auth0 \
  --domain '<YOUR_AUTH0_DOMAIN>'
```

For AWS Cognito:

```bash
npx @statebacked/headless setup-auth cognito \
  --user-pool-id '<YOUR_COGNITO_USER_POOL_ID>' \
  --region '<AWS_REGION_FOR_USER_POOL>'
```

For Supabase:

```bash
npx @statebacked/headless setup-auth supabase \
  --project '<SUPABASE_PROJCET_ID>' \
  --secret '<SUPABASE_JWT_SECRET>'
```

## How it works

State Backed reuses your existing authentication provider to prove user identities.

1. First, you'll configure your identity provider in State Backed. This step is done for you automatically if you use an identity provider with built-in support when run the above commands but we support any identity provider that vends JWTs. For identity providers without built-in support, you'll need to provide the audience and/or issuer for the token as well as the verification key (or JWKS url) so that State Backed can verify tokens (or [contact us](mailto:help@statebacked.dev) and we'll build-in support!).
2. Then, you'll provide your identity provider's access token to the Headless hook at runtime.
3. That's it. That will allow State Backed to ensure that only authenticated users can access a particular feature.

## Can you use both authenticated and un-authenticated features in the same app?

Yes!

However, if you use both an authenticated and un-authenticated rating feature, for example, authenticated and un-authenticated ratings will be completely separate; we won't aggregate authenticated and un-authenticated ratings.

## Learn more

We rely on State Backed's support for [token exchange](https://docs.statebacked.dev/docs/concepts/token-exchange) to enable seamless authentication on top of your existing identity provider.
Learn more about how this works [here](https://docs.statebacked.dev/docs/concepts/token-exchange).
