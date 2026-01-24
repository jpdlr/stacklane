# Stacklane

A fast, keyboard-friendly Kanban board built with React and TypeScript. Features smooth drag-and-drop, MD3-inspired design, and local persistence.

---

## Features

- **Drag & Drop** — Smooth card movement with @dnd-kit
- **Keyboard Navigation** — Full keyboard accessibility
- **Local Persistence** — Board state saved to localStorage
- **Dark Mode** — Automatic theme via `prefers-color-scheme`
- **MD3 Design** — Clean, card-based Material Design 3 styling

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

## Usage

| Action | How |
|--------|-----|
| Add column | Click **+ Add Column** |
| Add card | Click **+** in column header |
| Edit card | Click on card |
| Move card | Drag to new position or column |
| Delete | Use card/column menu |

## Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm test           # Run tests
npm run lint       # Lint code
```

## Tech Stack

- **React 19** + TypeScript
- **Vite** — Build tool
- **@dnd-kit** — Drag and drop
- **Vitest** — Testing
- **CSS Modules** — Scoped styling

## Project Structure

```
src/
├── components/
│   ├── Board/      # Main board container
│   ├── Column/     # Droppable columns
│   └── Card/       # Draggable cards
├── context/        # Kanban state management
├── styles/         # Theme and global styles
└── types/          # TypeScript definitions
```

## License

MIT
