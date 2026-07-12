// Maganu Google Calendar Integration
const axios = require('axios');

const CALENDAR_ID = 'primary';

async function getAccessToken() {
  // Uses the stored Google OAuth token from env
  return process.env.GOOGLE_ACCESS_TOKEN || process.env.GOOGLECALENDAR_ACCESS_TOKEN;
}

async function getTodayEvents() {
  try {
    const token = await getAccessToken();
    if (!token) return 'Google Calendar not connected. Add GOOGLE_ACCESS_TOKEN to env vars.';

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

    const res = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { timeMin: startOfDay, timeMax: endOfDay, singleEvents: true, orderBy: 'startTime' }
      }
    );

    const events = res.data?.items || [];
    if (!events.length) return 'No events today. Schedule is clear! ✅';

    return events.map(e => {
      const start = e.start?.dateTime
        ? new Date(e.start.dateTime).toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' })
        : 'All day';
      return `🕐 ${start} — ${e.summary || 'Untitled'}`;
    }).join('\n');
  } catch (err) {
    if (err.response?.status === 401) return '⚠️ Google Calendar token expired. Reconnect in your settings.';
    return `Calendar error: ${err.response?.data?.error?.message || err.message}`;
  }
}

async function getUpcomingEvents(days = 7) {
  try {
    const token = await getAccessToken();
    if (!token) return 'Google Calendar not connected.';

    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const res = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { timeMin: now.toISOString(), timeMax: future.toISOString(), singleEvents: true, orderBy: 'startTime', maxResults: 10 }
      }
    );

    const events = res.data?.items || [];
    if (!events.length) return `No events in the next ${days} days.`;

    return events.map(e => {
      const date = e.start?.dateTime
        ? new Date(e.start.dateTime).toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos', weekday: 'short', month: 'short', day: 'numeric' })
        : e.start?.date || '?';
      const time = e.start?.dateTime
        ? new Date(e.start.dateTime).toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' })
        : 'All day';
      return `📅 ${date} ${time} — ${e.summary || 'Untitled'}`;
    }).join('\n');
  } catch (err) {
    return `Calendar error: ${err.response?.data?.error?.message || err.message}`;
  }
}

module.exports = { getTodayEvents, getUpcomingEvents };
