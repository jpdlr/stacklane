import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Card } from './Card'
import type { Card as CardType } from '../../types'

vi.mock('../../context/KanbanContext', () => ({
  useKanban: () => ({
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
  }),
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => null,
    },
  },
}))

const mockCard: CardType = {
  id: 'card-1',
  title: 'Test Card',
  description: 'Test Description',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('Card', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders card title', () => {
    render(<Card card={mockCard} columnId="col-1" />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
  })

  it('renders card description', () => {
    render(<Card card={mockCard} columnId="col-1" />)
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const cardWithoutDescription = { ...mockCard, description: undefined }
    render(<Card card={cardWithoutDescription} columnId="col-1" />)
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
  })

  it('renders tags when provided', () => {
    const cardWithTags = { ...mockCard, tags: ['urgent', 'frontend'] }
    render(<Card card={cardWithTags} columnId="col-1" />)
    expect(screen.getByText('urgent')).toBeInTheDocument()
    expect(screen.getByText('frontend')).toBeInTheDocument()
  })

  it('shows edit form when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<Card card={mockCard} columnId="col-1" />)

    const editButton = screen.getByLabelText('Edit card')
    await user.click(editButton)

    expect(screen.getByPlaceholderText('Card title')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Description (optional)')).toBeInTheDocument()
  })

  it('shows save and cancel buttons in edit mode', async () => {
    const user = userEvent.setup()
    render(<Card card={mockCard} columnId="col-1" />)

    const editButton = screen.getByLabelText('Edit card')
    await user.click(editButton)

    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('cancels edit when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<Card card={mockCard} columnId="col-1" />)

    const editButton = screen.getByLabelText('Edit card')
    await user.click(editButton)

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Card title')).not.toBeInTheDocument()
  })

  it('cancels edit when Escape key is pressed', async () => {
    const user = userEvent.setup()
    render(<Card card={mockCard} columnId="col-1" />)

    const editButton = screen.getByLabelText('Edit card')
    await user.click(editButton)

    const input = screen.getByPlaceholderText('Card title')
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Card title')).not.toBeInTheDocument()
  })

  it('has delete button', () => {
    render(<Card card={mockCard} columnId="col-1" />)
    expect(screen.getByLabelText('Delete card')).toBeInTheDocument()
  })
})
