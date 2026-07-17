import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import axios from 'axios'  
import axiosInstance from '../axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

export default function ChatBots() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("");
  const [chatbotdata, setChatbotData] = useState(null)
  const [isEdit, setEdit] = useState(false)
  const [isDelete, setDelete] = useState(false)
  const {chatbotId} = useParams()
  const navigate = useNavigate()

  useEffect(() =>{
      if (chatbotId?.startsWith("local-")) {
        toast.info("Please input information about your chatbot")
        return
      }
    axiosInstance.get(`/api/get-chatbot-by-id/${chatbotId}`)
      .then(res =>{
        if(res.data === null){
          toast.info("Please input information about your chatbot")
        }
        setChatbotData(res.data)
      })
      .catch(err =>{
        toast.error("Something Wrong")
      })
  }, [chatbotId])

  const chatbot_information = {
    "name": name,
    "prompt": prompt,
    "model": model
  }

  useEffect(() => {
    if (isEdit && chatbotdata) {
      setName(chatbotdata.name)
      setPrompt(chatbotdata.prompt)
      setModel(chatbotdata.model)
    }
  }, [isEdit])

  const handleSubmit = () => {
    axiosInstance.post("/api/createBot", chatbot_information)
      .then((res) => {
        const new_id = res.data.id

        return axiosInstance.post(`/api/chat/${new_id}`)
          .then(() => {
            toast.success("Chatbot created successfully!")
            navigate(`/chatbots/${new_id}`)
          })
      })
      .catch(error => {
        const detail = error.response?.data?.detail
        const message = Array.isArray(detail) ? detail[0]?.msg : detail
        toast.error(message ?? "Something went wrong, please try again")
      })
  }

  const handleSave = () => {
    axiosInstance.put(`/api/chatbot-update/${chatbotId}`, {
      name: name,
      prompt: prompt,
      model: model
    }).then(res => {
      toast.success("Chatbot updated successfully")
      setChatbotData(res.data)
      setEdit(false)
      window.dispatchEvent(new Event("chatbot-updated"))
    }).catch(err => {
        const detail = err.response?.data?.detail
        if (Array.isArray(detail)) {
          const message = detail.map(d => d.msg).join(", ")
          toast.error(message)
        } else {
          toast.error(detail ?? "Something Wrong!")
        }
      })
  }

  const handleDelete = () => {
    axiosInstance.delete(`/api/chatbot-delete/${chatbotId}`)
      .then(res => {
        toast.delete("Chatbot delete successfully")
        window.dispatchEvent(new Event("chatbot-updated"))
        navigate("/")
      })
      .catch(err => {
        toast.error("Failed delete Chatbot")
      })
  }
  

  return (
    <div className='relative flex flex-col gap-6'>
      <div className='flex justify-between w-full p-7 border-b-2 border-[#d9d9d9]'>
        <div className='flex flex-col gap-1'>
          <h2 className='font-bold text-xl'>General Information</h2>
          <p className='font-semibold text-gray-500'>Add general information about your chatbot.</p>
        </div>
        {chatbotdata != null 
        
          ? 
          <img src="/edit.svg" alt="edit" width={20} height={20} className='hover:cursor-pointer' onClick={() => setEdit(!isEdit)}/>
          : 
          <></>
        
        }

      </div>
      <div className='flex gap-8 px-7'>
        <div className='w-full flex flex-col gap-2'>
          <p className='font-bold text-[#5a5959] text-xl'>Name</p>
          {chatbotdata != null && !isEdit
            ? 
            
            <p className='flex items-center text-md font-semibold w-full h-10 border-2 border-[#d9d9d9] p-3 rounded-lg'>{chatbotdata.name}</p>
            
            : 
            
            <input type="text" value={name} className='w-full h-10 border-2 border-[#d9d9d9] p-3 rounded-lg' onChange={(e) => setName(e.target.value)}/>
            
          }
        </div>
      </div>
      <div className='flex flex-col px-7 gap-2'>
        <div className='flex gap-1'>
          <p className='text-[#5a5959] font-bold text-xl'>Prompt</p>
        </div>
        <div>
          {chatbotdata != null && !isEdit
          
            ? 
            <p className='w-full h-60 border-2 border-[#d9d9d9] p-2 rounded-lg text-md font-semibold'>{chatbotdata.prompt}</p>

            : 
            <textarea name="desc" id="desc" value={prompt} className='w-full h-60 border-2 border-[#d9d9d9] p-2 rounded-lg' onChange={(e) => setPrompt(e.target.value)}/>
            
          }
        </div>
      </div>
      <div className='px-7 -mb-2'>
        <p className='font-bold text-[#5a5959] text-xl'>AI Model</p>
      </div>
      <div className='flex gap-3 px-7'>
        {chatbotdata != null && !isEdit
        
          ? 
          <>
          
          <div className='flex gap-2'>

              {chatbotdata.model == "qwen/qwen3.6-27b" 
                ? 
                <div className='flex py-5 px-3 gap-3 w-[99%] h-[110%] border-2 border-[#27bb88] rounded-xl bg-[#e1faef]' >
                  <div className='flex justify-center items-center w-5 h-5 shrink-0 rounded-full bg-[#27bb88]'>
                    {/* buletan */}
                    <div className='w-2 h-2 shrink-0 bg-white rounded-full'>

                    </div>
                  </div>
                  <div className='flex flex-col gap-3 -mt-1'>
                    <p className='font-semibold text-[#5a5959] text-[20px]'>qwen/qwen3.6-27b</p>
                    <p className='text-[#343434] text-[20px]'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Inventore deleniti provident rerum natus itaque quod, explicabo aspernatur ducimus minus, facilis nesciunt maxime quasi fugit voluptatum corporis unde! Non beatae unde rem quidem doloremque amet expedita aliquid, quo labore rerum officia!</p>
                  </div>
                </div>
                :
                <div className='flex  py-5 px-3 gap-3 w-[99%] h-[110%] border-2 border-[#d9d9d9] rounded-xl'>
                  <div className='w-5 h-5 shrink-0 rounded-full border-2 border-[#d9d9d9] '>
                    {/* buletan */}
                  </div>
                  <div className='flex flex-col gap-3 -mt-1'>
                    <p className='font-semibold text-[#5a5959] text-[20px]'>qwen/qwen3.6-27b</p>
                    <p className='text-[#343434] text-[20px]'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Inventore deleniti provident rerum natus itaque quod, explicabo aspernatur ducimus minus, facilis nesciunt maxime quasi fugit voluptatum corporis unde! Non beatae unde rem quidem doloremque amet expedita aliquid, quo labore rerum officia!</p>
                  </div>
                </div>
              }
            </div>
            <div className='flex gap-2'>
              {chatbotdata.model == "llama-3.1-8b-instant"
                ?
                  <div className='flex py-5 px-3 gap-3 w-[99%] h-[110%] border-2 border-[#27bb88] rounded-xl bg-[#e1faef]'>
                    <div className='flex justify-center items-center w-5 h-5 shrink-0 rounded-full bg-[#27bb88]'>
                      {/* buletan */}
                      <div className='w-2 h-2 shrink-0 bg-white rounded-full'>

                      </div>
                    </div>
                    <div className='flex flex-col gap-3 -mt-1'>
                      <p className='font-semibold text-[#5a5959] text-[20px]'>llama-3.1-8b-instant</p>
                      <p className='text-[#343434] text-[20px]'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, dicta veritatis, esse commodi cumque animi voluptatibus, veniam eaque omnis consequuntur optio. Veritatis saepe sint molestias amet doloribus consequuntur. Quis ab ducimus, ratione quidem enim voluptatibus veritatis rerum neque a praesentium!</p>
                    </div>
                  </div>
                :
                <div className='flex py-5 px-3 gap-3 w-[99%] h-[110%] border-2 border-[#d9d9d9] rounded-xl'>
                  <div className='w-5 h-5 shrink-0 rounded-full border-2 border-[#d9d9d9] '>
                    {/* buletan */}
                  </div>
                  <div className='flex flex-col gap-3 -mt-1'>
                    <p className='font-semibold text-[#5a5959] text-[20px]'>llama-3.1-8b-instant</p>
                    <p className='text-[#343434] text-[20px]'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, dicta veritatis, esse commodi cumque animi voluptatibus, veniam eaque omnis consequuntur optio. Veritatis saepe sint molestias amet doloribus consequuntur. Quis ab ducimus, ratione quidem enim voluptatibus veritatis rerum neque a praesentium!</p>
                  </div>
                </div>
              }
            </div>
          </>
          
          : 

          <>
          
            <div className='flex gap-2 hover:cursor-pointer' onClick={() => setModel(model === "qwen/qwen3.6-27b" ? null : "qwen/qwen3.6-27b")}>

              {model == "qwen/qwen3.6-27b" 
                ? 
                <div className='flex py-5 px-3 gap-3 w-[99%] h-[110%] border-2 border-[#27bb88] rounded-xl bg-[#e1faef]' >
                  <div className='flex justify-center items-center w-5 h-5 shrink-0 rounded-full bg-[#27bb88]'>
                    {/* buletan */}
                    <div className='w-2 h-2 shrink-0 bg-white rounded-full'>

                    </div>
                  </div>
                  <div className='flex flex-col gap-3 -mt-1'>
                    <p className='font-semibold text-[#5a5959] text-[20px]'>qwen/qwen3.6-27b</p>
                    <p className='text-[#343434] text-[20px]'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Inventore deleniti provident rerum natus itaque quod, explicabo aspernatur ducimus minus, facilis nesciunt maxime quasi fugit voluptatum corporis unde! Non beatae unde rem quidem doloremque amet expedita aliquid, quo labore rerum officia!</p>
                  </div>
                </div>
                :
                <div className='flex  py-5 px-3 gap-3 w-[99%] h-[110%] border-2 border-[#d9d9d9] rounded-xl'>
                  <div className='w-5 h-5 shrink-0 rounded-full border-2 border-[#d9d9d9] '>
                    {/* buletan */}
                  </div>
                  <div className='flex flex-col gap-3 -mt-1'>
                    <p className='font-semibold text-[#5a5959] text-[20px]'>qwen/qwen3.6-27b</p>
                    <p className='text-[#343434] text-[20px]'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Inventore deleniti provident rerum natus itaque quod, explicabo aspernatur ducimus minus, facilis nesciunt maxime quasi fugit voluptatum corporis unde! Non beatae unde rem quidem doloremque amet expedita aliquid, quo labore rerum officia!</p>
                  </div>
                </div>
              }
            </div>
            <div className='flex gap-2 hover:cursor-pointer' onClick={() => setModel(model === "llama-3.1-8b-instant" ? null : "llama-3.1-8b-instant")}>
              {model == "llama-3.1-8b-instant"
                ?
                  <div className='flex py-5 px-3 gap-3 w-[99%] h-[110%] border-2 border-[#27bb88] rounded-xl bg-[#e1faef]'>
                    <div className='flex justify-center items-center w-5 h-5 shrink-0 rounded-full bg-[#27bb88]'>
                      {/* buletan */}
                      <div className='w-2 h-2 shrink-0 bg-white rounded-full'>

                      </div>
                    </div>
                    <div className='flex flex-col gap-3 -mt-1'>
                      <p className='font-semibold text-[#5a5959] text-[20px]'>llama-3.1-8b-instant</p>
                      <p className='text-[#343434] text-[20px]'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, dicta veritatis, esse commodi cumque animi voluptatibus, veniam eaque omnis consequuntur optio. Veritatis saepe sint molestias amet doloribus consequuntur. Quis ab ducimus, ratione quidem enim voluptatibus veritatis rerum neque a praesentium!</p>
                    </div>
                  </div>
                :
                <div className='flex py-5 px-3 gap-3 w-[99%] h-[110%] border-2 border-[#d9d9d9] rounded-xl'>
                  <div className='w-5 h-5 shrink-0 rounded-full border-2 border-[#d9d9d9] '>
                    {/* buletan */}
                  </div>
                  <div className='flex flex-col gap-3 -mt-1'>
                    <p className='font-semibold text-[#5a5959] text-[20px]'>llama-3.1-8b-instant</p>
                    <p className='text-[#343434] text-[20px]'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, dicta veritatis, esse commodi cumque animi voluptatibus, veniam eaque omnis consequuntur optio. Veritatis saepe sint molestias amet doloribus consequuntur. Quis ab ducimus, ratione quidem enim voluptatibus veritatis rerum neque a praesentium!</p>
                  </div>
                </div>
              }
            </div>
          
          </>
          
        }
      </div>
      <div className='flex justify-end pr-10 pt-7 pb-4'>
        {chatbotdata == null 
          ? (
            <button className='flex justify-center items-center w-35 h-10 bg-[#27bb88] rounded-md text-[15px] text-white font-semibold hover:cursor-pointer' onClick={handleSubmit}>
              Create chatbot
            </button>
          )
          : isEdit && (
            <div className='flex gap-2'>
              <button className='flex justify-center items-center w-30 h-10 border-2 rounded-md text-[15px] font-semibold hover:cursor-pointer' onClick={() => setEdit(false)}>
                Cancel
              </button>
              <button className='flex justify-center items-center w-30 h-10 bg-red-500 rounded-md text-[15px] text-white font-semibold hover:cursor-pointer' onClick={() => setDelete(true)}>
                Delete
              </button>
              <button className='flex justify-center items-center w-30 h-10 bg-[#27bb88] rounded-md text-[15px] text-white font-semibold hover:cursor-pointer' onClick={() => handleSave()}>
                Save
              </button>
            </div>
          )
        }
      </div>
      {isDelete && 
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-9 justify-center items-center w-150 h-100 bg-white border-2 border-red-300 shadow-xl rounded-2xl'>
          <div className='flex justify-center items-center bg-red-100 w-18 h-18 rounded-xl'>
            <img src="/delete.svg" alt="delete" width={40} height={40}/>
          </div>
          <div className='flex flex-col items-center justify-center gap-1'>
            <p className='font-semibold text-2xl'>Delete</p>
            <p className='text-center'>Are you sure want to delete?<br /><span className='font-bold'>once you delete all the document and chat will be deleted too</span></p>
          </div>
          <div className='flex justify-center items-center gap-4'>
            <button className='w-42 h-11 bg-red-400 rounded-xl font-semibold text-white hover:cursor-pointer shadow-lg' onClick={handleDelete}>
              Confirm
            </button>
            <button className='w-42 h-11 bg-gray-200 rounded-xl font-semibold hover:cursor-pointer shadow-lg' onClick={() => setDelete(false)}>
              Cancel
            </button>
          </div>
        </div>
      
      }
    </div>
  )
}
