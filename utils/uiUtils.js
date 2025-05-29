import React from 'react';
import { Alert, Platform } from 'react-native';
import { toast } from 'react-toastify';

export const showAppAlert = (title, message, buttons, options) => {
  if (Platform.OS === 'web') {
    const fullMessage = message || title;
    const toastId = `toast-${Date.now()}`;

    const positions = [
      'top-left', 'top-center', 'top-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    ];    const position = positions[Math.floor(Math.random() * positions.length)];

    const ToastContent = () => (
      <div>
        <div style={{ marginBottom: 5 }}><strong>{fullMessage}</strong></div>
        {buttons?.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={() => {
                  if (btn.onPress) btn.onPress();
                  toast.dismiss(toastId);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontSize: 14,
                  cursor: 'pointer',
                  border: '1px solid #ccc',
                  backgroundColor: btn.style === 'cancel' ? '#f8f8f8' : '#e0e0e0'
                }}
              >
                {btn.text}
              </button>
            ))}
          </div>
        )}
      </div>
    );

    toast(<ToastContent />, {
      toastId,
      position,
      autoClose: options?.autoClose ?? 5000,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      closeButton: true,
    });
  } else {
    Alert.alert(title, message, buttons, options);
  }
};
