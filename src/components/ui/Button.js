import { html } from '../../lib.js';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  full = false,
}) {
  const cls = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    full ? 'btn-full' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return html`
    <button class=${cls} type=${type} onClick=${onClick} disabled=${disabled}>
      ${children}
    </button>
  `;
}
