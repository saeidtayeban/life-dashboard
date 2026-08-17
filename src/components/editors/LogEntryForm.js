import { html, useState } from '../../lib.js';
import { Button } from '../ui/Button.js';
import { todayISO } from '../../utils/dates.js';

export function LogEntryForm({
  planItemOptions = [],
  initialPlanItemId = null,
  onSave,
  onCancel,
}) {
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [planItemId, setPlanItemId] = useState(initialPlanItemId);

  function submit(e) {
    e.preventDefault();
    onSave({
      date,
      note: note.trim(),
      value: value.trim() === '' ? null : Number(value),
      unit: unit.trim(),
      planItemId: planItemId || null,
    });
  }

  return html`
    <form class="form" onSubmit=${submit}>
      ${planItemOptions.length
        ? html`
            <label class="field">
              <span class="field-label">Linked to</span>
              <select
                class="field-input"
                value=${planItemId || ''}
                onChange=${(e) => setPlanItemId(e.target.value || null)}
              >
                <option value="">None</option>
                ${planItemOptions.map(
                  (p) => html`<option key=${p.id} value=${p.id}>${p.label}</option>`
                )}
              </select>
            </label>
          `
        : null}

      <label class="field">
        <span class="field-label">Date</span>
        <input
          class="field-input"
          type="date"
          value=${date}
          onInput=${(e) => setDate(e.target.value)}
        />
      </label>

      <div class="field-row">
        <label class="field">
          <span class="field-label">Value (optional)</span>
          <input
            class="field-input"
            type="number"
            step="any"
            inputmode="decimal"
            placeholder="0"
            value=${value}
            onInput=${(e) => setValue(e.target.value)}
          />
        </label>
        <label class="field">
          <span class="field-label">Unit</span>
          <input
            class="field-input"
            type="text"
            placeholder="units"
            value=${unit}
            onInput=${(e) => setUnit(e.target.value)}
          />
        </label>
      </div>

      <label class="field">
        <span class="field-label">Note</span>
        <textarea
          class="field-input"
          rows="3"
          placeholder="How did it go?"
          value=${note}
          onInput=${(e) => setNote(e.target.value)}
          autoFocus
        ></textarea>
      </label>

      <div class="form-actions">
        <span></span>
        <div class="form-actions-right">
          <${Button} variant="ghost" onClick=${onCancel}>Cancel<//>
          <${Button} variant="primary" type="submit">Save entry<//>
        </div>
      </div>
    </form>
  `;
}
