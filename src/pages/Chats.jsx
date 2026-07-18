import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axiosInstance from '../axiosInstance'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Chats() {
  const { chatbotId } = useParams()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingId, setStreamingId] = useState(null)
  const scrollContainerRef = useRef(null)
  const textareaRef = useRef(null)
  const isLocalChatbot = !chatbotId || chatbotId?.startsWith("local-") || chatbotId === "default"

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (isLocalChatbot) {
      setMessages([])   // pastikan kosong, ga usah fetch apapun
      return
    }
    axiosInstance.get(`/api/get-message/${chatbotId}`)
      .then((res) => {
        setMessages(res.data)
        setTimeout(scrollToBottom, 50)
      })
      .catch(() => {
        toast.error("Gagal memuat riwayat chat")
      })
  }, [chatbotId])

  // Auto-resize textarea
  const handleInput = (e) => {
    setInputValue(e.target.value)
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxHeight = 160
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }

  const resetTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.overflowY = 'hidden'
    }
  }

  const sendBotMessageStream = async () => {
    const botMessageId = `bot-${Date.now()}`
    setIsStreaming(true)
    setStreamingId(botMessageId)

    setMessages((prev) => [
      ...prev,
      { id: botMessageId, message: "", sender: "bot", created_at: new Date().toISOString() }
    ])

    setTimeout(scrollToBottom, 0)

    try {
      const token = sessionStorage.getItem("access_token")

      const response = await fetch(`http://127.0.0.1:8000/api/message/${chatbotId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: "", sender: "bot" })
      })

      if (!response.ok || !response.body) throw new Error("Stream response failed")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let buffer = ""
      let displayedText = ""
      let streamDone = false

      const CHARS_PER_TICK = 7
      const TICK_MS = 10

      const typewriterInterval = setInterval(() => {
        if (buffer.length === 0) {
          if (streamDone) {
            clearInterval(typewriterInterval)
            setIsStreaming(false)
            setStreamingId(null)
            setTimeout(scrollToBottom, 50)
          }
          return
        }

        const slice = buffer.slice(0, CHARS_PER_TICK)
        buffer = buffer.slice(CHARS_PER_TICK)
        displayedText += slice

        setMessages((prev) =>
          prev.map((m) => m.id === botMessageId ? { ...m, message: displayedText } : m)
        )

        scrollToBottom()
      }, TICK_MS)

      while (true) {
        const { done, value } = await reader.read()
        if (done) { streamDone = true; break }
        const chunkText = decoder.decode(value, { stream: true })
        if (!chunkText) continue
        buffer += chunkText
      }

    } catch (err) {
      toast.error("Gagal mendapat balasan bot")
      setMessages((prev) => prev.filter((m) => m.id !== botMessageId))
      setIsStreaming(false)
      setStreamingId(null)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return

    if (isLocalChatbot) {
      toast.info("Please create the chatbot first before chatting")
      return
    }

    resetTextarea()
    const payload = { message: inputValue, sender: "user" }

    try {
      const res = await axiosInstance.post(`/api/message/${chatbotId}`, payload)
      setMessages((prev) => [...prev, res.data])
      setInputValue("")
      scrollToBottom()
      await sendBotMessageStream()
    } catch {
      toast.error("Gagal mengirim pesan")
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  return (
    <div className='relative flex flex-col h-screen w-full overflow-hidden'>

      <div
        ref={scrollContainerRef}
        className='absolute inset-0 overflow-y-auto flex flex-col items-center'
      >
        <div className='w-full max-w-[800px] flex flex-col gap-6 px-4 pt-6 pb-32'>
          {isLocalChatbot ? (
            <div className='flex items-center justify-center h-40 text-gray-400 text-center'>
              Please set up your chatbot information first before starting a chat.
            </div>
          ) : (
            messages.map((msg) =>
              msg.sender === "user" ? (
                <div key={msg.id} className='w-full flex justify-end'>
                  <div className='bg-[#27bb88] rounded-xl py-3 px-5 max-w-[75%] min-w-0'>
                    <p className='text-white font-medium text-[15px] break-words whitespace-pre-wrap m-0'>
                      {msg.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className='self-start w-full rounded-xl text-[15px] prose prose-sm max-w-none -mt-10 mb-8'>
                  {msg.message
                    ? (
                      <div className='px-5 pt-4 rounded-xl'>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.message}
                        </ReactMarkdown>
                      </div>
                    ) : streamingId === msg.id
                      ? <span className='text-gray-400 text-xl animate-pulse'>▍</span>
                      : null
                  }
                </div>
              )
            )
          )}
        </div>
      </div>

      <div className='absolute bottom-0 left-0 w-[99%] bg-white flex justify-center py-5'>
        <div className='w-full max-w-[680px] px-4'>
          <div className='relative w-full flex items-end'>

            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={(e) => {
                // Enter = kirim, Shift+Enter = newline
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isStreaming || isLocalChatbot}
              rows={1}
              className='border w-full rounded-2xl pl-4 pr-14 py-[10px] bg-white disabled:opacity-60 outline-none focus:ring-2 focus:ring-[#27bb88]/40 resize-none overflow-hidden leading-[1.5] text-[14px] focus:border-0'
              style={{ minHeight: '44px', maxHeight: '160px' }}
              placeholder={isLocalChatbot ? 'Set up your chatbot first before chatting' : 'Ask anything about your documents'}
            />

            <div
              className={`absolute right-3 bottom-[4px] flex justify-center items-center bg-[#27bb88] w-9 h-9 rounded-full transition-opacity flex-shrink-0 ${isStreaming || isLocalChatbot ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
              onClick={handleSend}
            >
              <img src="/send.svg" alt="send" width={18} height={18} />
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}