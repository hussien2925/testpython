export const palette = {
  primary: '#3F6BFF',
  primaryDark: '#2A4FDB',
  accent: '#22C3A6',
  danger: '#FF5B5B',
  warning: '#FFB020',
};

export interface Theme {
  mode: 'light' | 'dark';
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  primary: string;
  primaryDark: string;
  accent: string;
  danger: string;
  warning: string;
}

export const lightTheme: Theme = {
  mode: 'light',
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F8',
  border: '#E3E7F0',
  text: '#161B26',
  textSecondary: '#6B7280',
  textInverse: '#FFFFFF',
  ...palette,
};

export const darkTheme: Theme = {
  mode: 'dark',
  background: '#0B0D12',
  surface: '#161A22',
  surfaceAlt: '#1E232D',
  border: '#2A303C',
  text: '#F2F4F8',
  textSecondary: '#98A2B3',
  textInverse: '#0B0D12',
  ...palette,
};
