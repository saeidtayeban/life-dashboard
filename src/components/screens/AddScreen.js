import { html, useState, Fragment } from '../../lib.js';
import { useStore, findSubItem } from '../../state/store.js';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { DomainForm } from '../editors/DomainForm.js';
import { SubItemForm } from '../editors/SubItemForm.js';
import { GoalEditor } from '../editors/GoalEditor.js';
import { PlanItemForm } from '../editors/PlanItemForm.js';
import { LogEntryForm } from '../editors/LogEntryForm.js';

const MENU = [
  { id: 'new-domain', label: 'New domain', desc: 'A new area of life to track' },
  { id: 'new-subitem', label: 'New sub-item', desc: 'Add something to an existing domain' },
  { id: 'goal', label: 'Add / edit a goal', desc: 'Set a freeform target for a sub-item' },
  { id: 'plan', label: 'Add a plan item', desc: 'Add to a recurring schedule' },
  { id: 'log', label: 'Quick log entry', desc: 'Log something that happened' },
];

function SubItemPicker({ domains, domainId, subItemId, onChangeDomain, onChangeSubItem }) {
  const domain = domains.find((d) => d.id === domainId);
  return html`
    <div class="form">
      <label class="field">
        <span class="field-label">Domain</span>
        <select class="field-input" value=${domainId || ''} onChange=${(e) => onChangeDomain(e.target.value)}>
          <option value="" disabled>Choose a domain</option>
          ${domains.map((d) => html`<option key=${d.id} value=${d.id}>${d.name}</option>`)}
        </select>
      </label>
      ${domain
        ? html`
            <label class="field">
              <span class="field-label">Sub-item</span>
              <select
                class="field-input"
                value=${subItemId || ''}
                onChange=${(e) => onChangeSubItem(e.target.value)}
              >
                <option value="" disabled>Choose a sub-item</option>
                ${domain.subItems.map(
                  (s) => html`<option key=${s.id} value=${s.id}>${s.name}</option>`
                )}
              </select>
            </label>
          `
        : null}
    </div>
  `;
}

export function AddScreen() {
  const { state, dispatch } = useStore();
  const [mode, setMode] = useState(null);
  const [domainId, setDomainId] = useState('');
  const [subItemId, setSubItemId] = useState('');
  const [confirmation, setConfirmation] = useState('');

  function reset() {
    setMode(null);
    setDomainId('');
    setSubItemId('');
  }

  function flash(msg) {
    setConfirmation(msg);
    setTimeout(() => setConfirmation(''), 2000);
    reset();
  }

  function chooseDomain(id) {
    setDomainId(id);
    setSubItemId('');
  }

  const found = domainId && subItemId ? findSubItem(state, domainId, subItemId) : null;

  const needsDomain =
    mode && mode !== 'new-domain' && state.domains.length === 0;

  let body;
  if (needsDomain) {
    body = html`
      <${Card} className="empty-state">
        <p>You'll need a domain first.</p>
        <${Button} variant="secondary" onClick=${() => setMode('new-domain')}>
          + New domain
        <//>
      <//>
    `;
  } else if (!mode) {
    body = html`
      <div class="add-menu">
        ${MENU.map(
          (item) => html`
            <${Card} key=${item.id} className="add-menu-item" onClick=${() => setMode(item.id)}>
              <div class="add-menu-label">${item.label}</div>
              <div class="add-menu-desc">${item.desc}</div>
            <//>
          `
        )}
      </div>
    `;
  } else if (mode === 'new-domain') {
    body = html`
      <${DomainForm}
        onCancel=${reset}
        onSave=${(name) => {
          dispatch({ type: 'ADD_DOMAIN', name });
          flash(`Added domain "${name}"`);
        }}
      />
    `;
  } else if (mode === 'new-subitem') {
    body = html`
      <${SubItemForm}
        domains=${state.domains}
        onCancel=${reset}
        onSave=${({ name, domainId: dId }) => {
          dispatch({ type: 'ADD_SUBITEM', domainId: dId, name });
          flash(`Added "${name}"`);
        }}
      />
    `;
  } else if (mode === 'goal' || mode === 'plan' || mode === 'log') {
    body = html`
      <${Fragment}>
        <${SubItemPicker}
          domains=${state.domains}
          domainId=${domainId}
          subItemId=${subItemId}
          onChangeDomain=${chooseDomain}
          onChangeSubItem=${setSubItemId}
        />
        ${found
          ? mode === 'goal'
            ? html`
                <${GoalEditor}
                  initial=${found.subItem.goal}
                  onCancel=${reset}
                  onSave=${(goal) => {
                    dispatch({ type: 'SET_GOAL', domainId, subItemId, ...goal });
                    flash(`Saved goal for "${found.subItem.name}"`);
                  }}
                  onDelete=${
                    found.subItem.goal
                      ? () => {
                          dispatch({ type: 'DELETE_GOAL', domainId, subItemId });
                          flash(`Removed goal from "${found.subItem.name}"`);
                        }
                      : null
                  }
                />
              `
            : mode === 'plan'
            ? html`
                <${PlanItemForm}
                  onCancel=${reset}
                  onSave=${(data) => {
                    dispatch({ type: 'ADD_PLAN_ITEM', domainId, subItemId, ...data });
                    flash(`Added plan item to "${found.subItem.name}"`);
                  }}
                />
              `
            : html`
                <${LogEntryForm}
                  planItemOptions=${found.subItem.plan
                    ? found.subItem.plan.items.filter((p) => p.entryType === 'entry')
                    : []}
                  onCancel=${reset}
                  onSave=${(entry) => {
                    dispatch({ type: 'ADD_LOG_ENTRY', domainId, subItemId, ...entry });
                    flash(`Logged entry for "${found.subItem.name}"`);
                  }}
                />
              `
          : null}
      <//>
    `;
  }

  return html`
    <div class="screen">
      <header class="screen-header">
        <div class="screen-eyebrow">Build your dashboard</div>
        <h1 class="screen-title">Add</h1>
      </header>

      ${confirmation ? html`<div class="toast">${confirmation}</div>` : null}

      ${mode
        ? html`<button class="back-btn add-back" onClick=${reset}>‹ Back to menu</button>`
        : null}

      ${body}
    </div>
  `;
}
