import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useKanban } from '../../context/KanbanContext'
import { useTheme } from '../../context/ThemeContext'
import { Column } from '../Column'
import { Card } from '../Card'
import type { Card as CardType } from '../../types'
import styles from './Board.module.css'

export function Board() {
  const { board, addColumn, moveCard, reorderCards } = useKanban()
  const { theme, toggleTheme } = useTheme()
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeData = active.data.current

    if (activeData?.type === 'card') {
      setActiveCard(activeData.card)
      setActiveColumnId(activeData.columnId)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (activeData?.type !== 'card') return

    const activeCardId = active.id as string
    const activeColumnId = activeData.columnId

    // Dropping over a column directly
    if (overData?.type === 'column') {
      const overColumnId = over.id as string
      if (activeColumnId !== overColumnId) {
        const overColumn = board.columns.find((c) => c.id === overColumnId)
        if (overColumn) {
          moveCard(activeCardId, activeColumnId, overColumnId, overColumn.cardIds.length)
          setActiveColumnId(overColumnId)
        }
      }
      return
    }

    // Dropping over another card
    if (overData?.type === 'card') {
      const overCardId = over.id as string
      const overColumnId = overData.columnId

      if (activeCardId === overCardId) return

      const overColumn = board.columns.find((c) => c.id === overColumnId)
      if (!overColumn) return

      const overCardIndex = overColumn.cardIds.indexOf(overCardId)

      if (activeColumnId === overColumnId) {
        // Same column - reorder
        const activeColumn = board.columns.find((c) => c.id === activeColumnId)
        if (!activeColumn) return

        const activeCardIndex = activeColumn.cardIds.indexOf(activeCardId)
        const newCardIds = arrayMove(activeColumn.cardIds, activeCardIndex, overCardIndex)
        reorderCards(activeColumnId, newCardIds)
      } else {
        // Different column - move
        moveCard(activeCardId, activeColumnId, overColumnId, overCardIndex)
        setActiveColumnId(overColumnId)
      }
    }
  }

  const handleDragEnd = () => {
    setActiveCard(null)
    setActiveColumnId(null)
  }

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim())
      setNewColumnTitle('')
      setIsAddingColumn(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddColumn()
    } else if (e.key === 'Escape') {
      setNewColumnTitle('')
      setIsAddingColumn(false)
    }
  }

  return (
    <div className={styles.boardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>{board.title}</h1>
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className={styles.themeIcon} aria-hidden="true">
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a1 1 0 0 1 1 1v1.2a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm0 14.8a1 1 0 0 1 1 1V20a1 1 0 1 1-2 0v-1.2a1 1 0 0 1 1-1zm9-6.8a1 1 0 0 1-1 1h-1.2a1 1 0 1 1 0-2H20a1 1 0 0 1 1 1zM6.2 12a1 1 0 0 1-1 1H4a1 1 0 1 1 0-2h1.2a1 1 0 0 1 1 1zm11.25-6.05a1 1 0 0 1 0 1.42l-.85.85a1 1 0 1 1-1.42-1.42l.85-.85a1 1 0 0 1 1.42 0zM8.27 15.73a1 1 0 0 1 0 1.42l-.85.85a1 1 0 1 1-1.42-1.42l.85-.85a1 1 0 0 1 1.42 0zm9.23 1.42a1 1 0 0 1-1.42 0l-.85-.85a1 1 0 1 1 1.42-1.42l.85.85a1 1 0 0 1 0 1.42zM8.27 6.27a1 1 0 0 1-1.42 0l-.85-.85a1 1 0 1 1 1.42-1.42l.85.85a1 1 0 0 1 0 1.42zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.2 14.4a1 1 0 0 1-1.22.64A7.01 7.01 0 0 1 9 5.02a1 1 0 0 1 .64-1.22 9 9 0 1 0 10.56 10.6z" />
                </svg>
              )}
            </span>
            <span className={styles.themeLabel}>
              {theme === 'light' ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          {board.columns.map((column, index) => (
            <Column key={column.id} column={column} index={index} />
          ))}

          {isAddingColumn ? (
            <div className={styles.addColumnForm}>
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter column title..."
                className={styles.addColumnInput}
                autoFocus
              />
              <div className={styles.addColumnActions}>
                <button onClick={handleAddColumn} className={styles.addButton}>
                  Add Column
                </button>
                <button
                  onClick={() => {
                    setNewColumnTitle('')
                    setIsAddingColumn(false)
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className={styles.addColumnButton}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Add Column
            </button>
          )}
        </div>

        <DragOverlay>
          {activeCard && activeColumnId && (
            <Card card={activeCard} columnId={activeColumnId} />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
