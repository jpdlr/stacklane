import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Column as ColumnType } from '../../types'
import { useKanban } from '../../context/KanbanContext'
import { Card } from '../Card'
import styles from './Column.module.css'

interface ColumnProps {
  column: ColumnType
  index: number
}

export function Column({ column, index }: ColumnProps) {
  const { board, addCard, updateColumn, deleteColumn } = useKanban()
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  })

  const cards = column.cardIds
    .map((id) => board.cards[id])
    .filter(Boolean)

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(column.id, newCardTitle.trim())
      setNewCardTitle('')
      setIsAddingCard(false)
    }
  }

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      updateColumn(column.id, editTitle.trim())
    }
    setIsEditingTitle(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCard()
    } else if (e.key === 'Escape') {
      setNewCardTitle('')
      setIsAddingCard(false)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setEditTitle(column.title)
      setIsEditingTitle(false)
    }
  }

  const columnColors = [
    'var(--column-color-1)',
    'var(--column-color-2)',
    'var(--column-color-3)',
    'var(--column-color-4)',
  ]
  const backgroundColor = columnColors[index % columnColors.length]
  const animationDelay = `${index * 60}ms`

  return (
    <div className={styles.column} style={{ backgroundColor, animationDelay }}>
      <div className={styles.header}>
        {isEditingTitle ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className={styles.titleInput}
            autoFocus
          />
        ) : (
          <h3
            className={styles.title}
            onClick={() => setIsEditingTitle(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(true)}
          >
            {column.title}
            <span className={styles.count}>{cards.length}</span>
          </h3>
        )}
        <button
          onClick={() => deleteColumn(column.id)}
          className={styles.deleteButton}
          aria-label="Delete column"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`${styles.cardList} ${isOver ? styles.isOver : ''}`}
      >
        <SortableContext
          items={column.cardIds}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <Card key={card.id} card={card} columnId={column.id} />
          ))}
        </SortableContext>

        {isAddingCard ? (
          <div className={styles.addCardForm}>
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter card title..."
              className={styles.addCardInput}
              autoFocus
            />
            <div className={styles.addCardActions}>
              <button onClick={handleAddCard} className={styles.addButton}>
                Add
              </button>
              <button
                onClick={() => {
                  setNewCardTitle('')
                  setIsAddingCard(false)
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className={styles.addCardButton}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Add a card
          </button>
        )}
      </div>
    </div>
  )
}
