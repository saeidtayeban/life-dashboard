import { html } from '../../lib.js';

export function EntryRow({ row, onOpen }) {
  return html`
    <div class="feed-row entry-row" onClick=${() => onOpen(row)} role="button" tabIndex="0">
      <div class="entry-icon">✎</div>
      <div class="feed-row-main">
        <div class="feed-row-label">${row.planItem.label}</div>
        <div class="feed-row-sub">
          ${row.domainName} · ${row.subItemName}
          ${row.count > 0 ? html` · ${row.count} logged today` : ''}
        </div>
      </div>
      ${row.time ? html`<div class="feed-row-time">${row.time}</div>` : null}
    </div>
  `;
}
