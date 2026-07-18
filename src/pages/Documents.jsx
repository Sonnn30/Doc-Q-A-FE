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
  const fileUpload = useRef(null)
  const { chatbotId } = useParams()

  const handleFileUpload = () => {
    fileUpload.current.click()
  }

  const fetchDocuments = () => {
    axiosInstance.get(`/api/get-document/${chatbotId}`)
      .then(res => {
        setDocuments(res.data)
        setIsUpload(res.data.length > 0)

        const selectedIds = res.data
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
    fetchDocuments()
  }, [chatbotId])

  const handleUpload = (file) => {
    const formData = new FormData()
    formData.append("file", file)

    axiosInstance.post(`/api/chatbot/${chatbotId}/upload-document`, formData, {headers: { "Content-Type": "multipart/form-data" }})
     .then(res => {
      toast.success("file uploaded")
      fetchDocuments()
     })
     .catch(err =>{
      toast.error(err.response?.data?.detail ??"Upload Failed")
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
        // rollback kalau request gagal
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
      .then(res =>{
        setMore(null)
        fetchDocuments()

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


  return (
    <div className='relative flex flex-col gap-6 h-screen'>
      <div className='flex justify-between items-center border-b-2 border-t-2 border-[#d9d9d9] p-7'>
        <div className='flex flex-col gap-1 '>
          <h2 className='font-bold text-xl'>Add documents</h2>
          <p className='font-semibold text-gray-500'>Your chatbot will answer questions based on these documents.</p>
        </div>
        {isUpload && 
        <>
            <input type="file" ref={fileUpload} className="hidden" accept='.pdf, .docx, .pptx, .xlsx' onChange={(e) => handleUpload(e.target.files[0])}/>
            <div className='flex justify-center items-center border-2 border-[#d9d9d9] w-46 h-9 rounded-lg shadow-md hover:cursor-pointer hover:bg-gray-100' onClick={handleFileUpload}>
              <img src="/plus.svg" alt="plus" width={25} height={25}/>
              <p className='font-semibold text-[15px]'>Add new document</p>
            </div>
        </>
        }
      </div>
      {
        isUpload 
        ?
        <>
          <div className='relative flex w-full px-3'>
            <img src="/search.svg" alt="search" width={35} height={35} className='absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none'/>
            <input type="text" placeholder='Search documents...' className='border-2 border-[#d9d9d9] placeholder:text-lg pl-12 pr-3 text-lg outline-none w-full h-11 rounded-md'/>
          </div>

          <div className='flex flex-col px-3'>
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className={`relative flex items-center gap-2.5 px-6 mb-2 rounded-lg h-11 justify-between ${checkedDocs.has(doc.id) ? "bg-[#e1faed]" : ""}`} 
                onClick={() => toggleCheck(doc.id)}
              >
                <div className='flex items-center gap-2.5'>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${checkedDocs.has(doc.id) ? "bg-[#27bb88] border-[#27bb88]" : "border-gray-400 bg-white"}`}>
                    {checkedDocs.has(doc.id) && (
                      <img src="/check.svg" alt="check" className="w-4 h-4"/>
                    )}
                  </div>
                  <p className="text-md font-semibold">{doc.filename}.{doc.file_type}</p>
                </div>
                {more == "" || more != doc.id ? 
                  <img src="/more.svg" alt="more" width={20} height={20} className='hover:cursor-pointer absolute right-6 z-10' onClick={(e) => { e.stopPropagation(); setMore(doc.id) }}/>
                
                
                
                : ""
                
                
                }
                {more == doc.id ? 
                  <div className='absolute right-6 flex flex-col border bg-white w-35 h-27 rounded-lg z-50' onClick={(e) => e.stopPropagation()}>
                    <div className='flex items-center justify-between border-b px-2 h-9 hover:cursor-pointer' onClick={(e) => {e.stopPropagation();handlePreview(doc.id, doc.file_type)}}>
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
                  
                  
                  :""
                }

              </div>
            ))}
          </div>
        </>

        :
        <div className='flex flex-col h-full justify-center items-center gap-3'>
          <img src="/docs.svg" alt="docs" width={150} height={150}/>
          <p className='text-center font-semibold'>You haven't added any documents to<br />the knowledge base yet</p>
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
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7xl h-200 bg-[#27bb88] border-4 rounded-3xl'>
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
                    <iframe
                      src={previewData.url}
                      className="w-full h-full rounded-xl"
                      title="preview"
                    />
                  ) : previewData.file_type === 'xlsx' ? (
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewData.url)}`}
                      className="w-full h-full rounded-xl"
                      title="preview"
                    />
                  ) : (
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewData.url)}&embedded=true`}
                      className="w-full h-full rounded-xl"
                      title="preview"
                    />
                  )
            ) : (
              <p className='text-gray-500'>No preview available</p>
            )}
          </div>
        </div>      
      }
    </div>
  )
}
