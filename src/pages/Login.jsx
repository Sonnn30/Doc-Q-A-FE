import React, { useState } from 'react'
import axiosInstance from '../axiosInstance'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [isHide, setHide] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const Login_info = {
    "email": email,
    "password": password
  }
  const handlesubmit = () => {
    axiosInstance.post("/api/login", Login_info)
      .then((res) => {
        toast.success("Login successfully")
        sessionStorage.setItem("access_token", res.data.access_token)
        localStorage.setItem("refresh_token", res.data.refresh_token)
        navigate("/")
      })
      .catch(error =>{
        const detail = error.response?.data?.detail
        toast.error(detail ?? "Something went wrong, please try again")
      })
  }
  return (
    <div className='w-full h-screen flex flex-col justify-center items-center gap-10'>
      <div className='flex flex-col items-center gap-4'>
        <img src="/chat1.svg" alt="logo" width={45} height={45}/>
        <p className='text-[25px] font-bold'>Login</p>
      </div>
      <div className='flex flex-col gap-4 w-full items-center'>
        <div className='rounded-md w-[300px] h-[40px] bg-[#f3f3f3] focus-within:ring-1 focus-within:ring-green-500'>
            <input type="text" placeholder='Email address' value={email} className='w-full h-full px-2 outline-none ' onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div className='relative rounded-md w-[300px] h-[40px] bg-[#f3f3f3] focus-within:ring-1 focus-within:ring-green-500'>
            <input type={isHide ? "password" : "text"} placeholder='Password' value={password} className='w-full h-full px-2 pr-9 outline-none bg-transparent' onChange={(e) => setPassword(e.target.value)}/>
            {
              isHide
              ?
              <img src="/eye-close.svg" alt="eye-open" width={18} height={18} className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer' onClick={() => setHide(!isHide)}/>
              :
              <img src="/eye-open.svg" alt="eye-open" width={18} height={18} className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer' onClick={() => setHide(!isHide)}/>
            }
        </div>
        <button className='bg-[#27bb88] w-[300px] h-[40px] flex justify-center items-center text-white rounded-md hover:cursor-pointer' onClick={handlesubmit}>
            login
        </button>
      <a href="/forgot-password" className='text-[12px] hover:underline'>Forget your password?</a>
      </div>
      <div className='flex flex-col w-full justify-center items-center gap-5'>
        <p>Don't have a account?</p>
        <a href='/signup' className='w-[300px] h-[40px] flex justify-center items-center border border-gray-300 rounded-md shadow-lg hover:cursor-pointer'>
            Create new account
        </a>
      </div>
    </div>
  )
}
