// Each language gets a signature color dot, shown in the sidebar, the
// editor tab strip, and the status bar — the app's recurring motif.
const LANGUAGES = [
  { id: 'plaintext',  label: 'Plain text', hljs: 'plaintext',  dot: '#8B9099' },
  { id: 'javascript', label: 'JavaScript', hljs: 'javascript',  dot: '#F2A93B' },
  { id: 'typescript', label: 'TypeScript', hljs: 'typescript',  dot: '#3E8ED0' },
  { id: 'python',     label: 'Python',     hljs: 'python',      dot: '#4FB3A9' },
  { id: 'java',       label: 'Java',       hljs: 'java',        dot: '#D97878' },
  { id: 'c',          label: 'C',          hljs: 'c',           dot: '#7C93C9' },
  { id: 'cpp',        label: 'C++',        hljs: 'cpp',         dot: '#6E7FD6' },
  { id: 'csharp',     label: 'C#',         hljs: 'csharp',      dot: '#8E6EDB' },
  { id: 'go',         label: 'Go',         hljs: 'go',          dot: '#4FC0C0' },
  { id: 'rust',       label: 'Rust',       hljs: 'rust',        dot: '#D97F4E' },
  { id: 'php',        label: 'PHP',        hljs: 'php',         dot: '#8C7BC9' },
  { id: 'ruby',       label: 'Ruby',       hljs: 'ruby',        dot: '#D9607A' },
  { id: 'swift',      label: 'Swift',      hljs: 'swift',       dot: '#E8955E' },
  { id: 'kotlin',     label: 'Kotlin',     hljs: 'kotlin',      dot: '#B788D9' },
  { id: 'sql',        label: 'SQL',        hljs: 'sql',         dot: '#5EA88E' },
  { id: 'html',       label: 'HTML',       hljs: 'xml',         dot: '#D9784E' },
  { id: 'css',        label: 'CSS',        hljs: 'css',         dot: '#5A8FD9' },
  { id: 'json',       label: 'JSON',       hljs: 'json',        dot: '#B0A75E' },
  { id: 'yaml',       label: 'YAML',       hljs: 'yaml',        dot: '#9AA85E' },
  { id: 'bash',       label: 'Bash',       hljs: 'bash',        dot: '#6E9E6E' },
  { id: 'markdown',   label: 'Markdown',   hljs: 'markdown',    dot: '#B0B4BC' },
];

function langById(id) {
  return LANGUAGES.find((l) => l.id === id) || LANGUAGES[0];
}
