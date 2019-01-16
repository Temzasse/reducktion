export const colors = {
  black: '#222',
  white: '#fff',
  red: '#ff6347',
  gray: {
    100: '#f7f7f7',
    200: '#f5f5f5',
    300: '#eee',
    400: '#ddd',
    500: '#ccc',
    600: '#999',
    700: '#666',
    800: '#444',
    900: '#222',
  },
};

interface ThemeVars {
  light: string;
  dark: string;
}

interface StyledProps {
  theme: {
    mode: 'light' | 'dark';
  }
}

export const themed = (themeVars: ThemeVars) => (props: StyledProps) => {
  const { mode = 'light' } = props.theme;
  return themeVars[mode];
};
