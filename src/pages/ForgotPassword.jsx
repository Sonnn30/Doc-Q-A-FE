import axios from 'axios'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")

  const handleSubmit = () => {
    if (!email) {
      toast.error("Please enter your email")
      return
    }

    axios.post("https://api.docuswift.online/api/send-verify-code", { email })
      .then(() => {
        toast.success("6 digit code sent to your email")
        navigate("/input-code", { state: { email } })  // pass email ke halaman berikutnya
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
        <p className='text-[25px] font-bold'>Forget Password</p>
        <p className='text-[12px] text-center'>No worries! Enter your email address below and<br />we will send you a code to reset password</p>
      </div>
      <div className='flex flex-col gap-4 w-full items-center'>
        <div className='rounded-md w-[300px] h-[40px] bg-[#f3f3f3] focus-within:ring-1 focus-within:ring-green-500'>
          <input
            type="text"
            placeholder='Email address'
            value={email}
            className='w-full h-full px-2 outline-none'
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <button
          className='bg-[#27bb88] w-[300px] h-[40px] flex justify-center items-center text-white rounded-md hover:cursor-pointer'
          onClick={handleSubmit}
        >
          Send code to email
        </button>
      </div>
    </div>
  )
}