import { html, useState } from '../../lib.js';
import { Button } from '../ui/Button.js';

export function GoalEditor({ initial, onSave, onCancel, onDelete }) {
  const [text, setText] = useState(initial ? initial.text : '');
  const [targetDate, setTargetDate] = useState(initial && initial.targetDate ? initial.targetDate : '');

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSave({ text: text.trim(), targetDate: targetDate || null });
  }

  return html`
    <form class="form" onSubmit=${submit}>
      <label class="field">
        <span class="field-label">Goal</span>
        <textarea
          class="field-input"
          rows="2"
          placeholder="What are you aiming for?"
          value=${text}
          onInput=${(e) => setText(e.target.value)}
          autoFocus
        ></textarea>
      </label>
      <label class="field">
        <span class="field-label">Target date (optional)</span>
        <input
          class="field-input"
          type="date"
          value=${targetDate}
          onInput=${(e) => setTargetDate(e.target.value)}
        />
      </label>
      <div class="form-actions">
        ${onDelete
          ? html`<${Button} variant="danger" onClick=${onDelete}>Remove goal<//>`
          : html`<span></span>`}
        <div class="form-actions-right">
          <${Button} variant="ghost" onClick=${onCancel}>Cancel<//>
          <${Button} variant="primary" type="submit">Save<//>
        </div>
      </div>
    </form>
  `;
}
