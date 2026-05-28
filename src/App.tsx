import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/layout/BottomNav'
import { Home } from './pages/Home'
import { Meals } from './pages/Meals'
import { Diet } from './pages/Diet'
import { Substitution } from './pages/Substitution'
import { Progress } from './pages/Progress'

export default function App() {
  return (
    <BrowserRouter>
      <div
        className="min-h-dvh"
        style={{ backgroundColor: '#F7F5F0' }}
      >
        <main className="max-w-lg mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/refeicoes" element={<Meals />} />
            <Route path="/dieta" element={<Diet />} />
            <Route path="/substituicoes" element={<Substitution />} />
            <Route path="/progresso" element={<Progress />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
