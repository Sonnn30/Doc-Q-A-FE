import axios from 'axios'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ChangePassword() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email

  const [isHide, setHide] = useState(true)
  const [isHideC, setHideC] = useState(true)
  const [password, setPassword] = useState("")
  const [confirmedPassword, setConfirmedPassword] = useState("")

  const handleChangePassword = () => {
    if (!password || !confirmedPassword) {
      toast.error("Please fill all fields")
      return
    }

    axios.put("http://127.0.0.1:8000/api/change-password", {
      email,
      password,
      confirmed_password: confirmedPassword
    })
      .then(() => {
        toast.success("Password changed successfully!")
        navigate("/login")
      })
      .catch(error => {
        const detail = error?.response?.data?.detail
        toast.error(detail ?? "Something went wrong, please try again")
      })
  }

  return (
    <div className='w-full h-screen flex flex-col justify-center items-center gap-10'>
      <div className='flex flex-col items-center gap-4'>
        <img src="/chat1.svg" alt="logo" width={45} height={45}/>
        <p className='text-[25px] font-bold'>Change Password</p>
      </div>
      <div className='flex flex-col gap-4 w-full items-center'>
        <div className='relative rounded-md w-[300px] h-[40px] bg-[#f3f3f3] focus-within:ring-1 focus-within:ring-green-500'>
          <input
            type={isHide ? "password" : "text"}
            placeholder='New Password'
            value={password}
            className='w-full h-full px-2 pr-9 outline-none bg-transparent'
            onChange={(e) => setPassword(e.target.value)}
          />
          <img
            src={isHide ? "/eye-close.svg" : "/eye-open.svg"}
            alt="toggle password"
            width={18} height={18}
            className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer'
            onClick={() => setHide(!isHide)}
          />
        </div>
        <div className='relative rounded-md w-[300px] h-[40px] bg-[#f3f3f3] focus-within:ring-1 focus-within:ring-green-500'>
          <input
            type={isHideC ? "password" : "text"}
            placeholder='Confirm Password'
            value={confirmedPassword}
            className='w-full h-full px-2 pr-9 outline-none bg-transparent'
            onChange={(e) => setConfirmedPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
          />
          <img
            src={isHideC ? "/eye-close.svg" : "/eye-open.svg"}
            alt="toggle confirm password"
            width={18} height={18}
            className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer'
            onClick={() => setHideC(!isHideC)}
          />
        </div>
        <button
          className='bg-[#27bb88] w-[300px] h-[40px] flex justify-center items-center text-white rounded-md hover:cursor-pointer'
          onClick={handleChangePassword}
        >
          Change Password
        </button>
      </div>
    </div>
  )
}