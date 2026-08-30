const API_BASE = 'http://localhost:8000/api';
const WS_BASE = 'ws://localhost:8000/ws';

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function fetchRoutes() {
  const res = await fetch(`${API_BASE}/routes`);
  if (!res.ok) throw new Error('Failed to fetch routes');
  return res.json();
}

export async function fetchBuses() {
  const res = await fetch(`${API_BASE}/buses`);
  if (!res.ok) throw new Error('Failed to fetch buses');
  return res.json();
}

export async function fetchBusHistory(busId) {
  const res = await fetch(`${API_BASE}/buses/${busId}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function sendLocationREST(busId, lat, lng, speed) {
  const res = await fetch(`${API_BASE}/location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bus_id: busId,
      latitude: lat,
      longitude: lng,
      speed: speed
    }),
  });
  return res.json();
}

export function createStudentWebSocket(busId, onMessage) {
  const ws = new WebSocket(`${WS_BASE}/student/${busId}`);
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  };
  return ws;
}

export function createDriverWebSocket(busId) {
  return new WebSocket(`${WS_BASE}/driver/${busId}`);
}

export function createPipelineWebSocket(onMessage) {
  const ws = new WebSocket(`${WS_BASE}/pipeline`);
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error('Error parsing pipeline message:', err);
    }
  };
  return ws;
}
