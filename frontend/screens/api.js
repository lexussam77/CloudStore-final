import { Platform } from 'react-native';

export const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080/api'
    : 'http://192.168.254.13:8080/api';

// Helper for robust fetch
async function robustFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    if (!res.ok) {
      return { success: false, error: data?.error || data?.message || data || 'Network error' };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || 'Network error' };
  }
}

// --- AUTH ---
export async function registerUser(data) {
  return robustFetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function loginUser(data) {
  // Accepts { identifier, password }
  return robustFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: data.identifier, password: data.password }),
  });
}

export async function verifyEmail(data) {
  return robustFetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(data) {
  return robustFetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function resetPassword(data) {
  return robustFetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// --- USER PROFILE ---
export async function getCurrentUser(token) {
  return robustFetch(`${API_BASE_URL}/user/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function updateCurrentUser(token, data) {
  return robustFetch(`${API_BASE_URL}/user/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function deleteCurrentUser(token) {
  return robustFetch(`${API_BASE_URL}/user/me`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// --- FILES ---
export async function listFiles(token, folderId = '') {
  const url = folderId ? `${API_BASE_URL}/files?folderId=${folderId}` : `${API_BASE_URL}/files`;
  return robustFetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function uploadFile(token, file, folderId = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (folderId) formData.append('folderId', folderId);
  return robustFetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
}

export async function deleteFile(token, fileId) {
  return robustFetch(`${API_BASE_URL}/files/permanent/${fileId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function restoreFile(token, fileId) {
  return robustFetch(`${API_BASE_URL}/files/restore/${fileId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function renameFile(token, fileId, newName) {
  return robustFetch(`${API_BASE_URL}/files/rename/${fileId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newName }),
  });
}

export async function favoriteFile(token, fileId) {
  return robustFetch(`${API_BASE_URL}/files/favorite/${fileId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function downloadFile(token, fileId) {
  return robustFetch(`${API_BASE_URL}/files/${fileId}/download`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function getDownloadUrl(token, fileId) {
  return robustFetch(`${API_BASE_URL}/files/${fileId}/download-url`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function compressFile(token, fileId, compressionSettings) {
  return robustFetch(`${API_BASE_URL}/files/${fileId}/compress`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(compressionSettings),
  });
}

export async function uploadFiles(token, files, folderId = null) {
  const formData = new FormData();
  files.forEach((file, idx) => {
    formData.append('files', file);
  });
  if (folderId) formData.append('folderId', folderId);
  return robustFetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
}

export async function searchFiles(token, query) {
  return robustFetch(`${API_BASE_URL}/files/search?query=${encodeURIComponent(query)}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// --- FOLDERS ---
export async function listFolders(token, parentId = null) {
  const url = parentId ? `${API_BASE_URL}/folders?parentId=${parentId}` : `${API_BASE_URL}/folders`;
  return robustFetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function createFolder(token, name, parentId = null) {
  return robustFetch(`${API_BASE_URL}/folders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, parentId }),
  });
}

export async function deleteFolder(token, folderId) {
  return robustFetch(`${API_BASE_URL}/folders/${folderId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function renameFolder(token, folderId, newName) {
  return robustFetch(`${API_BASE_URL}/folders/${folderId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: newName }),
  });
}

// --- NOTIFICATIONS ---
export async function listNotifications(token) {
  return robustFetch(`${API_BASE_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// --- LOGOUT (if implemented on backend) ---
export async function logout(token) {
  return fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(res => res.json());
}

// --- EXAMPLE USAGE ---
// import { loginUser, getCurrentUser, listFiles } from './api';
// const loginRes = await loginUser({ email, password });
// const token = loginRes.token;
// const user = await getCurrentUser(token);
// const files = await listFiles(token);
// For Google login:
// const googleRes = await googleLogin(idToken);
// const token = googleRes.token;
// const user = await getCurrentUser(token);
// End of example usage