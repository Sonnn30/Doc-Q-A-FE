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
  const abortControllerRef = useRef(null)
  const typewriterIntervalRef = useRef(null)  // NEW: pindah ke ref
  const isLocalChatbot = !chatbotId || chatbotId?.startsWith("local-") || chatbotId === "default"

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }

  // NEW: cleanup semua side effect saat ganti chatbot
  const cleanupStream = () => {
    abortControllerRef.current?.abort()
    if (typewriterIntervalRef.current !== null) {
      clearInterval(typewriterIntervalRef.current)
      typewriterIntervalRef.current = null
    }
    setIsStreaming(false)
    setStreamingId(null)
  }

  useEffect(() => {
    cleanupStream()  // CHANGED: pakai cleanupStream

    if (isLocalChatbot) {
      setMessages([])
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

  const PLAIN_BOT_MESSAGES = ["Please upload document", "Please Select document"]

  const sendBotMessageStream = async () => {
    const botMessageId = `bot-${Date.now()}`
    const activeChatbotId = chatbotId  // NEW: capture chatbotId saat fungsi dipanggil

    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsStreaming(true)
    setStreamingId(botMessageId)

    setMessages((prev) => [
      ...prev,
      { id: botMessageId, message: "", sender: "bot", created_at: new Date().toISOString() }
    ])

    setTimeout(scrollToBottom, 0)

    try {
      const token = sessionStorage.getItem("access_token")

      const response = await fetch(`https://api.docuswift.online/api/message/${activeChatbotId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: "", sender: "bot" }),
        signal: controller.signal
      })

      if (!response.ok || !response.body) throw new Error("Stream response failed")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let buffer = ""
      let displayedText = ""
      let streamDone = false

      const CHARS_PER_TICK = 7
      const TICK_MS = 10

      const firstRead = await reader.read()
      if (firstRead.done) {
        streamDone = true
      } else {
        const firstChunk = decoder.decode(firstRead.value, { stream: true })
        if (PLAIN_BOT_MESSAGES.includes(firstChunk.trim())) {
          // NEW: cek apakah masih di chatbot yang sama sebelum update state
          if (chatbotId === activeChatbotId) {
            setMessages((prev) =>
              prev.map((m) => m.id === botMessageId ? { ...m, message: firstChunk.trim() } : m)
            )
            setTimeout(scrollToBottom, 50)
          }
          return
        }
        buffer += firstChunk
      }

      while (!streamDone) {
        const { done, value } = await reader.read()
        if (done) { streamDone = true; break }
        const chunkText = decoder.decode(value, { stream: true })
        if (chunkText) buffer += chunkText
      }

      // NEW: setelah stream selesai, cek dulu apakah user masih di chatbot yang sama
      if (chatbotId !== activeChatbotId) return

      await new Promise((resolve) => {
        typewriterIntervalRef.current = setInterval(() => {  // CHANGED: pakai ref
          // NEW: cek setiap tick apakah masih di chatbot yang sama
          if (chatbotId !== activeChatbotId) {
            clearInterval(typewriterIntervalRef.current)
            typewriterIntervalRef.current = null
            resolve()
            return
          }

          if (buffer.length === 0) {
            clearInterval(typewriterIntervalRef.current)
            typewriterIntervalRef.current = null
            resolve()
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
      })

    } catch (err) {
      if (err.name !== "AbortError") {
        toast.error("Gagal mendapat balasan bot")
        if (chatbotId === activeChatbotId) {  // NEW: hanya hapus message jika masih di chatbot yang sama
          setMessages((prev) => prev.filter((m) => m.id !== botMessageId))
        }
      }
    } finally {
      if (typewriterIntervalRef.current !== null) {  // CHANGED: pakai ref
        clearInterval(typewriterIntervalRef.current)
        typewriterIntervalRef.current = null
      }
      setIsStreaming(false)
      setStreamingId(null)
      setTimeout(scrollToBottom, 50)
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
        {/* RESPONSIVE: padding horizontal lebih kecil di mobile, lebih besar di desktop */}
        <div className='w-full max-w-[800px] flex flex-col gap-4 sm:gap-6 px-3 sm:px-4 pt-4 sm:pt-6 pb-36 sm:pb-32'>
          {isLocalChatbot ? (
            <div className='flex items-center justify-center h-40 text-gray-400 text-center px-4'>
              Please set up your chatbot information first before starting a chat.
            </div>
          ) : (
            messages.map((msg) =>
              msg.sender === "user" ? (
                <div key={msg.id} className='w-full flex justify-end'>
                  {/* RESPONSIVE: max-width lebih lebar di mobile agar tidak terlalu sempit */}
                  <div className='bg-[#27bb88] rounded-xl py-2.5 sm:py-3 px-4 sm:px-5 max-w-[85%] sm:max-w-[75%] min-w-0'>
                    <p className='text-white font-medium text-[14px] sm:text-[15px] break-words whitespace-pre-wrap m-0'>
                      {msg.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className='self-start w-full rounded-xl text-[14px] sm:text-[15px] prose prose-sm max-w-none -mt-6 sm:-mt-10 mb-4 sm:mb-8'>
                  {msg.message
                    ? (
                      <div className='px-3 sm:px-5 pt-3 sm:pt-4 rounded-xl'>
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

      {/* RESPONSIVE: input bar menyesuaikan lebar layar */}
      <div className='absolute bottom-0 left-0 w-full sm:w-[99%] bg-white flex justify-center py-3 sm:py-5 px-3 sm:px-0 border-t border-gray-100 sm:border-0'>
        <div className='w-full max-w-[680px] sm:px-4'>
          <div className='relative w-full flex items-end'>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isStreaming || isLocalChatbot}
              rows={1}
              className='border w-full rounded-2xl pt-4 sm:pt-3 pl-4 pr-14 py-[10px] bg-white disabled:opacity-60 outline-none focus:ring-2 focus:ring-[#27bb88]/40 resize-none overflow-hidden leading-[1.5] text-[14px] focus:border-0 placeholder:text-[11.3px] sm:placeholder:text-[15px]'
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