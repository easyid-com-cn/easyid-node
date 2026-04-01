# EasyID Node.js SDK

EasyID Node.js SDK 是易验云身份验证 API 的官方 TypeScript / Node.js 客户端。

English README: [README.md](README.md)

EasyID 提供身份证核验、手机号核验、人脸识别、银行卡核验、风控评分等能力。本 SDK 面向服务端 Node.js 环境，自动处理签名、请求头和统一错误解析。

## 安装

```bash
npm install easyid
```

也可以使用：

```bash
yarn add easyid
pnpm add easyid
```

要求：

- Node.js `>= 20`

## 快速开始

```ts
import { EasyID, APIError } from "easyid";

const client = new EasyID("ak_xxx", "sk_xxx");

try {
  const result = await client.idcard.verify2({
    name: "张三",
    idNumber: "110101199001011234",
  });
  console.log("是否匹配：", result.match);
} catch (error) {
  if (error instanceof APIError) {
    console.log(error.code, error.message, error.requestId);
  } else {
    throw error;
  }
}
```

## 已支持接口

- `client.idcard.verify2()`：身份证二要素核验
- `client.idcard.verify3()`：身份证三要素核验
- `client.idcard.ocr()`：身份证 OCR
- `client.phone.status()`：手机号状态查询
- `client.phone.verify3()`：手机号三要素核验
- `client.face.liveness()`：人脸活体检测
- `client.face.compare()`：人脸比对
- `client.face.verify()`：人脸核验
- `client.bank.verify4()`：银行卡四要素核验
- `client.risk.score()`：风控评分
- `client.risk.storeFingerprint()`：存储设备指纹
- `client.billing.balance()`：查询账户余额
- `client.billing.records()`：查询账单记录

## 配置项

- `baseURL`：覆盖 API 地址
- `timeoutMs`：超时时间，单位毫秒
- `fetchImpl`：自定义 `fetch` 实现

## 错误处理

服务端业务错误会抛出 `APIError`。

```ts
try {
  const result = await client.phone.status("13800138000");
  console.log(result.status);
} catch (error) {
  if (error instanceof APIError) {
    console.log(error.code, error.message, error.requestId);
  }
}
```

## 安全说明

- 这是服务端 SDK，不要在浏览器或移动端直接暴露 `secret`
- `keyId` 必须符合 `ak_[0-9a-f]+`
- SDK 会自动生成 `X-Key-ID`、`X-Timestamp`、`X-Signature`

## 官方资源

- 官网：`https://www.easyid.com.cn/`
- GitHub：`https://github.com/easyid-com-cn/`
