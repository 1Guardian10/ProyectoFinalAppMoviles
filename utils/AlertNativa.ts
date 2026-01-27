import { Alert, Platform, AlertButton, AlertOptions } from 'react-native';

export function showAlert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
) {
    if (Platform.OS === 'web') {
        if (buttons && buttons.length > 0) {
            const result = window.confirm(`${title}\n${message || ''}`);
            if (result) {
                const confirmBtn = buttons.find(b => b.style !== 'cancel') || buttons[0];
                confirmBtn?.onPress?.();
            } else {
                const cancelBtn = buttons.find(b => b.style === 'cancel');
                cancelBtn?.onPress?.();
            }
        } else {
            window.alert(`${title}\n${message || ''}`);
        }
    } else {
        Alert.alert(title, message, buttons, options);
    }
}