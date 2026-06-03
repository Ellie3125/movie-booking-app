import { STATUS_CONFIG } from '../data/mockData';
import './StatusBadge.css';

/**
 * StatusBadge — Pill-shaped status indicator.
 * Thiết kế theo DESIGN.md: muted background + text-variant color.
 */
export default function StatusBadge({ status, size = 'default', showIcon = false }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={`status-badge status-badge--${size} ${config.bgClass}`}
      style={{
        '--badge-bg': config.bg,
        '--badge-color': config.color,
      }}
    >
      {showIcon && (
        <span className="material-symbols-outlined icon-sm">{config.icon}</span>
      )}
      {config.label}
    </span>
  );
}
