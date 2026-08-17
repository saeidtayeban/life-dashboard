import { html } from '../../lib.js';

export function ToggleRow({ row, onToggle }) {
  return html`
    <div
      class=${'feed-row toggle-row' + (row.done ? ' done' : '')}
      onClick=${() => onToggle(row)}
      role="button"
      tabIndex="0"
    >
      <div class=${'toggle-check' + (row.done ? ' checked' : '')}>
        ${row.done ? html`<span>✓</span>` : null}
      </div>
      <div class="feed-row-main">
        <div class="feed-row-label">${row.planItem.label}</div>
        <div class="feed-row-sub">${row.domainName} · ${row.subItemName}</div>
      </div>
      ${row.time ? html`<div class="feed-row-time">${row.time}</div>` : null}
    </div>
  `;
}
