// src/utils/authService.js
export const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'userData'
};

export const getStoredAuth = () => {
  try {
    let token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');
    let userStr = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem('user');

    if (!token) {
      token = sessionStorage.getItem('authToken');
      userStr = sessionStorage.getItem('userData');
    }

    if (token && token.startsWith('{')) {
      const tokenData = JSON.parse(token);
      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        clearAuthData();
        return { token: null, user: null };
      }
      token = tokenData.token;
    }

    return { token, user: userStr ? JSON.parse(userStr) : null };
  } catch {
    clearAuthData();
    return { token: null, user: null };
  }
};

export const clearAuthData = () => {
  [localStorage, sessionStorage].forEach(storage => {
    storage.removeItem('authToken');
    storage.removeItem('userData');
    storage.removeItem('token');
    storage.removeItem('user');
  });
};
