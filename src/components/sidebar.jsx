import React, { use, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar() {
  const [isClicked, setClicked] = useState(null)
  const [isHover, setIsHover] = useState(false)
  return (
    <div className='h-screen'>
      <div className='flex flex-col items-center h-full w-[320px] bg-white border-2 border-[#d9d9d9] gap-5'>
        <div className='flex justify-center items-center gap-3 py-5 px-2'>
          <img src="/chat1.svg" alt="chat1" width={40} height={40}/>
          <p className='font-bold text-xl'>DocuSwift</p>
          <img src="/sidebar.svg" alt="sidebar" width={25} height={10} className='ml-20 scale-x-[-1] hover:cursor-pointer'/>
        </div>
        <div className='flex justify-center items-center border border-[#d9d9d9] w-[85%] h-[45px] gap-2 shadow-md rounded-lg'>
          <img src="/plus.svg" alt="plus" width={25} height={25}/>
          <p className='font-semibold'>New Chat</p>
        </div>

        <Link to="/chats" className={`flex justify-between px-1 py-2 w-[85%] mt-5 ${isClicked === "1" ? "bg-[#e1faed]" : ""} hover:cursor-pointer rounded-xl`} onClick={() => setClicked(isClicked === "1" ? null : "1")} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
          {isClicked=="1"
            ?
            <>
              <div className='flex items-center gap-4 w-full pl-3'>
                <img src="/chat-green.svg" alt="chat2" width={30} height={30}/>
                <p className='font-semibold text-lg text-[#27bb88]'>Chats</p>
              </div>
              {isHover &&
                <img src="/dropdown.svg" alt="dropdown" width={35} height={30}/>
              }
            </>
            :
            <>
              <div className='flex items-center gap-4 w-full pl-3'>
                <img src="/chat2.svg" alt="chat2" width={30} height={30}/>
                <p className='font-semibold text-lg'>Chats</p>
              </div>
              {isHover &&
                <img src="/dropdown.svg" alt="dropdown" width={35} height={30}/>
              }
            </>
          }
        </Link>
        <Link to="/chatbots" className={`flex items-center p-2 gap-4 w-[75%] -mt-4 rounded-xl ${isClicked === "2" ? "bg-[#e1faed]" : ""}`} onClick={() => setClicked(isClicked === "2" ? null : "2")}>
          {isClicked === "2"
            ?
            <>
              <img src="/chatbot-green.svg" alt="chatbot-green" width={20} height={20}/>
              <p className='font-semibold text-md text-[#27bb88]'>Chatbots</p>  
            </>
            :
            <>
              <img src="/chatbot.svg" alt="chatbot" width={20} height={20}/>
              <p className='font-semibold text-md'>Chatbots</p>
            </>
          }
        </Link>
        <Link to="/documents" className={`flex items-center p-2 gap-4 w-[75%] -mt-4 ${isClicked === "3" ? "bg-[#e1faed]" : "" }`} onClick={() => setClicked(isClicked === "3" ? null : "3")}>
          {isClicked === "3"
              ?
              <>
                <img src="/document-green.svg" alt="document-green" width={20} height={20}/>
                <p className='font-semibold text-md text-[#27bb88]'>Documents</p>
              </>
              :
              <>
                <img src="/document.svg" alt="document" width={20} height={20}/>
                <p className='font-semibold text-md'>Documents</p>
              </>
          }
        </Link>
      </div>
    </div>
  )
}
