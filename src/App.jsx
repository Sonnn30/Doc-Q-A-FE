import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner' 
import Chats from './pages/Chats'
import Sidebar from './components/sidebar'
import ChatBots from './pages/ChatBots'
import Documents from './pages/Documents'
import Login from './pages/Login'
import SignUp  from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import InputCode from './pages/InputCode'
import ChangePassword from './pages/ChangePassword'

function MainLayout({ children, isOpen, onToggle }) {
  return (
    <div className='flex h-screen'>
      <Sidebar isOpen={isOpen} onToggle={onToggle} />

      {/* Strip tipis hanya muncul saat sidebar tertutup */}
      {!isOpen && (
        <div
          onClick={onToggle}
          className='h-screen w-6 bg-[#f5f5f5] border-r-2 border-[#d9d9d9] flex items-center justify-center hover:bg-[#e1faed] hover:cursor-pointer flex-shrink-0 transition-colors duration-200'
        >
          <span className='text-[#27bb88] text-[50px]'>›</span>
        </div>
      )}

      <div className='flex-1 overflow-auto'>
        {children}
      </div>
    </div>
  )
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path='/' element={<MainLayout isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(p => !p)}><Chats /></MainLayout>} />
        <Route path='/chats/:chatbotId' element={<MainLayout isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(p => !p)}><Chats /></MainLayout>} />
        <Route path='/chatbots/:chatbotId' element={<MainLayout isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(p => !p)}><ChatBots/></MainLayout>} />
        <Route path='/documents/:chatbotId' element={<MainLayout isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(p => !p)}><Documents/></MainLayout>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<SignUp/>} />
        <Route path='/forgot-password' element={<ForgotPassword/>} />
        <Route path='/input-code' element={<InputCode/>} />
        <Route path='/change-password' element={<ChangePassword/>} />
      </Routes>
    </>
  )
}