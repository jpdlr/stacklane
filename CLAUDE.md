# CLAUDE.md - Development Guidelines

This file provides guidance for Claude Code when working on this Kanban project.

## Project Overview

A Kanban project management tool built with React, TypeScript, and Vite. Uses @dnd-kit for drag-and-drop and follows Material Design 3 styling with neutral pastel colors.

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:5173

# Building
npm run build        # Type check + production build
npm run preview      # Preview production build

# Testing
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

## Architecture

### State Management

- Uses React Context (`KanbanContext`) for global state
- State persisted to localStorage
- Reducer pattern with actions for all mutations

### Component Structure

```
src/components/
├── Board/     # Root component, DnD context provider
├── Column/    # Droppable column, contains cards
└── Card/      # Draggable card, sortable within columns
```

### Styling

- CSS Modules for component styles
- Global theme in `src/styles/theme.css`
- MD3 design tokens as CSS variables
- Dark mode via `prefers-color-scheme` media query

## Code Patterns

### Adding New Components

1. Create folder under `src/components/`
2. Include `.tsx`, `.module.css`, `index.ts`, and `.test.tsx`
3. Export from `src/components/index.ts`

### State Updates

All board mutations go through `KanbanContext`:

```typescript
const { addCard, updateCard, deleteCard, moveCard } = useKanban()
```

### Drag and Drop

- `@dnd-kit/core` for DnD context and events
- `@dnd-kit/sortable` for sortable lists
- Cards are sortable within and across columns

## Testing

- Tests use Vitest + React Testing Library
- Mock `KanbanContext` for isolated component tests
- Test files colocated with components (`*.test.tsx`)

## Type Definitions

Core types in `src/types/kanban.ts`:

- `Card` - Task card with title, description, priority, tags
- `Column` - Contains card IDs and title
- `Board` - Root type with columns and cards map

## CSS Variables

Key theme variables to know:

```css
--md-sys-color-primary        /* Primary action color */
--md-sys-color-surface        /* Card/container background */
--md-sys-color-on-surface     /* Text on surface */
--md-sys-shape-corner-medium  /* Default border radius */
--md-sys-elevation-1          /* Subtle shadow */
--md-sys-elevation-2          /* Hover shadow */
```

## File Organization

- Keep components self-contained with styles
- Types shared across components go in `src/types/`
- Context providers in `src/context/`
- Custom hooks in `src/hooks/`
