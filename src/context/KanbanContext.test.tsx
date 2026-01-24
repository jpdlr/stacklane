import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { KanbanProvider, useKanban } from './KanbanContext'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <KanbanProvider>{children}</KanbanProvider>
)

describe('KanbanContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides initial board with default columns', () => {
    const { result } = renderHook(() => useKanban(), { wrapper })

    expect(result.current.board.columns).toHaveLength(3)
    expect(result.current.board.columns[0].title).toBe('To Do')
    expect(result.current.board.columns[1].title).toBe('In Progress')
    expect(result.current.board.columns[2].title).toBe('Done')
  })

  it('adds a new column', () => {
    const { result } = renderHook(() => useKanban(), { wrapper })

    act(() => {
      result.current.addColumn('New Column')
    })

    expect(result.current.board.columns).toHaveLength(4)
    expect(result.current.board.columns[3].title).toBe('New Column')
  })

  it('updates a column title', () => {
    const { result } = renderHook(() => useKanban(), { wrapper })
    const columnId = result.current.board.columns[0].id

    act(() => {
      result.current.updateColumn(columnId, 'Updated Title')
    })

    expect(result.current.board.columns[0].title).toBe('Updated Title')
  })

  it('deletes a column', () => {
    const { result } = renderHook(() => useKanban(), { wrapper })
    const columnId = result.current.board.columns[0].id

    act(() => {
      result.current.deleteColumn(columnId)
    })

    expect(result.current.board.columns).toHaveLength(2)
    expect(result.current.board.columns.find(c => c.id === columnId)).toBeUndefined()
  })

  it('adds a card to a column', () => {
    const { result } = renderHook(() => useKanban(), { wrapper })
    const columnId = result.current.board.columns[0].id

    act(() => {
      result.current.addCard(columnId, 'New Card', 'Card description')
    })

    const column = result.current.board.columns[0]
    expect(column.cardIds).toHaveLength(1)

    const cardId = column.cardIds[0]
    const card = result.current.board.cards[cardId]
    expect(card.title).toBe('New Card')
    expect(card.description).toBe('Card description')
  })

  it('updates a card', () => {
    const { result } = renderHook(() => useKanban(), { wrapper })
    const columnId = result.current.board.columns[0].id

    act(() => {
      result.current.addCard(columnId, 'Original Title')
    })

    const cardId = result.current.board.columns[0].cardIds[0]

    act(() => {
      result.current.updateCard(cardId, { title: 'Updated Title', priority: 'high' })
    })

    const card = result.current.board.cards[cardId]
    expect(card.title).toBe('Updated Title')
    expect(card.priority).toBe('high')
  })

  it('deletes a card', () => {
    const { result } = renderHook(() => useKanban(), { wrapper })
    const columnId = result.current.board.columns[0].id

    act(() => {
      result.current.addCard(columnId, 'Card to delete')
    })

    const cardId = result.current.board.columns[0].cardIds[0]

    act(() => {
      result.current.deleteCard(cardId, columnId)
    })

    expect(result.current.board.columns[0].cardIds).toHaveLength(0)
    expect(result.current.board.cards[cardId]).toBeUndefined()
  })

  it('moves a card between columns', () => {
    const { result } = renderHook(() => useKanban(), { wrapper })
    const fromColumnId = result.current.board.columns[0].id
    const toColumnId = result.current.board.columns[1].id

    act(() => {
      result.current.addCard(fromColumnId, 'Card to move')
    })

    const cardId = result.current.board.columns[0].cardIds[0]

    act(() => {
      result.current.moveCard(cardId, fromColumnId, toColumnId, 0)
    })

    expect(result.current.board.columns[0].cardIds).toHaveLength(0)
    expect(result.current.board.columns[1].cardIds).toContain(cardId)
  })

  it('reorders cards within a column', () => {
    const { result } = renderHook(() => useKanban(), { wrapper })
    const columnId = result.current.board.columns[0].id

    act(() => {
      result.current.addCard(columnId, 'Card 1')
      result.current.addCard(columnId, 'Card 2')
      result.current.addCard(columnId, 'Card 3')
    })

    const cardIds = result.current.board.columns[0].cardIds
    const reorderedIds = [cardIds[2], cardIds[0], cardIds[1]]

    act(() => {
      result.current.reorderCards(columnId, reorderedIds)
    })

    expect(result.current.board.columns[0].cardIds).toEqual(reorderedIds)
  })

  it('throws error when useKanban is used outside provider', () => {
    expect(() => {
      renderHook(() => useKanban())
    }).toThrow('useKanban must be used within a KanbanProvider')
  })
})
