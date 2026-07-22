import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useNavigate, useLocation } from 'react-router-dom'

export default function InputCode() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email

  const [code, setCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(3 * 60) // 3 menit dalam detik

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const handleVerify = () => {
    if (!code) {
      toast.error("Please enter the code")
      return
    }

    axios.post("http://127.0.0.1:8000/api/check-verify-code", {
      email,
      code: parseInt(code)
    })
      .then(() => {
        toast.success("Code verified!")
        navigate("/change-password", { state: { email } })
      })
      .catch(error => {
        const detail = error?.response?.data?.detail
        toast.error(detail ?? "Something went wrong, please try again")
      })
  }

  const handleResend = () => {
    axios.post("http://127.0.0.1:8000/api/resend-verify-code", { email })
      .then(() => {
        toast.success("Code resent to your email")
        setTimeLeft(3 * 60) // reset timer
        setCode("")
      })
      .catch(error => {
        const detail = error?.response?.data?.detail
        toast.error(detail ?? "Failed to resend code")
      })
  }

  return (
    <div className='w-full h-screen flex flex-col justify-center items-center gap-10'>
      <div className='flex flex-col items-center gap-4'>
        <img src="/chat1.svg" alt="logo" width={45} height={45}/>
        <p className='text-[25px] font-bold'>Input code</p>
        <p className='text-[12px] text-gray-500'>Code sent to <strong>{email}</strong></p>
      </div>
      <div className='flex flex-col gap-4 w-full items-center'>
        <div className='rounded-md w-[300px] h-[40px] bg-[#f3f3f3] focus-within:ring-1 focus-within:ring-green-500'>
          <input
            type="text"
            placeholder='6 Digit Code'
            value={code}
            maxLength={6}
            className='w-full h-full px-2 outline-none'
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
        </div>
        <button
          className='bg-[#27bb88] w-[300px] h-[40px] flex justify-center items-center text-white rounded-md hover:cursor-pointer'
          onClick={handleVerify}
        >
          Verify
        </button>
      </div>
      <div className='flex flex-col items-center gap-4'>
        <p>
          Didn't Receive Code?{' '}
          <button
            onClick={handleResend}
            disabled={timeLeft > 0}
            className={`underline ${timeLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:cursor-pointer'}`}
          >
            Resend Code
          </button>
        </p>
        <p className={`${timeLeft === 0 ? 'text-red-500' : 'text-gray-600'}`}>
          {timeLeft > 0 ? `Code expire in ${formatTime(timeLeft)}` : 'Code expired, please resend'}
        </p>
      </div>
    </div>
  )
}