import React, { useState } from 'react'

export default function ChatBots() {
  const [isClicked, setClicked] = useState(null);

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-1 border-b-2 border-[#d9d9d9] p-7'>
        <h2 className='font-bold text-xl'>General Information</h2>
        <p className='font-semibold text-gray-500'>Add general information about your chatbot.</p>
      </div>
      <div className='flex gap-8 px-7'>
        <div className='flex flex-col gap-2'>
          <p className='font-bold text-[#5a5959]'>Avatar</p>
          <div className='p-5 bg-green-300 rounded-full w-10 h-10 flex justify-center items-center'>
            <p className='text-emerald-500 font-bold'>Y</p>
          </div>
        </div>
        <div className='w-full flex flex-col gap-2'>
          <p className='font-bold text-[#5a5959]'>Name</p>
          <input type="text" className='w-full h-10 border-2 border-[#d9d9d9] p-3 rounded-lg'/>
        </div>
      </div>
      <div className='flex flex-col px-7 gap-2'>
        <div className='flex gap-1'>
          <p className='text-[#5a5959] font-bold'>Prompt</p>
        </div>
        <div>
          <textarea name="desc" id="desc" className='w-full h-35 border-2 border-[#d9d9d9] p-2 rounded-lg'/>
        </div>
      </div>
      <div className='px-7 -mb-2'>
        <p className='font-bold text-[#5a5959]'>AI Model</p>
      </div>
      <div className='flex gap-3 px-7'>
        <div className='flex gap-2 hover:cursor-pointer' onClick={() => setClicked(isClicked === "1" ? null : "1")}>
          {isClicked == "1"
            ? 
            <div className='flex py-5 px-3 gap-3 w-145 border-2 border-[#27bb88] rounded-xl bg-[#e1faef]'>
              <div className='flex justify-center items-center w-22 h-5 rounded-full bg-[#27bb88]'>
                {/* buletan */}
                <div className='w-2 h-2 bg-white rounded-full'>

                </div>
              </div>
              <div className='flex flex-col gap-3 -mt-1'>
                <p className='font-semibold text-[#5a5959]'>GPT 4</p>
                <p className='text-[#343434]'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Inventore deleniti provident rerum natus itaque quod, explicabo aspernatur ducimus minus, facilis nesciunt maxime quasi fugit voluptatum corporis unde! Non beatae unde rem quidem doloremque amet expedita aliquid, quo labore rerum officia!</p>
              </div>
            </div>
            :
            <div className='flex  py-5 px-3 gap-3 w-145 border-2 border-[#d9d9d9] rounded-xl'>
              <div className='w-20 h-5 rounded-full border-2 border-[#d9d9d9] '>
                {/* buletan */}
              </div>
              <div className='flex flex-col gap-3 -mt-1'>
                <p className='font-semibold text-[#5a5959]'>GPT 4</p>
                <p className='text-[#343434]'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Inventore deleniti provident rerum natus itaque quod, explicabo aspernatur ducimus minus, facilis nesciunt maxime quasi fugit voluptatum corporis unde! Non beatae unde rem quidem doloremque amet expedita aliquid, quo labore rerum officia!</p>
              </div>
            </div>
          }
        </div>
        <div className='flex gap-2 hover:cursor-pointer' onClick={() => setClicked(isClicked === "2" ? null : "2")}>
          {isClicked == "2"
            ?
              <div className='flex py-5 px-3 gap-3 w-145 border-2 border-[#27bb88] rounded-xl bg-[#e1faef]'>
                <div className='flex justify-center items-center w-22 h-5 rounded-full bg-[#27bb88]'>
                  {/* buletan */}
                  <div className='w-2 h-2 bg-white rounded-full'>

                  </div>
                </div>
                <div className='flex flex-col gap-3 -mt-1'>
                  <p className='font-semibold text-[#5a5959]'>GPT 3.5</p>
                  <p className='text-[#343434]'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, dicta veritatis, esse commodi cumque animi voluptatibus, veniam eaque omnis consequuntur optio. Veritatis saepe sint molestias amet doloribus consequuntur. Quis ab ducimus, ratione quidem enim voluptatibus veritatis rerum neque a praesentium!</p>
                </div>
              </div>
            :
            <div className='flex py-5 px-3 gap-3 w-145 border-2 border-[#d9d9d9] rounded-xl'>
              <div className='w-20 h-5 rounded-full border-2 border-[#d9d9d9] '>
                {/* buletan */}
              </div>
              <div className='flex flex-col gap-3 -mt-1'>
                <p className='font-semibold text-[#5a5959]'>GPT 3.5</p>
                <p className='text-[#343434]'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, dicta veritatis, esse commodi cumque animi voluptatibus, veniam eaque omnis consequuntur optio. Veritatis saepe sint molestias amet doloribus consequuntur. Quis ab ducimus, ratione quidem enim voluptatibus veritatis rerum neque a praesentium!</p>
              </div>
            </div>
          }
        </div>

      </div>
      <div className='flex justify-end px-5 group'>
        <div className='flex justify-center items-center w-35 h-10 bg-[#27bb88] rounded-md group-hover:cursor-pointer'>
          <button className='text-[15px] text-white font-semibold group-hover:cursor-pointer'>Create chatbot</button>
        </div>
      </div>
    </div>
  )
}
