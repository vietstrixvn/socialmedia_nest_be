# Phân tích API Design và Security cho Multi-Platform Publishing App

## 🚀 GraphQL vs REST API Recommendations

### **GraphQL - Phù hợp cho:**

#### 1. **Dashboard & Analytics Queries**

```graphql
query DashboardData($propertyId: ID!) {
  property(id: $propertyId) {
    name
    posts(limit: 10) {
      _id
      text
      status
      created_at
      publishResults {
        platform {
          name
        }
        status
        published_at
      }
    }
    platforms {
      name
      credentials {
        is_active
      }
    }
  }
}
```

**Lý do:** Cần fetch nhiều related data trong 1 request, tránh N+1 queries

#### 2. **User Profile với Permissions**

```graphql
query UserProfile($userId: ID!) {
  user(id: $userId) {
    first_name
    last_name
    avatar_url
    properties {
      name
      role
      permissions
      is_active
    }
  }
}
```

**Lý do:** Data phức tạp, nested relationships, client có thể chọn fields cần thiết

#### 3. **Post Management với Filtering**

```graphql
query Posts($propertyId: ID!, $filters: PostFilters) {
  posts(propertyId: $propertyId, filters: $filters) {
    _id
    text
    status
    created_at
    schedules {
      scheduled_at
      platform {
        name
      }
      status
    }
  }
}
```

**Lý do:** Flexible querying, có thể filter theo nhiều criteria

### **REST API - Phù hợp cho:**

#### 1. **Authentication Endpoints**

```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
```

**Lý do:** Simple, stateless, caching friendly, standard security practices

#### 2. **CRUD Operations cho Resources**

```
GET    /api/properties
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id

GET    /api/posts
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
```

**Lý do:** Straightforward CRUD, HTTP caching, easier to implement

#### 3. **File Upload & Media Handling**

```
POST /api/upload/media
GET  /api/media/:id
DELETE /api/media/:id
```

**Lý do:** File uploads work better with REST, multipart form-data

#### 4. **Webhook Endpoints**

```
POST /api/webhooks/platform-callback
POST /api/webhooks/schedule-trigger
```

**Lý do:** External systems calling your API, simpler integration

#### 5. **Publishing Actions**

```
POST /api/posts/:id/publish
POST /api/posts/:id/schedule
POST /api/schedules/:id/cancel
```

**Lý do:** Action-based endpoints, easier error handling, better for async operations

## 🔒 Security Vulnerabilities Analysis

### **🚨 Critical Issues**

#### 1. **Password Storage**

```sql
password varchar(255) [not null]  -- ❌ Không rõ có hash không
```

**Risk:** Plaintext password storage
**Fix:** Ensure bcrypt/scrypt hashing, minimum 12 rounds

#### 2. **Missing Soft Delete**

```sql
is_deleted bool [default: false]  -- Chỉ có ở property table
```

**Risk:** Hard delete có thể mất data audit trail
**Fix:** Implement soft delete cho tất cả sensitive tables

#### 3. **Credential Storage**

```sql
api_key varchar(255) [not null]
api_secret varchar(255)
access_token text
refresh_token text
```

**Risk:** Sensitive data không encrypt
**Fix:** Encrypt credentials at rest với AES-256

### **⚠️ High Risk Issues**

#### 4. **Missing Input Validation Constraints**

```sql
text text [not null]           -- No length limit
media_urls text               -- No validation
settings json                 -- No schema validation
```

**Risk:** DoS attacks, injection
**Fix:** Add length limits, JSON schema validation

#### 5. **Insufficient Access Control**

```sql
-- Không có row-level security
-- Permissions chỉ store trong JSON
```

**Risk:** Privilege escalation
**Fix:** Implement RBAC với proper constraints

#### 6. **Session Management**

```sql
last_login timestamp [default: `CURRENT_TIMESTAMP`]
-- Không có session table, token blacklist
```

**Risk:** Session hijacking, no logout tracking
**Fix:** Add sessions table, token blacklisting

### **⚡ Medium Risk Issues**

#### 7. **Race Conditions**

```sql
retry_count int [default: 0]
attempts int [default: 0]
```

**Risk:** Concurrent updates không safe
**Fix:** Add optimistic locking với version field

#### 8. **Audit Trail**

```sql
-- Chỉ có created_at, updated_at
-- Không track ai update gì
```

**Risk:** Compliance issues, debugging khó
**Fix:** Add audit log table

## 🛡️ Security Recommendations

### **Database Level**

1. **Add constraints:**

```sql
-- Password policy
password varchar(255) CHECK (length(password) >= 60) -- bcrypt hash

-- Email validation
email varchar(255) CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')

-- Phone validation
phone_number varchar(20) CHECK (phone_number ~* '^\+?[1-9]\d{1,14}$')
```

2. **Add indexes cho security:**

```sql
CREATE INDEX idx_user_email_active ON user(email) WHERE is_active = true;
CREATE INDEX idx_failed_logins ON audit_log(user_id, action, created_at)
    WHERE action = 'LOGIN_FAILED';
```

### **Application Level**

1. **Rate limiting** cho authentication endpoints
2. **Input sanitization** cho tất cả user input
3. **JWT với short expiry** (15 phút) + refresh token
4. **API key rotation** tự động
5. **Webhook signature verification**

### **Additional Tables Needed**

```sql
-- Session management
Table user_sessions {
  id varchar [pk]
  user_id varchar [ref: > user._id]
  token_hash varchar(255)
  expires_at timestamp
  is_revoked bool [default: false]
}

-- Audit logging
Table audit_log {
  id varchar [pk]
  user_id varchar [ref: > user._id]
  action varchar(100)
  resource_type varchar(50)
  resource_id varchar
  old_values json
  new_values json
  ip_address varchar(45)
  user_agent text
  created_at timestamp
}

-- Rate limiting
Table rate_limits {
  id varchar [pk]
  key varchar(255) -- IP, user_id, etc
  requests int
  window_start timestamp
  created_at timestamp
}
```

## 🎯 Implementation Priority

### **Phase 1 - Critical (Week 1-2)**

- [ ] Encrypt credentials storage
- [ ] Implement proper password hashing
- [ ] Add authentication rate limiting
- [ ] Setup session management

### **Phase 2 - High (Week 3-4)**

- [ ] Add input validation constraints
- [ ] Implement audit logging
- [ ] Setup RBAC properly
- [ ] Add API rate limiting

### **Phase 3 - Medium (Week 5-6)**

- [ ] Add optimistic locking
- [ ] Implement soft delete everywhere
- [ ] Setup monitoring & alerting
- [ ] Security testing & penetration testing
