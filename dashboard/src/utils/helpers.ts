import type { AttackType } from '../types';

export const getAttackTypeColor = (type: string): string => {
  const colors: Record<AttackType | string, string> = {
    SQL_INJECTION: '#ff6b6b',
    XSS_ATTACK: '#4ecdc4',
    COMMAND_INJECTION: '#ff4757',
    DIR_TRAVERSAL: '#ffa502',
    UNKNOWN_SUSPICIOUS: '#ffd32a',
    NORMAL: '#95a5a6'
  };
  return colors[type] || '#95a5a6';
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const getSeverityColor = (severity: number): string => {
  if (severity <= 1) return 'bg-green-500';
  if (severity === 2) return 'bg-yellow-500';
  if (severity <= 4) return 'bg-red-500';
  return 'bg-purple-500';
};


