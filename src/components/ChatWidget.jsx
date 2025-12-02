import React, { useState } from 'react'
import UserChat from './UserChat'

const ChatWidget = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className={`fixed right-6 bottom-6 z-50`}>
        <div className={`transition-transform ${open ? 'translate-y-0' : 'translate-y-6'}`}>
          {open && (
            <div className="w-[540px] h-[560px] bg-white rounded-xl shadow-lg overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-b bg-white z-10">
                <div className="font-medium">Chat</div>
                <button onClick={() => setOpen(false)} className="text-gray-600">✕</button>
              </div>
              <div className="pt-14 h-[calc(100%-56px)]">
                <UserChat />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(o => !o)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl bg-gradient-to-br from-purple-500 to-indigo-400 text-white"
          aria-label="Open chat">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </>
  )
}

export default ChatWidget
