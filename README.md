# EasyID Node.js SDK

Official TypeScript SDK for the EasyID identity verification API.

## Install

```bash
npm install easyid
```

## Usage

```ts
import { EasyID } from "easyid";

const client = new EasyID("ak_xxx", "sk_xxx");

const result = await client.idcard.verify2("张三", "110101199001011234");
console.log(result.match);
```

## Notes

- This is a server-side SDK. Do not expose `secret` in browsers or mobile apps.
- For private deployments, pass `baseURL` in the client options.
- See `../docs/integration-guide.md` for end-to-end integration and troubleshooting.
