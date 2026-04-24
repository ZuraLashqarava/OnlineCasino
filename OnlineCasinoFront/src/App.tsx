import './App.css'
import NavBar from './Components/NavBar/NavBar'
import Login from './Components/Login/Login'
import SlotPage from './Components/Slot/SlotPage'
import SlotGame from './Components/Slot/SlotGame/SlotGame'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'

function App() {
  const [user] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token] = useState(() => localStorage.getItem("token") ?? "");

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/slots" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/slots" element={<SlotPage />} />
        <Route path="/slots/:id" element={
          user ? (
            <SlotGame
              slotId={1}
              userId={user.id}
              authToken={token}
              initialBalance={user.balance}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </>
  )
}

export default App