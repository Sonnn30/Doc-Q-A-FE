import React from 'react'
import { useState } from 'react'

export default function InputCode() {
  const [isHide, setHide] = useState(true)
  return (
    <div className='w-full h-screen flex flex-col justify-center items-center gap-10'>
      <div className='flex flex-col items-center gap-4'>
        <img src="/chat1.svg" alt="logo" width={45} height={45}/>
        <p className='text-[25px] font-bold'>Input code</p>
      </div>
      <div className='flex flex-col gap-4 w-full items-center'>
        <div className='rounded-md w-[300px] h-[40px] bg-[#f3f3f3] focus-within:ring-1 focus-within:ring-green-500'>
            <input type="text" placeholder='4 Digit Code' className='w-full h-full px-2 outline-none '/>
        </div>
        <button className='bg-[#27bb88] w-[300px] h-[40px] flex justify-center items-center text-white rounded-md hover:cursor-pointer'>
            Verify
        </button>
      </div>
      <div className='flex flex-col items-center gap-4'>
        <p>Didn't Receive Code? <a href="#" className='underline'>Resend Code</a></p>
        <p>Resend code in 00:00</p>
      </div>
    </div>
  )
}
