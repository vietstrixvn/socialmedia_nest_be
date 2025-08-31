export enum UserStatus {
  FREE = 'free', // Người dùng free
  PAID = 'paid', // Người dùng trả phí
}

export enum PropertyStatus {
  FREE = 'free',
  ACTIVE = 'active', // Dùng bình thường (free hoặc trả phí)
  PENDING_PAYMENT = 'pending_payment', // Đợi thanh toán, vẫn dùng được nhưng giới hạn
  PAUSED = 'paused', // Tạm khóa do chưa thanh toán
  DELETED_DUE_TO_EXPIRY = 'deleted_due_to_expiry', // Khóa/xóa tạm thời
}

export enum PropertyType {
  FREE = 'free',
  BASIC = 'basic',
  MEDIUM = 'medium',
  PRO = 'pro',
  CUSTOM = 'custom',
}

export enum MemberType {
  OWNED = 'free',
  BASIC = 'basic',
  MEDIUM = 'medium',
  PRO = 'pro',
  CUSTOM = 'custom',
}

export enum PropertyModule {
  PROJECT = 'project',
  SALES = 'sales',
  HR = 'hr',
}

export enum Status {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum StatusCode {
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500,
  Ok = 200,
  Created = 201,
  NoContent = 204,
  Conflict = 409,
  ServerError = 500,
}

export enum StatusType {
  Success = 'SUCCESS',
  Failed = 'FAILED',
  Error = 'ERROR',
  Warning = 'WARNING',
  Info = 'INFO',
}

export enum LogsType {
  MissingJWT = 'MissingJWT',
}
