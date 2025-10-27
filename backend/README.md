# Backend scripts

- dev: Runs the server with tsx in watch mode (fast reload).
- build: Bundles with tsup (aliases resolved at build time).
- start: Runs the bundled server.
- test: Runs Jest with ts-jest and alias support.

## Setup

Create a .env with .env.example

## Try it

```bash
npm run dev
# in another shell
npm run build && npm start
npm test
```

