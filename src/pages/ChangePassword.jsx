import React from 'react'
import { useState } from 'react'

export default function ChangePassword() {
  const [isHide, setHide] = useState(true)
  const [isHideC, setHideC] = useState(true)
  return (
    <div className='w-full h-screen flex flex-col justify-center items-center gap-10'>
      <div className='flex flex-col items-center gap-4'>
        <img src="/chat1.svg" alt="logo" width={45} height={45}/>
        <p className='text-[25px] font-bold'>Change Password</p>
      </div>
      <div className='flex flex-col gap-4 w-full items-center'>
        <div className='relative rounded-md w-[300px] h-[40px] bg-[#f3f3f3] focus-within:ring-1 focus-within:ring-green-500'>
            <input type={isHide ? "password" : "text"} placeholder='New Password' className='w-full h-full px-2 pr-9 outline-none bg-transparent'/>
            {
              isHide
              ?
              <img src="/eye-close.svg" alt="eye-open" width={18} height={18} className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer' onClick={() => setHide(!isHide)}/>
              :
              <img src="/eye-open.svg" alt="eye-open" width={18} height={18} className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer' onClick={() => setHide(!isHide)}/>
            }
        </div>
        <div className='relative rounded-md w-[300px] h-[40px] bg-[#f3f3f3] focus-within:ring-1 focus-within:ring-green-500'>
            <input type={isHideC ? "password" : "text"} placeholder='Confirm Password' className='w-full h-full px-2 pr-9 outline-none bg-transparent'/>
            {
              isHideC
              ?
              <img src="/eye-close.svg" alt="eye-open" width={18} height={18} className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer' onClick={() => setHideC(!isHideC)}/>
              :
              <img src="/eye-open.svg" alt="eye-open" width={18} height={18} className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer' onClick={() => setHideC(!isHideC)}/>
            }
        </div>
        <button className='bg-[#27bb88] w-[300px] h-[40px] flex justify-center items-center text-white rounded-md hover:cursor-pointer'>
            Change Password
        </button>
      </div>
    </div>
  )
}
