# NPM Chart

Visualize your package npm downloads in a beautiful chart, ready to be shared with your community.

https://npm.chart.dev

https://github.com/user-attachments/assets/cc98763a-f937-42c3-a82f-4d48ab993a65

## Features

- Beautiful page for your npm package
- Downloads chart to png or svg
- Metrics are cached for maximum performance
- Running on the Edge with [NuxtHub](https://hub.nuxt.com)
- Using [npm-stat.com](https://npm-stat.com) API

## Stack

- [Nuxt](https://github.com/nuxt/nuxt) + [UI](https://github.com/nuxt/ui) + [Icon](https://github.com/nuxt/icon) + [Fonts](https://github.com/nuxt/fonts)
- [Nuxt OG Image](https://github.com/nuxt-modules/og-image)
- [NuxtHub](https://github.com/nuxthub/core)
- [UnoVis](https://github.com/f5/unovis)
- [Modern Screenshot](https://github.com/qq15725/modern-screenshot?tab=readme-ov-file)

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


## Credits

- [npm-stat.com](https://npm-stat.com) for the npm downloads API
- [@danielroe](https://github.com/danielroe) for the domain name

## License

[MIT](./LICENSE)
