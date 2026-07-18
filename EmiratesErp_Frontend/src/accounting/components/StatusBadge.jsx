import React from 'react';

const BADGE_STYLES = {
  DRAFT:    'bg-warning/10 text-warning border border-warning/20',
  POSTED:   'bg-success/10 text-success border border-success/20',
  REVERSED: 'bg-error/10 text-error border border-error/20',
};

export default function StatusBadge({ status }) {
  const cls = BADGE_STYLES[status] || 'bg-border text-foreground-muted border border-border';
  return (
    <span id={`status-badge-${status?.toLowerCase()}`}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}
