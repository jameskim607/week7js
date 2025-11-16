// services/api.js - API service for bug operations

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to build query string from params
const buildQuery = (params = {}) => {
  const esc = encodeURIComponent;
  return Object.keys(params)
    .map(k => `${esc(k)}=${esc(params[k])}`)
    .join('&');
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { json = null; }
    const errMsg = json?.error || res.statusText || 'API Error';
    const error = new Error(errMsg);
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export const getBugs = async (params = {}) => {
  const q = buildQuery(params);
  const url = `${API_BASE_URL}/bugs${q ? `?${q}` : ''}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  const json = await handleResponse(res);
  // Backend returns { success: true, data: [...] }, extract data array
  return { data: json.data || json };
};

export const getBugById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/bugs/${id}`, { headers: { 'Content-Type': 'application/json' } });
  const json = await handleResponse(res);
  return { data: json.data || json };
};

export const createBug = async (bugData) => {
  const res = await fetch(`${API_BASE_URL}/bugs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bugData),
  });
  const json = await handleResponse(res);
  return { data: json.data || json };
};

export const updateBug = async (id, bugData) => {
  const res = await fetch(`${API_BASE_URL}/bugs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bugData),
  });
  const json = await handleResponse(res);
  return { data: json.data || json };
};

export const updateBugStatus = async (id, status) => {
  const res = await fetch(`${API_BASE_URL}/bugs/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const json = await handleResponse(res);
  return { data: json.data || json };
};

export const deleteBug = async (id) => {
  const res = await fetch(`${API_BASE_URL}/bugs/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await handleResponse(res);
  return { data: json.data || json };
};

export default {
  get: (url, opts) => fetch(`${API_BASE_URL}${url}`, opts).then(handleResponse),
  post: (url, body, opts) => fetch(`${API_BASE_URL}${url}`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, ...opts }).then(handleResponse),
};

