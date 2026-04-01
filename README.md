# EasyID Node.js SDK

Official TypeScript SDK for the EasyID identity verification API.

EasyID 易验云 focuses on identity verification and security risk control APIs, including real-name verification, liveness detection, face recognition, phone verification, and fraud-risk related capabilities.

中文文档： [README.zh-CN.md](README.zh-CN.md)

## Install

```bash
npm install easyid
```

## Quick Start

```ts
import { EasyID, APIError } from "easyid";

const client = new EasyID("ak_xxx", "sk_xxx");

try {
  const result = await client.idcard.verify2("张三", "110101199001011234");
  console.log(result.match);
} catch (error) {
  if (error instanceof APIError) {
    console.log(error.code, error.message, error.requestId);
  }
}
```

## Supported APIs

- IDCard: `verify2`, `verify3`, `ocr`
- Phone: `status`, `verify3`
- Face: `liveness`, `compare`, `verify`
- Bank: `verify4`
- Risk: `score`, `storeFingerprint`
- Billing: `balance`, `records`

## Configuration

- `baseURL`
- `timeoutMs`
- `fetchImpl`

## Security Notice

This is a server-side SDK. Do not expose `secret` in browsers or mobile apps.

## Official Resources

- Official website: `https://www.easyid.com.cn/`
- GitHub organization: `https://github.com/easyid-com-cn/`
