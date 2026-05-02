import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MoreVertical, Send, Paperclip, Smile, ArrowLeft, MessageSquare } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { fetchChatMessages, makeChatId, sendMessage, fetchProfilesByIds, type MessageRecord } from '../services/marketplaceService';
import { ChatListSkeleton } from '../components/Skeletons';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [chatMessages, setChatMessages] = useState<MessageRecord[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { name: string; avatar_url?: string | null; initials: string }>>({});
  const [chatList, setChatList] = useState<
    Array<{ id: string; peerId: string; lastMessage: string; unread: boolean; timestamp: string }>
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const queryChatId = searchParams.get('chatId') ?? '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const selectedChatId = useMemo(() => {
    if (queryChatId) return queryChatId;
    // On mobile, we don't auto-select the first chat if none is selected
    if (window.innerWidth < 1024) return '';
    return chatList[0]?.id ?? '';
  }, [queryChatId, chatList]);

  const selectedPeerId = useMemo(() => {
    if (!selectedChatId || !user?.id) return '';
    const participants = selectedChatId.split('_');
    return participants.find((id) => id !== user.id) ?? '';
  }, [selectedChatId, user?.id]);

  const filteredChatList = useMemo(() => {
    if (!searchQuery.trim()) return chatList;
    const query = searchQuery.toLowerCase();
    return chatList.filter(chat => {
      const profile = profiles[chat.peerId];
      const name = profile?.name?.toLowerCase() || '';
      const lastMsg = chat.lastMessage?.toLowerCase() || '';
      return name.includes(query) || lastMsg.includes(query);
    });
  }, [chatList, searchQuery, profiles]);

  useEffect(() => {
    const loadChatList = async () => {
      if (!user?.id) return;
      setLoadingChats(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('id, chat_id, sender_id, receiver_id, body, created_at')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const latestByChat = new Map<string, (typeof data)[number]>();
        (data ?? []).forEach((msg) => {
          if (!latestByChat.has(msg.chat_id)) latestByChat.set(msg.chat_id, msg);
        });

        const chats = Array.from(latestByChat.values()).map((msg) => {
          const peerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          return {
            id: msg.chat_id,
            peerId,
            lastMessage: msg.body,
            unread: msg.receiver_id === user.id,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        });

        const peerIds = [...new Set(chats.map(c => c.peerId))];
        if (selectedPeerId && !peerIds.includes(selectedPeerId)) {
          peerIds.push(selectedPeerId);
        }
        
        const profileData = await fetchProfilesByIds(peerIds);
        const profileMap: Record<string, { name: string; avatar_url?: string | null; initials: string }> = {};
        
        profileData.forEach(p => {
          const name = p.full_name || 'User';
          const parts = name.trim().split(/\s+/);
          const initials = parts.length > 1 
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase();
            
          profileMap[p.id] = {
            name: parts[0],
            avatar_url: p.avatar_url,
            initials
          };
        });

        setProfiles(profileMap);
        setChatList(chats);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      } finally {
        setLoadingChats(false);
      }
    };

    loadChatList();
  }, [user?.id, selectedPeerId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChatId) return;
      try {
        const data = await fetchChatMessages(selectedChatId);
        setChatMessages(data);
      } catch (error) {
        console.error('Failed to fetch chat messages:', error);
      }
    };

    loadMessages();
  }, [selectedChatId]);

  useEffect(() => {
    if (!selectedChatId) return;

    const channel = supabase
      .channel(`chat-${selectedChatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChatId}` },
        (payload) => {
          const newMessage = payload.new as MessageRecord;
          setChatMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChatId]);

  const handleSendMessage = async () => {
    if (!user?.id || !selectedPeerId || !messageText.trim()) return;

    const currentText = messageText.trim();
    setMessageText('');
    setSending(true);
    
    try {
      const chatId = makeChatId(user.id, selectedPeerId);
      const newMsg = await sendMessage({
        chatId,
        receiverId: selectedPeerId,
        body: currentText,
      });
      
      setChatMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      
      setChatList(prev => prev.map(c => 
        c.id === chatId ? { ...c, lastMessage: currentText, timestamp: 'Just now' } : c
      ));
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessageText(currentText);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleBackToList = () => {
    setSearchParams({});
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex h-[calc(100vh-120px)] sm:h-[calc(100vh-160px)]">
      {/* Left Panel - Chat List */}
      <div className={`${selectedChatId ? 'hidden' : 'flex'} lg:flex w-full lg:w-80 border-r border-gray-50 flex-col`}>
        <div className="p-4 sm:p-6 border-b border-gray-50">
           <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
           <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                 <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Search chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
              />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
           {loadingChats ? (
             <ChatListSkeleton />
           ) : filteredChatList.length > 0 ? filteredChatList.map((chat) => {
              const profile = profiles[chat.peerId];
              const isSelected = chat.id === selectedChatId;
              return (
                <div 
                  key={chat.id} 
                  onClick={() => setSearchParams({ chatId: chat.id })}
                  className={`p-4 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary-50 border-r-4 border-primary-600' : ''} ${chat.unread && !isSelected ? 'bg-primary-50/30' : ''}`}
                >
                   <div className="w-12 h-12 bg-primary-100 rounded-xl flex-shrink-0 flex items-center justify-center text-primary-700 font-bold overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url || undefined} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        profile?.initials || 'U'
                      )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className={`text-sm font-bold truncate ${chat.unread && !isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                           {profile?.name || chat.peerId.slice(0, 8)}
                         </h4>
                         <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{chat.timestamp}</span>
                      </div>
                      <p className={`text-xs truncate ${chat.unread && !isSelected ? 'text-primary-700 font-medium' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                   </div>
                   {chat.unread && !isSelected && <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>}
                </div>
              );
           }) : (
             <div className="p-12 text-center">
               <p className="text-gray-400 text-sm">No messages yet.</p>
             </div>
           )}
        </div>
      </div>

      {/* Right Panel - Active Chat */}
      <div className={`${selectedChatId ? 'flex' : 'hidden'} lg:flex flex-1 flex flex-col bg-gray-50/30 min-w-0`}>
        {selectedChatId ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-gray-50 flex items-center justify-between px-4 sm:px-6">
               <div className="flex items-center space-x-3 sm:space-x-4">
                  <button 
                    onClick={handleBackToList}
                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600 -ml-2"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold overflow-hidden">
                     {profiles[selectedPeerId]?.avatar_url ? (
                       <img src={profiles[selectedPeerId].avatar_url || undefined} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                       profiles[selectedPeerId]?.initials || 'U'
                     )}
                  </div>
                  <div className="min-w-0">
                     <h3 className="font-bold text-gray-900 truncate">{profiles[selectedPeerId]?.name || selectedPeerId.slice(0, 8)}</h3>
                     <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
                  </div>
               </div>
               <button className="text-gray-400 hover:text-gray-600 p-2">
                  <MoreVertical size={20} />
               </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
               <div className="flex justify-center">
                  <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chat History</span>
               </div>
               
               <div className="flex flex-col space-y-4">
                  {chatMessages.map((message) =>
                    message.sender_id === user?.id ? (
                      <div key={message.id} className="flex flex-col items-end space-y-1 self-end max-w-[85%] sm:max-w-[70%]">
                        <div className="bg-primary-600 p-3 sm:p-4 rounded-2xl rounded-br-none shadow-lg shadow-primary-100 text-white">
                          <p className="text-sm">{message.body}</p>
                          <p className="text-[10px] text-primary-100 mt-2 text-right">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div key={message.id} className="flex items-end space-x-2 max-w-[85%] sm:max-w-[70%]">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex-shrink-0 flex items-center justify-center text-primary-700 text-xs font-bold overflow-hidden">
                          {profiles[message.sender_id]?.avatar_url ? (
                            <img src={profiles[message.sender_id].avatar_url || undefined} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            profiles[message.sender_id]?.initials || message.sender_id.slice(0, 2).toUpperCase()
                          )}
                        </div>                        <div className="bg-white border border-gray-100 p-3 sm:p-4 rounded-2xl rounded-bl-none shadow-sm">
                          <p className="text-sm text-gray-700">{message.body}</p>
                          <p className="text-[10px] text-gray-400 mt-2">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                  <div ref={messagesEndRef} />
               </div>
            </div>
            
            {/* Chat Input */}
            <div className="p-4 sm:p-6 bg-white border-t border-gray-50">
               <form 
                 onSubmit={(e) => {
                   e.preventDefault();
                   handleSendMessage();
                 }}
                 className="flex items-center space-x-2 sm:space-x-4"
               >
                  <button type="button" className="hidden sm:block text-gray-400 hover:text-gray-600"><Paperclip size={20} /></button>
                  <div className="flex-1 relative">
                     <input 
                       type="text" 
                       placeholder="Type a message..." 
                       value={messageText}
                       onChange={(e) => setMessageText(e.target.value)}
                       className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                     />
                     <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><Smile size={20} /></button>
                  </div>
                  <button 
                    type="submit"
                    disabled={sending || !messageText.trim()} 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 disabled:opacity-60"
                  >
                     <Send size={18} />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-center">
            <div className="max-w-xs">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400 mx-auto mb-6">
                <MessageSquare size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a chat from the list to start messaging with verified talent or clients.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
