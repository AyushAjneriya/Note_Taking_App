// Named palettes. Each sets CSS custom properties on the root element.
const THEMES = {
  ink: {
    label: 'Ink & Signal',
    vars: {
      '--bg':        '#12151C',
      '--surface':   '#1B2029',
      '--surface-2': '#232A36',
      '--border':    '#2C3340',
      '--text':      '#E8E6E1',
      '--text-dim':  '#9AA1AE',
      '--accent':    '#F2A93B',
      '--accent-2':  '#4FB3A9',
      '--danger':    '#D97878',
      '--code-bg':   '#0E1116',
    },
  },
  paper: {
    label: 'Paper & Rust',
    vars: {
      '--bg':        '#F4F1EA',
      '--surface':   '#FFFFFF',
      '--surface-2': '#ECE7DC',
      '--border':    '#DCD5C4',
      '--text':      '#2A241C',
      '--text-dim':  '#756B5A',
      '--accent':    '#C1622B',
      '--accent-2':  '#3E7A6D',
      '--danger':    '#B5453A',
      '--code-bg':   '#2A241C',
    },
  },
  midnight: {
    label: 'Midnight Teal',
    vars: {
      '--bg':        '#0B1A1A',
      '--surface':   '#102626',
      '--surface-2': '#153232',
      '--border':    '#1E4141',
      '--text':      '#E3F2EF',
      '--text-dim':  '#8FB3AE',
      '--accent':    '#5FD9C4',
      '--accent-2':  '#E8A75E',
      '--danger':    '#E67E7E',
      '--code-bg':   '#081414',
    },
  },
  plum: {
    label: 'Plum & Amber',
    vars: {
      '--bg':        '#1A1420',
      '--surface':   '#221B2A',
      '--surface-2': '#2B2235',
      '--border':    '#3A2E45',
      '--text':      '#EEE7F2',
      '--text-dim':  '#A79AB3',
      '--accent':    '#E8A73E',
      '--accent-2':  '#B084D9',
      '--danger':    '#E07C8C',
      '--code-bg':   '#140F19',
    },
  },
};

function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.ink;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('data-theme', themeId);
}
