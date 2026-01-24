import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card as CardType } from '../../types'
import { useKanban } from '../../context/KanbanContext'
import styles from './Card.module.css'

interface CardProps {
  card: CardType
  columnId: string
}

export function Card({ card, columnId }: CardProps) {
  const { updateCard, deleteCard } = useKanban()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(card.title)
  const [editDescription, setEditDescription] = useState(card.description || '')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
      columnId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSave = () => {
    if (editTitle.trim()) {
      updateCard(card.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(card.title)
    setEditDescription(card.description || '')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const priorityClass = card.priority ? styles[card.priority] : ''

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className={`${styles.card} ${styles.editing}`}>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.editInput}
          placeholder="Card title"
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.editTextarea}
          placeholder="Description (optional)"
          rows={2}
        />
        <div className={styles.editActions}>
          <button onClick={handleSave} className={styles.saveButton}>
            Save
          </button>
          <button onClick={handleCancel} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${priorityClass}`}
      {...attributes}
      {...listeners}
    >
      <div className={styles.cardContent}>
        <h4 className={styles.title}>{card.title}</h4>
        {card.description && (
          <p className={styles.description}>{card.description}</p>
        )}
        {card.tags && card.tags.length > 0 && (
          <div className={styles.tags}>
            {card.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={styles.actions}>
        <button
          onClick={() => setIsEditing(true)}
          className={styles.actionButton}
          aria-label="Edit card"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </button>
        <button
          onClick={() => deleteCard(card.id, columnId)}
          className={styles.actionButton}
          aria-label="Delete card"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
