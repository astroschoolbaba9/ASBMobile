import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const GUEST_NAME_KEY = 'asb_guest_name';
const GUEST_DOB_KEY = 'asb_guest_dob';

export async function getGuestProfile(): Promise<{ name: string; dob: string }> {
  try {
    if (Platform.OS === 'web') {
      const name = typeof window !== 'undefined' ? localStorage.getItem(GUEST_NAME_KEY) || '' : '';
      const dob = typeof window !== 'undefined' ? localStorage.getItem(GUEST_DOB_KEY) || '' : '';
      return { name, dob };
    } else {
      const name = (await SecureStore.getItemAsync(GUEST_NAME_KEY)) || '';
      const dob = (await SecureStore.getItemAsync(GUEST_DOB_KEY)) || '';
      return { name, dob };
    }
  } catch (e) {
    return { name: '', dob: '' };
  }
}

export async function saveGuestProfile(name?: string, dob?: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        if (name) localStorage.setItem(GUEST_NAME_KEY, name);
        if (dob) localStorage.setItem(GUEST_DOB_KEY, dob);
      }
    } else {
      if (name) await SecureStore.setItemAsync(GUEST_NAME_KEY, name);
      if (dob) await SecureStore.setItemAsync(GUEST_DOB_KEY, dob);
    }
  } catch (e) {
    console.warn('Failed to save guest profile:', e);
  }
}
