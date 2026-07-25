import React, { useEffect, useRef, useState } from 'react'
import axiosInstance from '../axiosInstance'
import { toast } from 'sonner'
import { useParams } from 'react-router-dom'

export default function Documents() {
  const [isUpload, setIsUpload] = useState(true)
  const [checkedDocs, setCheckedDocs] = useState(new Set())
  const [documents, setDocuments] = useState([])
  const [more, setMore] = useState(null)
  const [preview, setPreview] = useState(false)      
  const [previewData, setPreviewData] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allDocuments, setAllDocuments] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(10)
  const fileUpload = useRef(null)
  const { chatbotId } = useParams()

  const isLocalChatbot = !chatbotId || chatbotId?.startsWith("local-") || chatbotId === "default"

  const handleFileUpload = () => {
    fileUpload.current.click()
  }

  const fetchDocuments = (page = 1, customLimit = limit) => {
    axiosInstance.get(`/api/get-document/${chatbotId}?page=${page}&limit=${customLimit}`)
      .then(res => {
        setDocuments(res.data.data)
        setAllDocuments(res.data.data)
        setTotalPages(res.data.total_pages)
        setCurrentPage(res.data.current_page)
        setIsUpload(res.data.data.length > 0)

        const selectedIds = res.data.data
          .filter(doc => doc.selected)
          .map(doc => doc.id)
        setCheckedDocs(new Set(selectedIds))
      })
      .catch(err => {
        toast.info("Please add document")
        setIsUpload(false)
      })
  }

  useEffect(() => {
    if (isLocalChatbot) return
    fetchDocuments()
  }, [chatbotId])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setDocuments(allDocuments)
      return
    }

    const timeout = setTimeout(() => {
      axiosInstance.post(`/api/get-document-by-name/${chatbotId}?page=${currentPage}&limit=${limit}`, { judul: searchQuery })
        .then(res => {
          setDocuments(res.data.data)
          setTotalPages(res.data.total_pages)
          setCurrentPage(res.data.current_page)
        })
        .catch(err => {
          setDocuments([])
        })
    }, 400)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  const handlePageChange = (page) => {
    if (searchQuery.trim() === '') {
      fetchDocuments(page)
    } else {
      axiosInstance.post(`/api/get-document-by-name/${chatbotId}?page=${page}&limit=${limit}`, { judul: searchQuery })
        .then(res => {
          setDocuments(res.data.data)
          setTotalPages(res.data.total_pages)
          setCurrentPage(res.data.current_page)
        })
        .catch(err => {
          setDocuments([])
        })
    }
  }

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit)
    setCurrentPage(1)
    if (searchQuery.trim() === '') {
      fetchDocuments(1, newLimit)
    } else {
      axiosInstance.post(`/api/get-document-by-name/${chatbotId}?page=1&limit=${newLimit}`, { judul: searchQuery })
        .then(res => {
          setDocuments(res.data.data)
          setTotalPages(res.data.total_pages)
          setCurrentPage(res.data.current_page)
        })
    }
  }

  // NEW: state untuk melacak file yang sedang diupload beserta progressnya
  const [uploadingFile, setUploadingFile] = useState(null)

  const handleUpload = (file) => {
    const formData = new FormData()
    formData.append("file", file)

    // NEW: set state uploading agar item loading muncul di paling atas list
    setUploadingFile({ name: file.name, progress: 0 })

    axiosInstance.post(`/api/chatbot/${chatbotId}/upload-document`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      // NEW: pantau progress upload secara real-time untuk mengisi progress bar
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadingFile((prev) => prev ? { ...prev, progress: percent } : prev)
      }
    })
      .then(res => {
        toast.success("file uploaded")
        fetchDocuments()
      })
      .catch(err => {
        toast.error(err.response?.data?.detail ?? "Upload Failed")
      })
      .finally(() => {
        // NEW: bersihkan state uploading setelah selesai (sukses maupun gagal)
        setUploadingFile(null)
      })
  }

  const toggleCheck = (docId) => {
    const wasChecked = checkedDocs.has(docId)

    setCheckedDocs((prev) => {
      const updated = new Set(prev)
      wasChecked ? updated.delete(docId) : updated.add(docId)
      return updated
    })

    axiosInstance.post(`/api/is-document-selected/${docId}`)
      .catch(err => {
        toast.error("Failed to update document selection")
        setCheckedDocs((prev) => {
          const updated = new Set(prev)
          wasChecked ? updated.add(docId) : updated.delete(docId)
          return updated
        })
      })
  }

  const handlePreview = (docId, fileType) => {
    setPreviewLoading(true)
    setPreview(true)
    setMore(null)

    axiosInstance.get(`/api/get-document-by-id/${docId}`)
      .then(res => {
        setPreviewData({ url: res.data.docs_url, file_type: fileType })
      })
      .catch(err => {
        toast.error("Failed to load preview")
        setPreview(false)
      })
      .finally(() => {
        setPreviewLoading(false)
      })
  }

  const handleDelete = (docId) => {
    axiosInstance.delete(`/api/document-delete-by-id/${docId}`)
      .then(res => {
        setMore(null)
        fetchDocuments(currentPage)
      })
      .catch(err => {
        toast.error("Failed to delete document")
      })
  }

  const handleDownload = (docId, filename, fileType) => {
    axiosInstance.get(`/api/get-document-by-id/${docId}`)
      .then(res => {
        const url = res.data.docs_url
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.${fileType}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setMore(null)
      })
      .catch(err => {
        toast.error("Failed to download document")
      })
  }

  // Tampilan saat chatbot masih default
  if (isLocalChatbot) {
    return (
      <div className='relative flex flex-col gap-6 h-screen'>
        {/* RESPONSIVE: padding header lebih kecil di mobile */}
        <div className='flex justify-between items-center border-b-2 border-t-2 border-[#d9d9d9] p-4 sm:p-7'>
          <div className='flex flex-col gap-1'>
            <h2 className='font-bold text-lg sm:text-xl'>Add documents</h2>
            <p className='font-semibold text-gray-500 text-sm sm:text-base'>Your chatbot will answer questions based on these documents.</p>
          </div>
        </div>
        <div className='flex flex-col h-full justify-center items-center gap-3'>
          <img src="/docs.svg" alt="docs" width={150} height={150}/>
          <p className='text-center font-semibold text-gray-400 text-sm sm:text-base px-4'>
            Please set up your chatbot first<br />before adding documents
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='relative flex flex-col gap-6 h-screen'>
      {/* RESPONSIVE: padding header lebih kecil di mobile, tombol Add new document menyesuaikan */}
      <div className='flex justify-between items-center border-b-2 border-t-2 border-[#d9d9d9] p-4 sm:p-7 gap-3'>
        <div className='flex flex-col gap-1 min-w-0'>
          <h2 className='font-bold text-lg sm:text-xl'>Add documents</h2>
          {/* RESPONSIVE: subtitle disembunyikan di mobile sangat kecil agar tidak berdesakan */}
          <p className='font-semibold text-gray-500 text-sm sm:text-base hidden xs:block sm:block'>Your chatbot will answer questions based on these documents.</p>
        </div>
        {isUpload && 
          <>
            <input type="file" ref={fileUpload} className="hidden" accept='.pdf, .docx, .pptx, .xlsx' onChange={(e) => handleUpload(e.target.files[0])}/>
            {/* RESPONSIVE: tombol lebih ringkas di mobile */}
            <div
              className='flex justify-center items-center border-2 border-[#d9d9d9] shrink-0 h-9 rounded-lg shadow-md hover:cursor-pointer hover:bg-gray-100 px-2 sm:w-46 sm:px-0 gap-1'
              onClick={handleFileUpload}
            >
              <img src="/plus.svg" alt="plus" width={25} height={25}/>
              {/* RESPONSIVE: teks tombol disembunyikan di layar sangat kecil, hanya icon */}
              <p className='font-semibold text-[13px] sm:text-[15px] hidden sm:block'>Add new document</p>
            </div>
          </>
        }
      </div>
      {
        isUpload 
        ?
        <>
          {/* RESPONSIVE: search bar padding menyesuaikan */}
          <div className='relative flex w-full px-3'>
            <img src="/search.svg" alt="search" width={35} height={35} className='absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none'/>
            <input
              type="text"
              placeholder='Search documents...'
              className='border-2 border-[#d9d9d9] placeholder:text-sm sm:placeholder:text-lg pl-12 pr-3 text-sm sm:text-lg outline-none w-full h-11 rounded-md'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className='flex flex-col px-3'>
            {/* NEW: item loading untuk file yang sedang diupload, tampil di paling atas list */}
            {uploadingFile && (
              <div className='relative flex flex-col gap-1.5 px-3 sm:px-6 mb-2 rounded-lg py-2.5 bg-gray-50'>
                <div className='flex items-center gap-2.5 min-w-0'>
                  <div className='w-5 h-5 shrink-0 rounded-md border border-gray-300 bg-white flex items-center justify-center'>
                    <div className='w-2.5 h-2.5 border-2 border-[#27bb88] border-t-transparent rounded-full animate-spin'></div>
                  </div>
                  <p className='text-sm sm:text-md font-semibold truncate max-w-[200px] sm:max-w-none text-gray-600'>{uploadingFile.name}</p>
                  <span className='text-xs text-gray-400 shrink-0 ml-auto'>{uploadingFile.progress}%</span>
                </div>
                {/* Progress bar horizontal */}
                <div className='w-full h-1.5 bg-gray-200 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-[#27bb88] rounded-full transition-all duration-200 ease-out'
                    style={{ width: `${uploadingFile.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className={`relative flex items-center gap-2.5 px-3 sm:px-6 mb-2 rounded-lg h-11 justify-between ${checkedDocs.has(doc.id) ? "bg-[#e1faed]" : ""}`} 
                onClick={() => toggleCheck(doc.id)}
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <div className={`w-5 h-5 shrink-0 rounded-md border flex items-center justify-center ${checkedDocs.has(doc.id) ? "bg-[#27bb88] border-[#27bb88]" : "border-gray-400 bg-white"}`}>
                    {checkedDocs.has(doc.id) && (
                      <img src="/check.svg" alt="check" className="w-4 h-4"/>
                    )}
                  </div>
                  {/* RESPONSIVE: nama file terpotong dengan ellipsis agar tidak mendorong tombol more */}
                  <p className="text-sm sm:text-md font-semibold truncate max-w-[160px] sm:max-w-none">{doc.filename}.{doc.file_type}</p>
                </div>
                {more == "" || more != doc.id ? 
                  <img src="/more.svg" alt="more" width={20} height={20} className='hover:cursor-pointer absolute right-3 sm:right-6 z-10' onClick={(e) => { e.stopPropagation(); setMore(doc.id) }}/>
                : ""
                }
                {more == doc.id ? 
                  <div className='absolute right-3 sm:right-6 flex flex-col border bg-white w-35 h-27 rounded-lg z-50' onClick={(e) => e.stopPropagation()}>
                    <div className='flex items-center justify-between border-b px-2 h-9 hover:cursor-pointer' onClick={(e) => { e.stopPropagation(); handlePreview(doc.id, doc.file_type) }}>
                      <p>Preview</p>
                      <img src="/preview.svg" alt="preview" width={20} height={20}/>
                    </div>
                    <div className='flex items-center justify-between border-b px-2 h-9 hover:cursor-pointer' onClick={() => handleDownload(doc.id, doc.filename, doc.file_type)}>
                      <p>Download</p>
                      <img src="/download.svg" alt="preview" width={20} height={20}/>
                    </div>
                    <div className='flex items-center justify-between px-2 h-9 hover:cursor-pointer' onClick={() => handleDelete(doc.id)}>
                      <p className='text-red-600'>Delete</p>
                      <img src="/delete.svg" alt="preview" width={20} height={20}/>
                    </div>
                  </div>
                  : ""
                }
              </div>
            ))}
          </div>

          {documents.length > 0 && (
            // RESPONSIVE: pagination wrap di mobile, padding dikurangi
            <div className='flex flex-wrap justify-center sm:justify-end items-center gap-2 pt-10 sm:pt-25 pb-6 sm:pb-10 px-4 sm:px-10'>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className='block w-16 px-3 py-2 border border-[#d9d9d9] text-sm rounded-md focus:ring-[#27bb88] focus:border-[#27bb88]'
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={50}>50</option>
              </select>

              <input
                type="text"
                disabled
                className='bg-gray-100 w-28 sm:w-32 border border-[#d9d9d9] text-sm rounded-md px-2.5 py-2 text-gray-400 cursor-not-allowed'
                placeholder={`${currentPage} of ${totalPages} pages`}
              />

              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='inline-flex items-center justify-center w-9 h-9 border border-[#d9d9d9] rounded-l-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7"/>
                </svg>
              </button>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='inline-flex items-center justify-center w-9 h-9 border border-[#d9d9d9] rounded-r-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7"/>
                </svg>
              </button>
            </div>
          )}
        </>
        :
        <div className='flex flex-col h-full justify-center items-center gap-3 px-4'>
          <img src="/docs.svg" alt="docs" width={150} height={150}/>
          <p className='text-center font-semibold text-sm sm:text-base'>You haven't added any documents to<br />the knowledge base yet</p>
          <div>
            <label 
              htmlFor="file-upload" 
              className="flex items-center justify-center border border-[#d9d9d9] w-44 h-10 rounded-xl hover:cursor-pointer text-[#5a5959] text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-all"
            >
              Add document
            </label>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept=".pdf, .docx, .pptx, .xlsx"
              onChange={(e) => handleUpload(e.target.files[0])}
            />
          </div>
        </div>
      }
      {preview && 
        // RESPONSIVE: preview modal fixed, ukuran dibatasi agar tidak full layar di mobile
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6'>
          <div className='relative flex items-center justify-center w-[92vw] h-[75vh] sm:w-full sm:h-full sm:max-w-7xl sm:max-h-[95vh] bg-[#27bb88] border-4 rounded-3xl'>
            <img 
              src="/close2.svg" 
              alt="close" 
              width={20} 
              height={20} 
              className='absolute right-2.5 top-1 hover:cursor-pointer z-10' 
              onClick={() => {
                setPreview(false)
                setPreviewData(null)
              }}
            />
            <div className='flex items-center justify-center w-[96%] h-[94%] bg-white rounded-xl overflow-hidden'>
              {previewLoading ? (
                <p className='text-gray-500'>Loading preview...</p>
              ) : previewData ? (
                previewData.file_type === 'pdf' ? (
                  <iframe src={previewData.url} className="w-full h-full rounded-xl" title="preview"/>
                ) : previewData.file_type === 'xlsx' ? (
                  <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewData.url)}`} className="w-full h-full rounded-xl" title="preview"/>
                ) : (
                  <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewData.url)}&embedded=true`} className="w-full h-full rounded-xl" title="preview"/>
                )
              ) : (
                <p className='text-gray-500'>No preview available</p>
              )}
            </div>
          </div>
        </div>
      }
    </div>
  )
}