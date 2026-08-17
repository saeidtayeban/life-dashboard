import { html, useState, Fragment } from '../lib.js';
import { useStore, findSubItem } from '../state/store.js';
import { Card } from './ui/Card.js';
import { Button } from './ui/Button.js';
import { Modal } from './ui/Modal.js';
import { GoalEditor } from './editors/GoalEditor.js';
import { PlanItemForm } from './editors/PlanItemForm.js';
import { LogEntryForm } from './editors/LogEntryForm.js';
import { formatLogDate, WEEKDAY_LABELS } from '../utils/dates.js';

function describeRecurrence(recurrence) {
  if (recurrence.type === 'daily') return 'Daily';
  const days = [...recurrence.days].sort();
  return days.map((d) => WEEKDAY_LABELS[d]).join(', ');
}

export function SubItemDetail({ domainId, subItemId, onBack, onDeleted }) {
  const { state, dispatch } = useStore();
  const [modal, setModal] = useState({ type: null, planItemId: null });

  const found = findSubItem(state, domainId, subItemId);
  if (!found) {
    return html`
      <div class="screen detail-screen">
        <div class="detail-header">
          <button class="back-btn" onClick=${onBack}>‹ Back</button>
        </div>
        <p class="empty-note">This sub-item was deleted.</p>
      </div>
    `;
  }
  const { domain, subItem } = found;

  function closeModal() {
    setModal({ type: null, planItemId: null });
  }

  function saveGoal(goal) {
    dispatch({ type: 'SET_GOAL', domainId, subItemId, ...goal });
    closeModal();
  }
  function deleteGoal() {
    dispatch({ type: 'DELETE_GOAL', domainId, subItemId });
    closeModal();
  }

  function savePlanItem(data) {
    if (modal.planItemId) {
      dispatch({
        type: 'UPDATE_PLAN_ITEM',
        domainId,
        subItemId,
        planItemId: modal.planItemId,
        patch: data,
      });
    } else {
      dispatch({ type: 'ADD_PLAN_ITEM', domainId, subItemId, ...data });
    }
    closeModal();
  }
  function deletePlanItem() {
    dispatch({ type: 'DELETE_PLAN_ITEM', domainId, subItemId, planItemId: modal.planItemId });
    closeModal();
  }

  function saveLogEntry(entry) {
    dispatch({ type: 'ADD_LOG_ENTRY', domainId, subItemId, ...entry });
    closeModal();
  }
  function deleteLogEntry(entryId) {
    dispatch({ type: 'DELETE_LOG_ENTRY', domainId, subItemId, entryId });
  }

  function deleteSubItem() {
    if (!confirm(`Delete "${subItem.name}"? This removes its goal, plan, and log.`)) return;
    dispatch({ type: 'DELETE_SUBITEM', domainId, subItemId });
    if (onDeleted) onDeleted();
  }

  const planItems = subItem.plan ? subItem.plan.items : [];
  const entryPlanItems = planItems.filter((p) => p.entryType === 'entry');
  const sortedLog = [...subItem.log].sort((a, b) => b.date.localeCompare(a.date));
  const editingPlanItem = modal.planItemId
    ? planItems.find((p) => p.id === modal.planItemId)
    : null;

  return html`
    <${Fragment}>
    <div class="screen detail-screen">
      <div class="detail-header">
        <button class="back-btn" onClick=${onBack}>‹ Back</button>
        <button class="danger-link" onClick=${deleteSubItem}>Delete</button>
      </div>
      <div class="detail-title-block">
        <div class="detail-eyebrow">${domain.name}</div>
        <h1 class="detail-title">${subItem.name}</h1>
      </div>

      <section class="detail-section">
        <div class="detail-section-head">
          <h2>Goal</h2>
          ${subItem.goal
            ? html`<button
                class="text-link"
                onClick=${() => setModal({ type: 'goal', planItemId: null })}
              >Edit</button>`
            : null}
        </div>
        ${subItem.goal
          ? html`
              <${Card}>
                <p class="goal-text">${subItem.goal.text}</p>
                ${subItem.goal.targetDate
                  ? html`<p class="goal-date">Target: ${formatLogDate(subItem.goal.targetDate)}</p>`
                  : null}
              <//>
            `
          : html`
              <${Card} className="empty-state">
                <p>No goal here — some sub-items don't need one. Add one anytime if that changes.</p>
                <${Button} variant="secondary" onClick=${() => setModal({ type: 'goal', planItemId: null })}>
                  + Add goal
                <//>
              <//>
            `}
      </section>

      <section class="detail-section">
        <div class="detail-section-head">
          <h2>Plan</h2>
          ${planItems.length
            ? html`<button
                class="text-link"
                onClick=${() => setModal({ type: 'planItem', planItemId: null })}
              >+ Add item</button>`
            : null}
        </div>
        ${planItems.length
          ? html`
              <div class="plan-list">
                ${planItems.map(
                  (p) => html`
                    <${Card} key=${p.id} className="plan-item-card" onClick=${() =>
                      setModal({ type: 'planItem', planItemId: p.id })}>
                      <div class="plan-item-row">
                        <span class=${'plan-item-badge ' + p.entryType}>
                          ${p.entryType === 'toggle' ? 'Toggle' : 'Entry'}
                        </span>
                        <span class="plan-item-label">${p.label}</span>
                      </div>
                      <div class="plan-item-meta">
                        ${describeRecurrence(p.recurrence)}${p.time ? ` · ${p.time}` : ''}
                      </div>
                    <//>
                  `
                )}
              </div>
            `
          : html`
              <${Card} className="empty-state">
                <p>No recurring plan — logging on its own works fine here. Add one anytime if that changes.</p>
                <${Button} variant="secondary" onClick=${() => setModal({ type: 'planItem', planItemId: null })}>
                  + Add plan item
                <//>
              <//>
            `}
      </section>

      <section class="detail-section">
        <div class="detail-section-head">
          <h2>Log</h2>
          <button
            class="text-link"
            onClick=${() => setModal({ type: 'logEntry', planItemId: null })}
          >+ Add entry</button>
        </div>
        ${sortedLog.length
          ? html`
              <div class="log-list">
                ${sortedLog.map(
                  (entry) => html`
                    <div class="log-entry" key=${entry.id}>
                      <div class="log-entry-main">
                        <span class="log-entry-date">${formatLogDate(entry.date)}</span>
                        ${entry.value !== null && entry.value !== undefined
                          ? html`<span class="log-entry-value">${entry.value} ${entry.unit}</span>`
                          : null}
                      </div>
                      ${entry.note ? html`<p class="log-entry-note">${entry.note}</p>` : null}
                      <button class="log-entry-delete" onClick=${() => deleteLogEntry(entry.id)}>Remove</button>
                    </div>
                  `
                )}
              </div>
            `
          : html`<${Card} className="empty-state"><p>No entries yet.</p><//>`}
      </section>
    </div>

    <${Modal}
      open=${modal.type === 'goal'}
      onClose=${closeModal}
      title=${subItem.goal ? 'Edit goal' : 'Add goal'}
    >
      <${GoalEditor}
        initial=${subItem.goal}
        onSave=${saveGoal}
        onCancel=${closeModal}
        onDelete=${subItem.goal ? deleteGoal : null}
      />
    <//>

    <${Modal}
      open=${modal.type === 'planItem'}
      onClose=${closeModal}
      title=${editingPlanItem ? 'Edit plan item' : 'Add plan item'}
    >
      <${PlanItemForm}
        initial=${editingPlanItem}
        onSave=${savePlanItem}
        onCancel=${closeModal}
        onDelete=${editingPlanItem ? deletePlanItem : null}
      />
    <//>

    <${Modal} open=${modal.type === 'logEntry'} onClose=${closeModal} title="Add log entry">
      <${LogEntryForm}
        planItemOptions=${entryPlanItems}
        onSave=${saveLogEntry}
        onCancel=${closeModal}
      />
    <//>
    <//>
  `;
}
