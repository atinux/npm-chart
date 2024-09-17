# Hello Edge

A minimal [Nuxt](https://nuxt.com) starter deployed on the Edge using [NuxtHub](https://hub.nuxt.com).

https://hello.nuxt.dev

<a href="https://hello.nuxt.dev">
<img src="https://github.com/nuxt-hub/hello-edge/assets/904724/99d1bd54-ef7e-4ac9-83ad-0a290f85edcf" alt="Hello World template for NuxtHub" />
</a>

## Features

- Server-Side rendering on Cloudflare Workers
- ESLint setup
- Ready to add a database, blob and KV storage
- One click deploy on 275+ locations for free

## Setup

Make sure to install the dependencies with [pnpm](https://pnpm.io/installation#using-corepack):

```bash
pnpm install
```

You can update the main text displayed by creating a `.env`:

```bash
NUXT_PUBLIC_HELLO_TEXT="Hello my world!"
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

## Deploy


Deploy the application on the Edge with [NuxtHub](https://hub.nuxt.com) on your Cloudflare account:

```bash
npx nuxthub deploy
```

Then checkout your server logs, analaytics and more in the [NuxtHub Admin](https://admin.hub.nuxt.com).

You can also deploy using [Cloudflare Pages CI](https://hub.nuxt.com/docs/getting-started/deploy#cloudflare-pages-ci).

