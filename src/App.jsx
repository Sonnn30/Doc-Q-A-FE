import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Chats from './pages/Chats'
import Sidebar from './components/sidebar'
import ChatBots from './pages/ChatBots'
import Documents from './pages/Documents'

export default function App() {
  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 overflow-auto'>
        <Routes>
          <Route path='/' element={<Chats />} />
          <Route path='/chats' element={<Chats />} />
          <Route path='/chatbots' element={<ChatBots/>}/>
          <Route path='/documents' element={<Documents/>}/>
        </Routes>
      </div>
    </div>
  )
}