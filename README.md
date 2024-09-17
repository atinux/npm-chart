# NPM Chart

Visualize npm downloads in a beautiful chart, ready to be shared with your community.

https://npm.chart.dev

## Features

- Beautiful page for your npm package
- Downloads chart to png or svg
- Metrics are cached for maximum performance
- Running on the Edge with [NuxtHub](https://hub.nuxt.com)
- Using [npm-stat.com API](https://npm-stat.com)

## Setup

Make sure to install the dependencies with [pnpm](https://pnpm.io/installation#using-corepack):

```bash
pnpm install
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

