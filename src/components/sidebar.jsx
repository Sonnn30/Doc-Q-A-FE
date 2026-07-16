import React, { use, useEffect, useState } from 'react'
import { Link, useAsyncError, useNavigate } from 'react-router-dom'
import axiosInstance from '../axiosInstance'
import { toast } from 'sonner'

export default function Sidebar() {
  const [isClicked, setClicked] = useState({})
  const [isHover, setIsHover] = useState(false)
  const [isDropDown, setDropDown] = useState({})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [chatbot, setChatbot] = useState([])
  const [hasAddedLocal, setHasAddedLocal] = useState(false)
  const refresh_token = localStorage.getItem("refresh_token")
  const navigate = useNavigate()

  function FirstLetter(name){
    const split = name.trim().split(/\s+/)
    if(split.length === 1){
      return split[0].slice(0, 1).toUpperCase()
    }else{
      return (split[0][0] + split[1][0]).toUpperCase()
    }
  }
  
  useEffect(() => {
    axiosInstance.get("/api/get-user-by-id")
      .then((res) => {
        setEmail(res.data.email)
        setName(res.data.name)
      })
      .catch(error => {
        toast.error("Something Wrong")
      })
  }, [])

  const fetchChatbots = () => {
    axiosInstance.get("/api/get-chatbot-by-user_id")
      .then(res => {
        if (res.data.length === 0) {
          setChatbot([{ id: "default", name: "New Chatbot" }])
        } else {
          setChatbot([...res.data].reverse())
        }
      })
      .catch(err => {
        toast.error("Something Wrong")
      })
  }

  useEffect(() => {
    fetchChatbots()
  }, [])

  useEffect(() => {
    window.addEventListener("chatbot-updated", fetchChatbots)
    return () => window.removeEventListener("chatbot-updated", fetchChatbots)
  }, [])

  const handleLogout = () => {
    axiosInstance.post("/api/logout", {refresh_token})
      .then((res) => {
        toast.success("Logout success")
        sessionStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        navigate("/login")
      })
      .catch(err =>{
        toast.error("Something wrong")
      })
  }

  const handleNewChatbotClick = () => {
    if (hasAddedLocal) return   // udah pernah dipakai, gak bisa nambah lagi

    setChatbot((prev) => [...prev, { id: `local-${Date.now()}`, name: "New Chatbot" }])
    setHasAddedLocal(true)
  }

  return (
    <div className='h-screen'>
        <div className='flex flex-col items-center h-full w-[320px] bg-white border-2 border-[#d9d9d9] gap-9'>
          <div className='flex justify-center items-center gap-3 py-5 px-2'>
            <img src="/chat1.svg" alt="chat1" width={40} height={40}/>
            <p className='font-bold text-xl'>DocuSwift</p>
            <img src="/sidebar.svg" alt="sidebar" width={25} height={10} className='ml-20 scale-x-[-1] hover:cursor-pointer'/>
          </div>
          <div className='flex justify-center items-center border border-[#d9d9d9] w-[85%] h-[45px] gap-2 shadow-md rounded-lg hover:cursor-pointer' onClick={handleNewChatbotClick}>
            <img src="/plus.svg" alt="plus" width={25} height={25}/>
            <p className='font-semibold'>New Chatbot</p>
          </div>

      <div className='flex flex-col items-center gap-3 w-full h-[70%]'>
        {chatbot.map((bot) => (
          <React.Fragment key={bot.id} >
              <div className="flex justify-between items-center w-[270px] h-[50px] px-3 border-2 border-[#d9d9d9] shadow-sm hover:cursor-pointer rounded-xl" onClick={() => setDropDown(prev => ({ ...prev, [bot.id]: !prev[bot.id] }))}>
                <div className='flex items-center gap-4 w-full'>
                  <img src="/chatbot.svg" alt="chat2" width={21} height={21} className='-mt-0.5'/>
                  <p className='font-semibold text-[17px]'>{bot.name}</p>
                </div>
                {
                  isDropDown[bot.id] ? 
                  <img src="/drop-up.svg" alt="dropdown" width={25} height={25}/>
                  :
                  <img src="/dropdown.svg" alt="dropdown" width={25} height={25} className='mt-1'/>
                }
                  
              </div>
              {
                isDropDown[bot.id] &&
                <div className='flex flex-col gap-5 w-full items-center mt-3'>
                  <Link 
                    to={`/chats/${bot.id}`} 
                    className={`flex items-center p-2 gap-4 w-[75%] -mt-4 rounded-xl ${isClicked[bot.id] === "1" ? "bg-[#e1faed]" : ""}`} 
                    onClick={() => setClicked(prev => ({ ...prev, [bot.id]: "1" }))}
                  >
                    {isClicked[bot.id] === "1"
                      ? <><img src="/chat-green.svg" alt="chatbot-green" width={20} height={20}/><p className='font-semibold text-md text-[#27bb88]'>Chats</p></>
                      : <><img src="/chat2.svg" alt="chatbot" width={20} height={20}/><p className='font-semibold text-md'>Chats</p></>
                    }
                  </Link>

                  <Link 
                    to={`/chatbots/${bot.id}`} 
                    className={`flex items-center p-2 gap-4 w-[75%] -mt-4 rounded-xl ${isClicked[bot.id] === "2" ? "bg-[#e1faed]" : ""}`} 
                    onClick={() => setClicked(prev => ({ ...prev, [bot.id]: "2" }))}
                  >
                    {isClicked[bot.id] === "2"
                      ? <><img src="/my-bot-green.svg" alt="chatbot-green" width={20} height={20}/><p className='font-semibold text-md text-[#27bb88]'>Manage Bot</p></>
                      : <><img src="/my-bot.svg" alt="chatbot" width={20} height={20}/><p className='font-semibold text-md'>Manage Bot</p></>
                    }
                  </Link>

                  <Link 
                    to={`/documents/${bot.id}`} 
                    className={`flex items-center p-2 gap-4 w-[75%] -mt-4 rounded-xl ${isClicked[bot.id] === "3" ? "bg-[#e1faed]" : ""}`} 
                    onClick={() => setClicked(prev => ({ ...prev, [bot.id]: "3" }))}
                  >
                    {isClicked[bot.id] === "3"
                      ? <><img src="/document-green.svg" alt="document-green" width={20} height={20}/><p className='font-semibold text-md text-[#27bb88]'>Documents</p></>
                      : <><img src="/document.svg" alt="document" width={20} height={20}/><p className='font-semibold text-md'>Documents</p></>
                    }
                  </Link>
                </div>
              }
          </React.Fragment>
        ))}

      </div>


          <div className='flex justify-center items-center gap-7 w-full h-20 border-t-2 border-[#d9d9d9] mt-auto'>
            <div className='flex items-center gap-4'>
              <div className='flex justify-center items-center w-10 h-10 rounded-full bg-[#e1faed] shadow-sm'>
                <p className='text-[#27bb88] text-md font-bold'>{FirstLetter(name)}</p>
              </div>
              <div className='flex flex-col w-40'>
                <p className='font-semibold text-[16px]'>{name}</p>
                <p className='text-[14px]'>{email}</p>
              </div>
            </div>
            <img src="/logout.svg" alt="logout" width={22} height={22} className='hover:cursor-pointer' onClick={handleLogout}/>
          </div>
        </div>
    </div>
  )
}
