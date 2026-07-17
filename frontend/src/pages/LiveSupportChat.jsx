import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadChats, loadMessages, postMessage, initiateChat, setActiveChat } from '../store/slices/chatSlice';
import { useSocket } from '../context/SocketContext';
import { Search, Send, User, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Layout from '../components/Layout';

const LiveSupportChat = () => {
  const dispatch = useDispatch();
  const { chats, activeChat, messages, onlineUsers, typingUsers } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { emitTyping, emitSendMessage } = useSocket();

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [isTypingState, setIsTypingState] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    dispatch(loadChats());

    // Fetch real mentors/admins (students) the user can start a support thread with
    api.get('/chat/contacts')
      .then(res => {
        setUsersList(res.data.users?.filter(u => u._id !== user?.id) || []);
      })
      .catch(() => {
        toast.error('Could not load contacts');
        setUsersList([]);
      });
  }, [dispatch, user]);

  useEffect(() => {
    if (activeChat) {
      dispatch(loadMessages(activeChat._id));
    }
  }, [activeChat, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectChat = (chat) => {
    dispatch(setActiveChat(chat));
  };

  const handleInitiateChat = async (recipientId) => {
    const result = await dispatch(initiateChat(recipientId));
    if (initiateChat.fulfilled.match(result)) {
      toast.success('Connected to thread');
      dispatch(loadChats());
    } else {
      toast.error('Failed to open chat');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    const result = await dispatch(postMessage({
      chatId: activeChat._id,
      text: messageText
    }));

    if (postMessage.fulfilled.match(result)) {
      // Emit live message via socket
      emitSendMessage(activeChat._id, result.payload);
      setMessageText('');
      emitTyping(activeChat._id, false);
      setIsTypingState(false);
    } else {
      toast.error('Message failed to send');
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    
    // Manage typing indicators
    if (activeChat) {
      if (!isTypingState && e.target.value.length > 0) {
        setIsTypingState(true);
        emitTyping(activeChat._id, true);
      } else if (e.target.value.length === 0) {
        setIsTypingState(false);
        emitTyping(activeChat._id, false);
      }
    }
  };

  // Get recipient from chat
  const getRecipient = (chat) => {
    return chat.participants.find(p => p._id !== user?.id);
  };

  const activeRecipient = activeChat ? getRecipient(activeChat) : null;
  const isRecipientOnline = activeRecipient && onlineUsers.includes(activeRecipient._id);
  const isRecipientTyping = activeChat && typingUsers[activeChat._id]?.[activeRecipient?._id];

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto h-[calc(100vh-140px)]">
        
        {/* Chats Sidebar */}
        <div className="lg:col-span-1 glass-card p-5 rounded-3xl flex flex-col justify-between h-[300px] lg:h-full overflow-hidden">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <h3 className="font-bold text-sm tracking-tight text-slate-400 uppercase">Support Conversations</h3>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none"
              />
            </div>

            {/* Active Threads / Users list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Recent Chats</p>
              {chats.map(chat => {
                const recipient = getRecipient(chat);
                if (!recipient) return null;
                const isSelected = activeChat?._id === chat._id;
                
                return (
                  <div
                    key={chat._id}
                    onClick={() => handleSelectChat(chat)}
                    className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${isSelected ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/10' : 'bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900/40 border-slate-250/20 dark:border-slate-800/30'}`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-violet-600/10 text-violet-500 border border-violet-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                        {recipient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-xs truncate">{recipient.name}</h4>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                          {chat.lastMessage?.text || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <p className="text-[10px] font-bold text-slate-400 uppercase pt-2">All Mentors & Admins</p>
              {filteredUsers.map(u => (
                <div
                  key={u._id}
                  onClick={() => handleInitiateChat(u._id)}
                  className="p-3 bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900/40 border border-slate-250/20 dark:border-slate-800/30 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-violet-600/10 text-violet-500 flex items-center justify-center font-bold text-xs">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs leading-none">{u.name}</h4>
                      <span className="text-[9px] bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 capitalize mt-1 inline-block">{u.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-3 glass-card rounded-3xl flex flex-col justify-between overflow-hidden h-[400px] lg:h-full">
          {activeChat && activeRecipient ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-600/10 border border-violet-500/25 text-violet-600 flex items-center justify-center font-bold">
                    {activeRecipient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
                      {activeRecipient.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isRecipientOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      <span className="text-[10px] text-slate-400 font-light capitalize">
                        {isRecipientOnline ? 'Online' : 'Offline'} • {activeRecipient.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message History Thread */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map((msg) => {
                  const isMe = msg.sender?._id === user?.id;
                  return (
                    <div key={msg._id} className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                      <div className={`p-4 rounded-3xl text-xs leading-relaxed ${isMe ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/25 dark:border-slate-800/30'}`}>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                {isRecipientTyping && (
                  <div className="flex gap-3 mr-auto max-w-[80%]">
                    <div className="p-4 rounded-3xl rounded-tl-none bg-slate-100 dark:bg-slate-900 text-slate-400 text-xs flex items-center gap-1">
                      <span className="font-semibold text-slate-500">{activeRecipient.name} is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef}></div>
              </div>

              {/* Input box */}
              <div className="p-4 border-t border-slate-105 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                <form onSubmit={handleSend} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type support message..."
                    value={messageText}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-250/30 dark:border-slate-800/80 focus:border-violet-500 rounded-2xl text-xs outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-850 rounded-2xl text-white transition-all shadow-md shadow-violet-600/10"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-slate-400 text-xs flex flex-col items-center justify-center h-full">
              <MessageSquare size={36} className="text-slate-300 dark:text-slate-800 mb-3 animate-pulse" />
              <p className="max-w-xs font-light">Select a recent chat conversation or tap a mentor profile on the left side to start a live support thread.</p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default LiveSupportChat;
