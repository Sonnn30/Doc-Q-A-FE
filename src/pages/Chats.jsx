import React from 'react'

export default function Chats() {
  return (
    <div className='flex flex-col h-screen w-full py-6'>
      <div className='flex flex-col justify-end items-center h-screen'>
        <div className='relative w-170'>
          <input type="text" className='border w-full h-11 rounded-3xl p-4 pr-14' placeholder='Ask anything about your documents'/>
          <div className='absolute right-1 top-1/2 -translate-y-1/2 flex justify-center items-center bg-[#27bb88] w-9 h-9 rounded-full cursor-pointer'>
            <img src="/send.svg" alt="send" width={18} height={18} />
          </div>
        </div>
      </div>
    </div>
  )
}