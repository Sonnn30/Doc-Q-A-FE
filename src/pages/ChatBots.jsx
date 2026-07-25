import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import axiosInstance from '../axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

export default function ChatBots() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("");
  const [chatbotdata, setChatbotData] = useState(null)
  const [isEdit, setEdit] = useState(false)
  const [isDelete, setDelete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // NEW: guard supaya handleSubmit tidak bisa dipanggil dobel (double click/tap)
  const { chatbotId } = useParams()
  const navigate = useNavigate()

  const isLocalChatbot = !chatbotId || chatbotId?.startsWith("local-") || chatbotId === "default"

  useEffect(() => {
    setChatbotData(null)
    setName("")
    setPrompt("")
    setModel("")
    setEdit(false)

    if (isLocalChatbot) return

    axiosInstance.get(`/api/get-chatbot-by-id/${chatbotId}`)
      .then(res => {
        if (res.data === null) {
          toast.info("Please input information about your chatbot")
        }
        setChatbotData(res.data)
      })
      .catch(err => {
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
    // NEW: kalau masih dalam proses submit sebelumnya, abaikan klik/tap berikutnya
    if (isSubmitting) return
    setIsSubmitting(true)

    axiosInstance.post("/api/createBot", chatbot_information)
      .then((res) => {
        const new_id = res.data.id
        return axiosInstance.post(`/api/chat/${new_id}`)
          .then(() => {
            toast.success("Chatbot created successfully!")
            setChatbotData(res.data)
            window.dispatchEvent(new Event("chatbot-updated"))
            navigate(`/chatbots/${new_id}`)
          })
      })
      .catch(error => {
        const detail = error.response?.data?.detail
        const message = Array.isArray(detail) ? detail[0]?.msg : detail
        toast.error(message ?? "Something went wrong, please try again")
      })
      .finally(() => setIsSubmitting(false)) // NEW: reset guard baik sukses maupun gagal
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
      .then(() => {
        toast.success("Chatbot deleted successfully")
        window.dispatchEvent(new Event("chatbot-updated"))
        return axiosInstance.get("/api/get-chatbot-by-user_id")
      })
      .then((res) => {
        const remaining = res.data
        if (remaining && remaining.length > 0) {
          const latest = remaining[remaining.length - 1]
          navigate(`/chats/${latest.id}`)
        } else {
          navigate("/")
        }
      })
      .catch(() => {
        toast.error("Failed to delete Chatbot")
      })
  }

  // Komponen model card supaya tidak duplikasi JSX
  const ModelCard = ({ modelName, description, selectedModel, onClick }) => {
    const isSelected = selectedModel === modelName
    return (
      // RESPONSIVE: flex-col di mobile, side-by-side tetap dihandle parent
      <div className='flex gap-2 hover:cursor-pointer w-full' onClick={onClick}>
        <div className={`flex py-3 px-3 gap-3 w-full h-full border-2 rounded-xl ${isSelected ? "border-[#27bb88] bg-[#e1faef]" : "border-[#d9d9d9]"}`}>
          <div className={`flex justify-center items-center w-5 h-5 shrink-0 rounded-full ${isSelected ? "bg-[#27bb88]" : "border-2 border-[#d9d9d9]"}`}>
            {isSelected && <div className='w-2 h-2 shrink-0 bg-white rounded-full'/>}
          </div>
          <div className='flex flex-col gap-3 -mt-1'>
            {/* RESPONSIVE: ukuran font model card lebih kecil di mobile */}
            <p className='font-semibold text-[#5a5959] text-[16px] sm:text-[20px]'>{modelName}</p>
            <p className='text-[#343434] text-[14px] sm:text-[18px]'>{description}</p>
          </div>
        </div>
      </div>
    )
  }

  const QWEN_DESC = "A high-capacity transformer model featuring a 20 Billion (20B) parameter architecture designed for deep analytical workloads. Engineered specifically for complex, multi-step reasoning and precise instruction following, it excels at structured data extraction, comprehensive text synthesis, and advanced logic parsing. This model offers an optimal balance between massive context handling and computational accuracy, making it the ideal choice for auditing dense legal frameworks, parsing intricate technical documentation, and executing nuanced semantic searches across large document repositories"
  const LLAMA_DESC = "Powered by Meta's state-of-the-art Llama 3.1 8B architecture, this model is highly optimized for rapid, real-time inference. It boasts an expansive 128K token context window, allowing it to digest and process entire multi-page documents within a single prompt. By utilizing Grouped-Query Attention (GQA), it achieves ultra-low latency and maximum memory efficiency. This makes it exceptionally well-suited for high-throughput Retrieval-Augmented Generation (RAG) pipelines, interactive document Q&A, and fast-streaming conversational interfaces"

  // Tampilan saat chatbot masih local/default
  if (isLocalChatbot) {
    return (
      <div className='relative flex flex-col gap-6'>
        {/* RESPONSIVE: padding header lebih kecil di mobile */}
        <div className='flex justify-between w-full p-4 sm:p-7 border-b-2 border-t-2 border-[#d9d9d9]'>
          <div className='flex flex-col gap-1'>
            <h2 className='font-bold'>General Information</h2>
            <p className='font-semibold text-gray-500 text-sm sm:text-base'>Add general information about your chatbot.</p>
          </div>
        </div>
        {/* RESPONSIVE: padding horizontal lebih kecil di mobile */}
        <div className='flex gap-8 px-4 sm:px-7'>
          <div className='w-full flex flex-col gap-2'>
            <p className='font-bold text-[#5a5959] text-lg sm:text-xl'>Name</p>
            <input type="text" value={name} className='w-full h-10 border-2 border-[#d9d9d9] p-3 rounded-lg' onChange={(e) => setName(e.target.value)}/>
          </div>
        </div>
        <div className='flex flex-col px-4 sm:px-7 gap-2'>
          <p className='text-[#5a5959] font-bold text-lg sm:text-xl'>Prompt</p>
          <textarea value={prompt} className='w-full h-60 border-2 border-[#d9d9d9] p-2 rounded-lg' onChange={(e) => setPrompt(e.target.value)}/>
        </div>
        <div className='px-4 sm:px-7 -mb-2'>
          <p className='font-bold text-[#5a5959] text-lg sm:text-xl'>AI Model</p>
        </div>
        {/* RESPONSIVE: breakpoint lg agar di 600-900px card tetap vertikal */}
        <div className='flex flex-col lg:flex-row gap-3 px-4 sm:px-7'>
          <ModelCard
            modelName="Openai/gpt-oss-20b"
            description={QWEN_DESC}
            selectedModel={model}
            onClick={() => setModel(model === "Openai/gpt-oss-20b" ? null : "Openai/gpt-oss-20b")}
          />
          <ModelCard
            modelName="llama-3.1-8b-instant"
            description={LLAMA_DESC}
            selectedModel={model}
            onClick={() => setModel(model === "llama-3.1-8b-instant" ? null : "llama-3.1-8b-instant")}
          />
        </div>
        {/* RESPONSIVE: center di mobile, end di desktop */}
        <div className='flex justify-center sm:justify-end px-4 sm:pr-10 sm:px-0 pt-5 pb-4'>
          {/* NEW: disabled + label berubah selama isSubmitting, mencegah klik ganda */}
          <button
            className='flex justify-center items-center w-35 h-10 bg-[#27bb88] rounded-md text-[15px] text-white font-semibold hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create chatbot"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='relative flex flex-col gap-6'>
      {/* RESPONSIVE: padding header lebih kecil di mobile */}
      {/* RESPONSIVE: items-start agar icon edit sejajar dengan judul, bukan vertikal center */}
      <div className='flex justify-between items-start w-full p-4 sm:p-7 border-b-2 border-t-2 border-[#d9d9d9]'>
        <div className='flex flex-col gap-1'>
          <h2 className='font-bold text-lg sm:text-xl'>General Information</h2>
          <p className='font-semibold text-gray-500 text-sm sm:text-base'>Add general information about your chatbot.</p>
        </div>
        {chatbotdata != null &&
          <img src="/edit.svg" alt="edit" width={20} height={20} className='hover:cursor-pointer shrink-0 mt-1 ml-3' onClick={() => setEdit(!isEdit)}/>
        }
      </div>
      {/* RESPONSIVE: padding horizontal lebih kecil di mobile */}
      <div className='flex gap-8 px-4 sm:px-7'>
        <div className='w-full flex flex-col gap-2'>
          <p className='font-bold text-[#5a5959] text-lg sm:text-xl'>Name</p>
          {chatbotdata != null && !isEdit
            ?
            <p className='flex items-center text-md font-semibold w-full h-10 border-2 border-[#d9d9d9] p-3 rounded-lg'>{chatbotdata.name}</p>
            :
            <input type="text" value={name} className='w-full h-10 border-2 border-[#d9d9d9] p-3 rounded-lg' onChange={(e) => setName(e.target.value)}/>
          }
        </div>
      </div>
      <div className='flex flex-col px-4 sm:px-7 gap-2'>
        <p className='text-[#5a5959] font-bold text-lg sm:text-xl'>Prompt</p>
        <div>
          {chatbotdata != null && !isEdit
            ?
            <p className='w-full h-60 border-2 border-[#d9d9d9] p-2 rounded-lg text-md font-semibold'>{chatbotdata.prompt}</p>
            :
            <textarea name="desc" id="desc" value={prompt} className='w-full h-60 border-2 border-[#d9d9d9] p-2 rounded-lg' onChange={(e) => setPrompt(e.target.value)}/>
          }
        </div>
      </div>
      <div className='px-4 sm:px-7 -mb-2'>
        <p className='font-bold text-[#5a5959] text-lg sm:text-xl'>AI Model</p>
      </div>
      {/* RESPONSIVE: breakpoint lg agar di 600-900px card tetap vertikal */}
      <div className='flex flex-col lg:flex-row gap-3 px-4 sm:px-7'>
        {chatbotdata != null && !isEdit
          ?
          <>
            <ModelCard modelName="Openai/gpt-oss-20b" description={QWEN_DESC} selectedModel={chatbotdata.model} onClick={() => {}}/>
            <ModelCard modelName="llama-3.1-8b-instant" description={LLAMA_DESC} selectedModel={chatbotdata.model} onClick={() => {}}/>
          </>
          :
          <>
            <ModelCard
              modelName="Openai/gpt-oss-20b"
              description={QWEN_DESC}
              selectedModel={model}
              onClick={() => setModel(model === "Openai/gpt-oss-20b" ? null : "Openai/gpt-oss-20b")}
            />
            <ModelCard
              modelName="llama-3.1-8b-instant"
              description={LLAMA_DESC}
              selectedModel={model}
              onClick={() => setModel(model === "llama-3.1-8b-instant" ? null : "llama-3.1-8b-instant")}
            />
          </>
        }
      </div>
      {/* RESPONSIVE: center di mobile, end di desktop */}
      <div className='flex justify-center sm:justify-end px-4 sm:pr-10 sm:px-0 pt-7 pb-4'>
        {chatbotdata == null
          ? (
            // NEW: disabled + label berubah selama isSubmitting, mencegah klik ganda
            <button
              className='flex justify-center items-center w-35 h-10 bg-[#27bb88] rounded-md text-[15px] text-white font-semibold hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create chatbot"}
            </button>
          )
          : isEdit && (
            // RESPONSIVE: tombol action center di mobile, wrap jika sempit
            <div className='flex flex-wrap justify-center sm:justify-end gap-2'>
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
      {/* RESPONSIVE: modal fixed + overlay agar tidak bentrok dengan konten di bawah */}
      {isDelete &&
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
          <div className='flex flex-col gap-6 sm:gap-9 justify-center items-center w-full max-w-[420px] sm:max-w-[600px] h-auto bg-white border-2 border-red-300 shadow-xl rounded-2xl py-7 sm:py-10 px-5 sm:px-8'>
            <div className='flex justify-center items-center bg-red-100 w-16 h-16 sm:w-18 sm:h-18 rounded-xl'>
              <img src="/delete.svg" alt="delete" width={36} height={36}/>
            </div>
            <div className='flex flex-col items-center justify-center gap-1'>
              <p className='font-semibold text-xl sm:text-2xl'>Delete</p>
              <p className='text-center text-sm sm:text-base'>Are you sure want to delete?<br /><span className='font-bold'>once you delete all the document and chat will be deleted too</span></p>
            </div>
            {/* RESPONSIVE: tombol flex-1 di mobile agar bagi rata, fixed-width di desktop */}
            <div className='flex justify-center items-center gap-3 w-full sm:w-auto'>
              <button className='flex-1 sm:flex-none sm:w-42 h-10 sm:h-11 bg-red-400 rounded-xl font-semibold text-white hover:cursor-pointer shadow-lg text-sm sm:text-base' onClick={handleDelete}>
                Confirm
              </button>
              <button className='flex-1 sm:flex-none sm:w-42 h-10 sm:h-11 bg-gray-200 rounded-xl font-semibold hover:cursor-pointer shadow-lg text-sm sm:text-base' onClick={() => setDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  )
}