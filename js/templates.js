const TEMPLATES = [
  {
    id: 'blank-note',
    label: 'Blank note',
    type: 'text',
    title: 'Untitled note',
    content: '',
  },
  {
    id: 'blank-code',
    label: 'Blank code snippet',
    type: 'code',
    title: 'Untitled snippet',
    language: 'javascript',
    content: '',
  },
  {
    id: 'meeting',
    label: 'Meeting notes',
    type: 'text',
    title: 'Meeting — ',
    content:
`# Meeting notes

**Date:**
**Attendees:**

## Agenda
- 

## Discussion


## Decisions
- 

## Action items
- [ ] `,
  },
  {
    id: 'daily',
    label: 'Daily journal',
    type: 'text',
    title: 'Journal — ',
    content:
`## Today

## Wins

## Blockers

## Tomorrow
- `,
  },
  {
    id: 'todo',
    label: 'Todo list',
    type: 'text',
    title: 'Todo list',
    content:
`## Todo
- [ ] 
- [ ] 
- [ ] 

## Done
`,
  },
  {
    id: 'bug',
    label: 'Bug report',
    type: 'text',
    title: 'Bug — ',
    content:
`## Summary


## Steps to reproduce
1. 
2. 

## Expected behavior


## Actual behavior


## Environment
- 
`,
  },
  {
    id: 'readme',
    label: 'README outline',
    type: 'text',
    title: 'README',
    content:
`# Project name

One-line description.

## Install

## Usage

## License
`,
  },
  {
    id: 'snippet-py',
    label: 'Python function stub',
    type: 'code',
    title: 'Python snippet',
    language: 'python',
    content:
`def function_name(arg):
    """Describe what this does."""
    pass
`,
  },
  {
    id: 'snippet-js',
    label: 'JavaScript function stub',
    type: 'code',
    title: 'JavaScript snippet',
    language: 'javascript',
    content:
`function functionName(arg) {
  // Describe what this does
}
`,
  },
];

function templateById(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}
