import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  useCallback,
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Board, Card, Column } from '../types'

interface KanbanState {
  board: Board
}

type KanbanAction =
  | { type: 'ADD_COLUMN'; payload: { title: string } }
  | { type: 'UPDATE_COLUMN'; payload: { id: string; title: string } }
  | { type: 'DELETE_COLUMN'; payload: { id: string } }
  | { type: 'ADD_CARD'; payload: { columnId: string; title: string; description?: string } }
  | { type: 'UPDATE_CARD'; payload: { id: string; updates: Partial<Card> } }
  | { type: 'DELETE_CARD'; payload: { id: string; columnId: string } }
  | { type: 'MOVE_CARD'; payload: { cardId: string; fromColumnId: string; toColumnId: string; toIndex: number } }
  | { type: 'REORDER_CARDS'; payload: { columnId: string; cardIds: string[] } }
  | { type: 'REORDER_COLUMNS'; payload: { columns: Column[] } }
  | { type: 'SET_BOARD'; payload: Board }

const initialBoard: Board = {
  id: uuidv4(),
  title: 'My Kanban Board',
  columns: [
    { id: uuidv4(), title: 'To Do', cardIds: [] },
    { id: uuidv4(), title: 'In Progress', cardIds: [] },
    { id: uuidv4(), title: 'Done', cardIds: [] },
  ],
  cards: {},
}

const STORAGE_KEY = 'kanban-board'

function loadFromStorage(): Board {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert date strings back to Date objects
      Object.values(parsed.cards as Record<string, Card>).forEach((card) => {
        card.createdAt = new Date(card.createdAt)
        card.updatedAt = new Date(card.updatedAt)
      })
      return parsed
    }
  } catch {
    console.warn('Failed to load board from storage')
  }
  return initialBoard
}

function saveToStorage(board: Board): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
  } catch {
    console.warn('Failed to save board to storage')
  }
}

function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
  let newState: KanbanState

  switch (action.type) {
    case 'ADD_COLUMN': {
      const newColumn: Column = {
        id: uuidv4(),
        title: action.payload.title,
        cardIds: [],
      }
      newState = {
        ...state,
        board: {
          ...state.board,
          columns: [...state.board.columns, newColumn],
        },
      }
      break
    }

    case 'UPDATE_COLUMN': {
      newState = {
        ...state,
        board: {
          ...state.board,
          columns: state.board.columns.map((col) =>
            col.id === action.payload.id
              ? { ...col, title: action.payload.title }
              : col
          ),
        },
      }
      break
    }

    case 'DELETE_COLUMN': {
      const column = state.board.columns.find((c) => c.id === action.payload.id)
      const newCards = { ...state.board.cards }
      column?.cardIds.forEach((cardId) => delete newCards[cardId])

      newState = {
        ...state,
        board: {
          ...state.board,
          columns: state.board.columns.filter((c) => c.id !== action.payload.id),
          cards: newCards,
        },
      }
      break
    }

    case 'ADD_CARD': {
      const newCard: Card = {
        id: uuidv4(),
        title: action.payload.title,
        description: action.payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      newState = {
        ...state,
        board: {
          ...state.board,
          columns: state.board.columns.map((col) =>
            col.id === action.payload.columnId
              ? { ...col, cardIds: [...col.cardIds, newCard.id] }
              : col
          ),
          cards: {
            ...state.board.cards,
            [newCard.id]: newCard,
          },
        },
      }
      break
    }

    case 'UPDATE_CARD': {
      const existingCard = state.board.cards[action.payload.id]
      if (!existingCard) return state

      newState = {
        ...state,
        board: {
          ...state.board,
          cards: {
            ...state.board.cards,
            [action.payload.id]: {
              ...existingCard,
              ...action.payload.updates,
              updatedAt: new Date(),
            },
          },
        },
      }
      break
    }

    case 'DELETE_CARD': {
      const newCards = { ...state.board.cards }
      delete newCards[action.payload.id]

      newState = {
        ...state,
        board: {
          ...state.board,
          columns: state.board.columns.map((col) =>
            col.id === action.payload.columnId
              ? { ...col, cardIds: col.cardIds.filter((id) => id !== action.payload.id) }
              : col
          ),
          cards: newCards,
        },
      }
      break
    }

    case 'MOVE_CARD': {
      const { cardId, fromColumnId, toColumnId, toIndex } = action.payload

      newState = {
        ...state,
        board: {
          ...state.board,
          columns: state.board.columns.map((col) => {
            if (col.id === fromColumnId && fromColumnId === toColumnId) {
              const newCardIds = col.cardIds.filter((id) => id !== cardId)
              newCardIds.splice(toIndex, 0, cardId)
              return { ...col, cardIds: newCardIds }
            }
            if (col.id === fromColumnId) {
              return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) }
            }
            if (col.id === toColumnId) {
              const newCardIds = [...col.cardIds]
              newCardIds.splice(toIndex, 0, cardId)
              return { ...col, cardIds: newCardIds }
            }
            return col
          }),
        },
      }
      break
    }

    case 'REORDER_CARDS': {
      newState = {
        ...state,
        board: {
          ...state.board,
          columns: state.board.columns.map((col) =>
            col.id === action.payload.columnId
              ? { ...col, cardIds: action.payload.cardIds }
              : col
          ),
        },
      }
      break
    }

    case 'REORDER_COLUMNS': {
      newState = {
        ...state,
        board: {
          ...state.board,
          columns: action.payload.columns,
        },
      }
      break
    }

    case 'SET_BOARD': {
      newState = {
        ...state,
        board: action.payload,
      }
      break
    }

    default:
      return state
  }

  saveToStorage(newState.board)
  return newState
}

interface KanbanContextValue {
  board: Board
  addColumn: (title: string) => void
  updateColumn: (id: string, title: string) => void
  deleteColumn: (id: string) => void
  addCard: (columnId: string, title: string, description?: string) => void
  updateCard: (id: string, updates: Partial<Card>) => void
  deleteCard: (id: string, columnId: string) => void
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => void
  reorderCards: (columnId: string, cardIds: string[]) => void
  reorderColumns: (columns: Column[]) => void
}

const KanbanContext = createContext<KanbanContextValue | null>(null)

export function KanbanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kanbanReducer, { board: loadFromStorage() })

  const addColumn = useCallback((title: string) => {
    dispatch({ type: 'ADD_COLUMN', payload: { title } })
  }, [])

  const updateColumn = useCallback((id: string, title: string) => {
    dispatch({ type: 'UPDATE_COLUMN', payload: { id, title } })
  }, [])

  const deleteColumn = useCallback((id: string) => {
    dispatch({ type: 'DELETE_COLUMN', payload: { id } })
  }, [])

  const addCard = useCallback((columnId: string, title: string, description?: string) => {
    dispatch({ type: 'ADD_CARD', payload: { columnId, title, description } })
  }, [])

  const updateCard = useCallback((id: string, updates: Partial<Card>) => {
    dispatch({ type: 'UPDATE_CARD', payload: { id, updates } })
  }, [])

  const deleteCard = useCallback((id: string, columnId: string) => {
    dispatch({ type: 'DELETE_CARD', payload: { id, columnId } })
  }, [])

  const moveCard = useCallback(
    (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => {
      dispatch({ type: 'MOVE_CARD', payload: { cardId, fromColumnId, toColumnId, toIndex } })
    },
    []
  )

  const reorderCards = useCallback((columnId: string, cardIds: string[]) => {
    dispatch({ type: 'REORDER_CARDS', payload: { columnId, cardIds } })
  }, [])

  const reorderColumns = useCallback((columns: Column[]) => {
    dispatch({ type: 'REORDER_COLUMNS', payload: { columns } })
  }, [])

  return (
    <KanbanContext.Provider
      value={{
        board: state.board,
        addColumn,
        updateColumn,
        deleteColumn,
        addCard,
        updateCard,
        deleteCard,
        moveCard,
        reorderCards,
        reorderColumns,
      }}
    >
      {children}
    </KanbanContext.Provider>
  )
}

export function useKanban() {
  const context = useContext(KanbanContext)
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider')
  }
  return context
}
