import React from 'react'

export default function Documents() {
  return (
    <div className='flex flex-col gap-6 h-screen'>
      <div className='flex justify-between items-center border-b-2 border-[#d9d9d9] p-7'>
        <div className='flex flex-col gap-1 '>
          <h2 className='font-bold text-xl'>Add documents</h2>
          <p className='font-semibold text-gray-500'>Your chatbot will answer questions based on these documents.</p>
        </div>
        <div className='flex justify-center items-center border-2 border-[#d9d9d9] w-34 h-7 rounded-lg shadow-md hover:cursor-pointer hover:bg-gray-100'>
          <img src="/plus.svg" alt="plus" width={20} height={20}/>
          <p className='font-semibold text-[11px]'>Add new document</p>
        </div>
      </div>
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
              accept=".pdf, .docx, .doc"
            />
        </div>
      </div>
    </div>
  )
}
