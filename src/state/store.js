import { html, createContext, useContext, useReducer, useEffect } from '../lib.js';
import { seedDomains } from './seed.js';
import { newId } from '../utils/id.js';

const STORAGE_KEY = 'pld:v1';

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.domains)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load saved state, reseeding.', e);
  }
  return { domains: seedDomains() };
}

function mapSubItem(state, domainId, subItemId, fn) {
  return {
    ...state,
    domains: state.domains.map((d) =>
      d.id !== domainId
        ? d
        : {
            ...d,
            subItems: d.subItems.map((s) => (s.id !== subItemId ? s : fn(s))),
          }
    ),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_DOMAIN': {
      const newDomain = { id: newId('dom'), name: action.name, subItems: [] };
      return { ...state, domains: [...state.domains, newDomain] };
    }
    case 'UPDATE_DOMAIN': {
      return {
        ...state,
        domains: state.domains.map((d) =>
          d.id !== action.domainId ? d : { ...d, name: action.name }
        ),
      };
    }
    case 'DELETE_DOMAIN': {
      return {
        ...state,
        domains: state.domains.filter((d) => d.id !== action.domainId),
      };
    }

    case 'ADD_SUBITEM': {
      const newSubItem = {
        id: newId('sub'),
        name: action.name,
        goal: null,
        plan: null,
        log: [],
      };
      return {
        ...state,
        domains: state.domains.map((d) =>
          d.id !== action.domainId
            ? d
            : { ...d, subItems: [...d.subItems, newSubItem] }
        ),
      };
    }
    case 'UPDATE_SUBITEM': {
      return mapSubItem(state, action.domainId, action.subItemId, (s) => ({
        ...s,
        name: action.name,
      }));
    }
    case 'DELETE_SUBITEM': {
      return {
        ...state,
        domains: state.domains.map((d) =>
          d.id !== action.domainId
            ? d
            : { ...d, subItems: d.subItems.filter((s) => s.id !== action.subItemId) }
        ),
      };
    }

    case 'SET_GOAL': {
      return mapSubItem(state, action.domainId, action.subItemId, (s) => ({
        ...s,
        goal: { text: action.text, targetDate: action.targetDate || null },
      }));
    }
    case 'DELETE_GOAL': {
      return mapSubItem(state, action.domainId, action.subItemId, (s) => ({
        ...s,
        goal: null,
      }));
    }

    case 'ENABLE_PLAN': {
      return mapSubItem(state, action.domainId, action.subItemId, (s) =>
        s.plan ? s : { ...s, plan: { items: [] } }
      );
    }
    case 'DELETE_PLAN': {
      return mapSubItem(state, action.domainId, action.subItemId, (s) => ({
        ...s,
        plan: null,
      }));
    }
    case 'ADD_PLAN_ITEM': {
      const item = {
        id: newId('plan'),
        label: action.label,
        entryType: action.entryType,
        recurrence: action.recurrence,
        time: action.time || '',
      };
      return mapSubItem(state, action.domainId, action.subItemId, (s) => ({
        ...s,
        plan: { items: [...(s.plan ? s.plan.items : []), item] },
      }));
    }
    case 'UPDATE_PLAN_ITEM': {
      return mapSubItem(state, action.domainId, action.subItemId, (s) => ({
        ...s,
        plan: {
          items: s.plan.items.map((it) =>
            it.id !== action.planItemId ? it : { ...it, ...action.patch }
          ),
        },
      }));
    }
    case 'DELETE_PLAN_ITEM': {
      return mapSubItem(state, action.domainId, action.subItemId, (s) => ({
        ...s,
        plan: { items: s.plan.items.filter((it) => it.id !== action.planItemId) },
      }));
    }

    case 'ADD_LOG_ENTRY': {
      const entry = {
        id: newId('log'),
        date: action.date,
        note: action.note || '',
        value: action.value ?? null,
        unit: action.unit || '',
        planItemId: action.planItemId || null,
      };
      return mapSubItem(state, action.domainId, action.subItemId, (s) => ({
        ...s,
        log: [entry, ...s.log],
      }));
    }
    case 'UPDATE_LOG_ENTRY': {
      return mapSubItem(state, action.domainId, action.subItemId, (s) => ({
        ...s,
        log: s.log.map((e) => (e.id !== action.entryId ? e : { ...e, ...action.patch })),
      }));
    }
    case 'DELETE_LOG_ENTRY': {
      return mapSubItem(state, action.domainId, action.subItemId, (s) => ({
        ...s,
        log: s.log.filter((e) => e.id !== action.entryId),
      }));
    }

    case 'TOGGLE_PLAN_ITEM_TODAY': {
      return mapSubItem(state, action.domainId, action.subItemId, (s) => {
        const existing = s.log.find(
          (e) => e.date === action.date && e.planItemId === action.planItemId
        );
        if (existing) {
          return { ...s, log: s.log.filter((e) => e.id !== existing.id) };
        }
        const entry = {
          id: newId('log'),
          date: action.date,
          note: '',
          value: null,
          unit: '',
          planItemId: action.planItemId,
        };
        return { ...s, log: [entry, ...s.log] };
      });
    }

    case 'RESET_TO_SEED': {
      return { domains: seedDomains() };
    }

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return html`<${StoreContext.Provider} value=${{ state, dispatch }}>${children}<//>`;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function findSubItem(state, domainId, subItemId) {
  const d = state.domains.find((x) => x.id === domainId);
  if (!d) return null;
  const s = d.subItems.find((x) => x.id === subItemId);
  if (!s) return null;
  return { domain: d, subItem: s };
}
