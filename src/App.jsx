import React from 'react'
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

function MainLayout({ children }) {
  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 overflow-auto'>{children}</div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path='/' element={<MainLayout><Chats /></MainLayout>} />
        <Route path='/chats/:chatbotId' element={<MainLayout><Chats /></MainLayout>} />
        <Route path='/chatbots/:chatbotId' element={<MainLayout><ChatBots/></MainLayout>} />
        <Route path='/documents/:chatbotId' element={<MainLayout><Documents/></MainLayout>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<SignUp/>} />
        <Route path='/forgot-password' element={<ForgotPassword/>} />
        <Route path='/input-code' element={<InputCode/>} />
        <Route path='/change-password' element={<ChangePassword/>} />
      </Routes>
    </>
  )
}