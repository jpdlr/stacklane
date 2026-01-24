export interface Card {
  id: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Column {
  id: string
  title: string
  cardIds: string[]
}

export interface Board {
  id: string
  title: string
  columns: Column[]
  cards: Record<string, Card>
}

export type DragType = 'card' | 'column'

export interface DragData {
  type: DragType
  id: string
  columnId?: string
}
