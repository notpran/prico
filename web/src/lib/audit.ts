// src/lib/audit.ts - Audit logging utilities

import { connectToDatabase } from './mongo';
import { logger } from './logger';

export interface AuditLog {
  _id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
}

export async function logAuditEvent(
  action: string,
  resource: string,
  success: boolean,
  options: {
    userId?: string;
    resourceId?: string;
    details?: any;
    ip?: string;
    userAgent?: string;
  } = {}
): Promise<void> {
  try {
    const db = await connectToDatabase();

    const auditLog: AuditLog = {
      _id: '', // Will be set by MongoDB
      userId: options.userId,
      action,
      resource,
      resourceId: options.resourceId,
      details: options.details,
      ip: options.ip,
      userAgent: options.userAgent,
      timestamp: new Date(),
      success,
    };

    await db.collection<AuditLog>('audit_logs').insertOne(auditLog);

    logger.info('Audit event logged', {
      action,
      resource,
      resourceId: options.resourceId,
      userId: options.userId,
      success,
    });
  } catch (error) {
    logger.error('Failed to log audit event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      action,
      resource,
      userId: options.userId,
    });
    // Don't throw - audit logging shouldn't break the main flow
  }
}

export async function getAuditLogs(
  filters: {
    userId?: string;
    action?: string;
    resource?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<AuditLog[]> {
  try {
    const db = await connectToDatabase();
    const query: any = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.resource) query.resource = filters.resource;

    const logs = await db.collection<AuditLog>('audit_logs')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 50)
      .skip(filters.offset || 0)
      .toArray();

    return logs;
  } catch (error) {
    logger.error('Failed to get audit logs', {
      error: error instanceof Error ? error.message : 'Unknown error',
      filters,
    });
    return [];
  }
}