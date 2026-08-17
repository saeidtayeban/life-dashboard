import { todayISO, todayWeekday } from './dates.js';

function matchesToday(recurrence, weekday) {
  if (!recurrence) return false;
  if (recurrence.type === 'daily') return true;
  if (recurrence.type === 'weekly') return (recurrence.days || []).includes(weekday);
  return false;
}

export function buildTodayFeed(domains) {
  const date = todayISO();
  const weekday = todayWeekday();
  const rows = [];

  for (const domain of domains) {
    for (const subItem of domain.subItems) {
      if (!subItem.plan || !subItem.plan.items || !subItem.plan.items.length) continue;
      for (const item of subItem.plan.items) {
        if (!matchesToday(item.recurrence, weekday)) continue;
        const todaysEntries = subItem.log.filter(
          (e) => e.date === date && e.planItemId === item.id
        );
        rows.push({
          key: `${subItem.id}:${item.id}`,
          domainId: domain.id,
          domainName: domain.name,
          subItemId: subItem.id,
          subItemName: subItem.name,
          planItem: item,
          entryType: item.entryType,
          time: item.time || '',
          done: item.entryType === 'toggle' ? todaysEntries.length > 0 : false,
          count: todaysEntries.length,
        });
      }
    }
  }

  rows.sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return (
      a.domainName.localeCompare(b.domainName) ||
      a.subItemName.localeCompare(b.subItemName)
    );
  });

  return rows;
}
