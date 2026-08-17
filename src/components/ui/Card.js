import { html } from '../../lib.js';

export function Card({ children, className = '', onClick = null }) {
  const cls = ['card', className].filter(Boolean).join(' ');
  if (onClick) {
    return html`
      <div class=${cls + ' card-tappable'} onClick=${onClick} role="button" tabIndex="0">
        ${children}
      </div>
    `;
  }
  return html`<div class=${cls}>${children}</div>`;
}
