export interface APIEnvelope<T> {
  code: number;
  message: string;
  request_id: string;
  data: T;
}

export interface IDCardVerify2Request {
  name: string;
  idNumber: string;
  traceId?: string;
}

export interface IDCardVerify3Request {
  name: string;
  idNumber: string;
  mobile: string;
  traceId?: string;
}

export interface IDCardVerifyResult {
  result: boolean;
  match: boolean;
  supplier: string;
  score: number;
  raw?: Record<string, unknown>;
}

export interface IDCardOCRResult {
  side: string;
  name: string;
  id_number: string;
  gender?: string;
  nation?: string;
  birth?: string;
  address?: string;
  issue?: string;
  valid?: string;
}

export interface PhoneStatusResult {
  status: "real" | "virtual" | "empty" | "unknown";
  carrier: string;
  province: string;
  roaming: boolean;
}

export interface PhoneVerify3Request {
  name: string;
  idNumber: string;
  mobile: string;
}

export interface PhoneVerify3Result {
  result: boolean;
  match: boolean;
  supplier: string;
  score: number;
}

export interface LivenessResult {
  liveness: boolean;
  score: number;
  method: string;
  frames_analyzed: number;
  attack_type: string | null;
}

export interface CompareResult {
  match: boolean;
  score: number;
}

export interface FaceVerifyRequest {
  idNumber: string;
  mediaKey?: string;
  callbackUrl?: string;
}

export interface FaceVerifyResult {
  result: boolean;
  supplier: string;
  score: number;
}

export interface BankVerify4Request {
  name: string;
  idNumber: string;
  bankCard: string;
  mobile?: string;
  traceId?: string;
}

export interface BankVerify4Result {
  result: boolean;
  match: boolean;
  bank_name: string;
  supplier: string;
  score: number;
  masked_bank_card: string;
  card_type: string;
}

export interface RiskScoreRequest {
  ip?: string;
  deviceFingerprint?: string;
  deviceId?: string;
  phone?: string;
  email?: string;
  userAgent?: string;
  action?: string;
  amount?: number;
  context?: Record<string, unknown>;
}

export interface RiskDetails {
  rule_score: number | null;
  ml_score: number | null;
}

export interface RiskScoreResult {
  risk_score: number;
  reasons: string[];
  recommendation: "allow" | "review" | "block";
  details: RiskDetails;
}

export interface StoreFingerprintRequest {
  deviceId: string;
  fingerprint: Record<string, unknown>;
}

export interface StoreFingerprintResult {
  device_id: string;
  stored: boolean;
}

export interface BillingBalanceResult {
  app_id: string;
  available_cents: number;
}

export interface BillingRecord {
  id: number;
  app_id: string;
  request_id: string;
  change_cents: number;
  balance_before: number;
  balance_after: number;
  reason: string;
  operator: string;
  created_at: number;
}

export interface BillingRecordsResult {
  total: number;
  page: number;
  records: BillingRecord[];
}

export interface EasyIDOptions {
  baseURL?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}
