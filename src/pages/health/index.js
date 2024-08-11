import React, { useState, useRef, useEffect } from 'react';
import { MdOutlineChat } from 'react-icons/md';
import { FaWindowClose } from 'react-icons/fa';
import axios from 'axios';

const Health = ({ toggleChat = () => {} }) => {
  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationObject, setConversationObject] = useState(null);

  // Popup ref
  const chatRef = useRef(null);

  // Handler for opening/closing the popup
  const handleInput = (e) => {
    setMessageInput(e.target.value);
  };

  const handleChatInput = async () => {
    const message = messageInput;
    if (messageInput === '') return;

    setLoading(true);
    try {
      const apiResponse = await axios.post('/api/message', {
        message,
        conversation: conversationObject
      });

      const apiData = apiResponse?.data;
      if (apiResponse.status === 403) {
        updateChatHistory(apiData?.text);
        return;
      }

      updateChatHistory(apiData?.data || apiData?.text);
      setMessageInput('');
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
    }
  };

  const updateChatHistory = (message) => {
    const formattedMessage = message.replace(/```html/g, '').replace(/```/g, '').trim();
    const newHistory = [
      ...chatHistory,
      { role: 'user', parts: [messageInput] },
      { role: 'model', parts: [formattedMessage] }
    ];
    setChatHistory(newHistory);
    setLoading(false);
  };

  const initializeChatbot = async () => {
    setLoading(true);
    try {
      const apiResponse = await axios.post('/api/message', {
        message: '',
        conversation: null
      });

      setChatHistory([
        { role: 'model', parts: ['Hi, I am Incity. How can I help you?'] }
      ]);
      setConversationObject(apiResponse.data.conversation);
    } catch (error) {
      console.error("Error initializing chatbot:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeChatbot();
  }, []);

  // Function to format response
  const formatResponse = (response) => {
    const causes = Array.isArray(response.causes) ? response.causes : [];
    const actions = Array.isArray(response.actions) ? response.actions : [];

    return (
      <>
        <div className='font-bold text-lg'>Health Concern:</div>
        <div className='mt-1 mb-2'>{response.concern || 'N/A'}</div>
        <div className='font-bold text-lg'>Potential Causes:</div>
        <ul className='list-disc ml-5'>
          {causes.length > 0 ? (
            causes.map((cause, index) => (
              <li key={index}>{cause}</li>
            ))
          ) : (
            <li>No potential causes available.</li>
          )}
        </ul>
        <div className='font-bold text-lg'>Recommended Actions:</div>
        <ul className='list-disc ml-5'>
          {actions.length > 0 ? (
            actions.map((action, index) => (
              <li key={index}>{action}</li>
            ))
          ) : (
            <li>No recommended actions available.</li>
          )}
        </ul>
      </>
    );
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center z-20'>
      <div
        className='fixed inset-0 bg-gray-900 bg-opacity-75 z-5'
        onClick={() => { toggleChat(); }}
      />
      <div ref={chatRef} className='fixed w-[32rem] h-[40rem] backdrop-blur-lg border bg-zinc-900/500 border-zinc-600 p-4 rounded-lg shadow-md z-70 font-Mono'>
       
        <div className='flex flex-col gap-2 h-full overflow-y-auto'>
          {chatHistory.map((message, index) => (
            <div key={message.role + index} className={`text-xl ${message.role === 'user' ? 'text-fuchsia-500' : 'text-cyan-300'} snap-end`}>
              {`${message.role === 'user' ? 'You' : 'Incity'}: ${message.parts}`}
            </div>
          ))}
          {loading && <div className='text-center'>Loading...</div>}
        </div>
        <div className='flex items-center justify-between'>
          <input
            disabled={loading}
            className='w-full border border-gray-300 px-3 py-2 text-gray-700 rounded-md mt-4 focus:outline-none'
            placeholder='Type your message'
            onKeyDown={(e) => (e.key === 'Enter' ? handleChatInput() : null)}
            onChange={handleInput}
            value={messageInput}
          />
          <button
            className={`bg-[rgba(29,71,253,1)] px-4 py-2 text-white rounded-md shadow-md hover:bg-[#1d46fdd5] disabled:bg-slate-500 focus:outline-none ml-4`}
            disabled={messageInput === '' || loading}
            onClick={() => handleChatInput()}
          >
            <MdOutlineChat size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Health;
