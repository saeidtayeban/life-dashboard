import { html, useState, Fragment } from '../../lib.js';
import { useStore } from '../../state/store.js';
import { buildTodayFeed } from '../../utils/today-feed.js';
import { todayISO, formatFullDate } from '../../utils/dates.js';
import { ToggleRow } from '../ui/ToggleRow.js';
import { EntryRow } from '../ui/EntryRow.js';
import { Modal } from '../ui/Modal.js';
import { LogEntryForm } from '../editors/LogEntryForm.js';

export function TodayScreen() {
  const { state, dispatch } = useStore();
  const [activeEntryRow, setActiveEntryRow] = useState(null);

  const rows = buildTodayFeed(state.domains);

  function onToggle(row) {
    dispatch({
      type: 'TOGGLE_PLAN_ITEM_TODAY',
      domainId: row.domainId,
      subItemId: row.subItemId,
      planItemId: row.planItem.id,
      date: todayISO(),
    });
  }

  function saveEntry(entry) {
    dispatch({
      type: 'ADD_LOG_ENTRY',
      domainId: activeEntryRow.domainId,
      subItemId: activeEntryRow.subItemId,
      ...entry,
    });
    setActiveEntryRow(null);
  }

  return html`
    <${Fragment}>
      <div class="screen">
        <header class="screen-header">
          <div class="screen-eyebrow">${formatFullDate(todayISO())}</div>
          <h1 class="screen-title">Today</h1>
        </header>

        ${rows.length
          ? html`
              <div class="feed-list">
                ${rows.map((row) =>
                  row.entryType === 'toggle'
                    ? html`<${ToggleRow} key=${row.key} row=${row} onToggle=${onToggle} />`
                    : html`<${EntryRow}
                        key=${row.key}
                        row=${row}
                        onOpen=${(r) => setActiveEntryRow(r)}
                      />`
                )}
              </div>
            `
          : html`
              <div class="empty-note">
                <p>${state.domains.length ? 'Nothing scheduled for today.' : 'Nothing here yet.'}</p>
                <p class="empty-note-sub">
                  ${state.domains.length
                    ? 'Add a plan to a sub-item to see it here.'
                    : 'Head to the Add tab to create your first domain.'}
                </p>
              </div>
            `}
      </div>

      <${Modal}
        open=${!!activeEntryRow}
        onClose=${() => setActiveEntryRow(null)}
        title=${activeEntryRow ? activeEntryRow.planItem.label : ''}
      >
        ${activeEntryRow
          ? html`
              <${LogEntryForm}
                planItemOptions=${[activeEntryRow.planItem]}
                initialPlanItemId=${activeEntryRow.planItem.id}
                onSave=${saveEntry}
                onCancel=${() => setActiveEntryRow(null)}
              />
            `
          : null}
      <//>
    <//>
  `;
}
