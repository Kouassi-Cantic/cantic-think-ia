import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { AuditLog } from '../types';

export const logAdminAction = async (action: string, target: string, details?: string) => {
  try {
    const adminEmail = localStorage.getItem('cantic_admin_email') || 'unknown@canticthinkia.work';
    const adminName = localStorage.getItem('cantic_admin_name') || 'Admin';

    const log: AuditLog = {
      adminEmail,
      adminName,
      action,
      target,
      details,
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'auditLogs'), log);
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};
