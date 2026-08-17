import { html, useState } from '../../lib.js';
import { Button } from '../ui/Button.js';
import { WEEKDAY_LABELS } from '../../utils/dates.js';

export function PlanItemForm({ initial, onSave, onCancel, onDelete }) {
  const [label, setLabel] = useState(initial ? initial.label : '');
  const [entryType, setEntryType] = useState(initial ? initial.entryType : 'toggle');
  const [recurrenceType, setRecurrenceType] = useState(
    initial ? initial.recurrence.type : 'daily'
  );
  const [days, setDays] = useState(
    initial && initial.recurrence.days ? initial.recurrence.days : [1, 2, 3, 4, 5]
  );
  const [time, setTime] = useState(initial ? initial.time : '');

  function toggleDay(d) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  }

  function submit(e) {
    e.preventDefault();
    if (!label.trim()) return;
    const recurrence =
      recurrenceType === 'daily'
        ? { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] }
        : { type: 'weekly', days: days.length ? days : [1] };
    onSave({ label: label.trim(), entryType, recurrence, time: time || '' });
  }

  return html`
    <form class="form" onSubmit=${submit}>
      <label class="field">
        <span class="field-label">What's the plan?</span>
        <input
          class="field-input"
          type="text"
          placeholder="e.g. Morning walk, Practice session, Log entry"
          value=${label}
          onInput=${(e) => setLabel(e.target.value)}
          autoFocus
        />
      </label>

      <div class="field">
        <span class="field-label">Row type</span>
        <div class="segmented">
          <button
            type="button"
            class=${'segment' + (entryType === 'toggle' ? ' active' : '')}
            onClick=${() => setEntryType('toggle')}
          >
            Toggle (check off)
          </button>
          <button
            type="button"
            class=${'segment' + (entryType === 'entry' ? ' active' : '')}
            onClick=${() => setEntryType('entry')}
          >
            Entry (log details)
          </button>
        </div>
      </div>

      <div class="field">
        <span class="field-label">Repeats</span>
        <div class="segmented">
          <button
            type="button"
            class=${'segment' + (recurrenceType === 'daily' ? ' active' : '')}
            onClick=${() => setRecurrenceType('daily')}
          >
            Daily
          </button>
          <button
            type="button"
            class=${'segment' + (recurrenceType === 'weekly' ? ' active' : '')}
            onClick=${() => setRecurrenceType('weekly')}
          >
            Specific days
          </button>
        </div>
      </div>

      ${recurrenceType === 'weekly'
        ? html`
            <div class="field">
              <div class="weekday-picker">
                ${WEEKDAY_LABELS.map(
                  (label, i) => html`
                    <button
                      type="button"
                      key=${i}
                      class=${'weekday-chip' + (days.includes(i) ? ' active' : '')}
                      onClick=${() => toggleDay(i)}
                    >
                      ${label[0]}
                    </button>
                  `
                )}
              </div>
            </div>
          `
        : null}

      <label class="field">
        <span class="field-label">Time (optional)</span>
        <input
          class="field-input"
          type="time"
          value=${time}
          onInput=${(e) => setTime(e.target.value)}
        />
      </label>

      <div class="form-actions">
        ${onDelete
          ? html`<${Button} variant="danger" onClick=${onDelete}>Remove<//>`
          : html`<span></span>`}
        <div class="form-actions-right">
          <${Button} variant="ghost" onClick=${onCancel}>Cancel<//>
          <${Button} variant="primary" type="submit">Save<//>
        </div>
      </div>
    </form>
  `;
}
