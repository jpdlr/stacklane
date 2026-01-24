import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { Board } from './Board'
import { KanbanProvider } from '../../context/KanbanContext'

const renderBoard = () => {
  return render(
    <KanbanProvider>
      <Board />
    </KanbanProvider>
  )
}

describe('Board', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders board title', () => {
    renderBoard()
    expect(screen.getByText('My Kanban Board')).toBeInTheDocument()
  })

  it('renders default columns', () => {
    renderBoard()
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders add column button', () => {
    renderBoard()
    expect(screen.getByText('Add Column')).toBeInTheDocument()
  })

  it('shows add column form when add button is clicked', async () => {
    const user = userEvent.setup()
    renderBoard()

    const addButton = screen.getByText('Add Column')
    await user.click(addButton)

    expect(screen.getByPlaceholderText('Enter column title...')).toBeInTheDocument()
  })

  it('adds a new column when form is submitted', async () => {
    const user = userEvent.setup()
    renderBoard()

    const addButton = screen.getByText('Add Column')
    await user.click(addButton)

    const input = screen.getByPlaceholderText('Enter column title...')
    await user.type(input, 'New Column')

    const submitButton = screen.getByRole('button', { name: 'Add Column' })
    await user.click(submitButton)

    expect(screen.getByText('New Column')).toBeInTheDocument()
  })

  it('cancels adding column when cancel is clicked', async () => {
    const user = userEvent.setup()
    renderBoard()

    const addButton = screen.getByText('Add Column')
    await user.click(addButton)

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(screen.queryByPlaceholderText('Enter column title...')).not.toBeInTheDocument()
  })

  it('renders add card buttons for each column', () => {
    renderBoard()
    const addCardButtons = screen.getAllByText('Add a card')
    expect(addCardButtons).toHaveLength(3)
  })
})
