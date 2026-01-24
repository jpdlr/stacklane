import { KanbanProvider } from './context/KanbanContext'
import { ThemeProvider } from './context/ThemeContext'
import { Board } from './components'
import './styles/index.css'

function App() {
  return (
    <ThemeProvider>
      <KanbanProvider>
        <Board />
      </KanbanProvider>
    </ThemeProvider>
  )
}

export default App
