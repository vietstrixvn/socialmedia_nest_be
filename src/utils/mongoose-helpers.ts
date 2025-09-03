// utils/mongoose-helpers.ts
import { Schema } from 'mongoose';

/**
 * Hook để set select field dựa trên NODE_ENV
 * Development: select = true (show sensitive fields for debugging)
 * Production: select = false (hide sensitive fields for security)
 */
export function addConditionalSelectHook(
  schema: Schema,
  sensitiveFields: string[],
) {
  const isDevelopment = process.env.NODE_ENV === 'local';

  // Pre-hook cho find operations
  schema.pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    if (!isDevelopment) {
      // Production: hide sensitive fields
      const selectObj = sensitiveFields.reduce(
        (acc, field) => {
          acc[field] = 0; // 0 means exclude
          return acc;
        },
        {} as Record<string, number>,
      );

      this.select(selectObj);
    }
    // Development: không cần làm gì, mặc định sẽ show all fields
  });
}

// Alternative: Decorator approach
export function ConditionalSelect(sensitiveFields: string[]) {
  return function (target: any) {
    // Được sử dụng như một class decorator
    const schema = target.schema || target;
    addConditionalSelectHook(schema, sensitiveFields);
  };
}
