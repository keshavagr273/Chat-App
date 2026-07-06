import { useState } from 'react';
import { format } from 'date-fns';
import { FiCheck, FiCheckCircle, FiFile, FiSmile, FiTrash2, FiCornerUpLeft, FiPlus } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { getSocket } from '../utils/socket';
import EmojiPicker from 'emoji-picker-react';
import Avatar from './Avatar';
import LinkPreview from './LinkPreview';

const Message = ({ message, isOwn }) => {
  const { user } = useAuthStore();
  const { selectedChat, setReplyingTo } = useChatStore();
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const socket = getSocket();

  const isRead = message.readBy?.some(read => read.user !== user._id);
  const isDelivered = message.deliveredTo?.length > 0;

  const handleReaction = (emojiData) => {
    const existingReaction = message.reactions?.find(r => (r.user?._id === user._id || r.user === user._id));
    
    if (socket && selectedChat) {
      if (existingReaction && existingReaction.emoji === emojiData.emoji) {
        socket.emit('remove_reaction', {
          messageId: message._id,
          chatId: selectedChat._id
        });
      } else {
        socket.emit('add_reaction', {
          messageId: message._id,
          emoji: emojiData.emoji,
          chatId: selectedChat._id
        });
      }
    }
    setShowEmoji(false);
    setShowFullPicker(false);
  };

  const handleDelete = (deleteType) => {
    if (socket && selectedChat) {
      socket.emit('delete_message', {
        messageId: message._id,
        chatId: selectedChat._id,
        deleteType
      });
    }
    setShowDeleteMenu(false);
  };

  const handleReply = () => {
    setReplyingTo(message);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} message-enter group relative`}>
      <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'} relative`}>
        {/* Sender name (for group chats) */}
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <Avatar
              src={message.sender.avatar}
              name={message.sender.username}
              className="w-6 h-6"
            />
            <span className="text-xs text-gray-400">{message.sender.username}</span>
          </div>
        )}

        {/* Message Bubble container */}
        <div className="flex items-center gap-2 relative">
          
          {/* Hover Menu (Left side for own messages, Right side for others) */}
          {!message.isDeleted && (
            <div className={`${(showEmoji || showDeleteMenu) ? 'flex' : 'hidden group-hover:flex'} items-center gap-1 absolute top-1/2 -translate-y-1/2 ${isOwn ? 'right-full mr-2' : 'left-full ml-2'} z-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-xl transition-all duration-300 animate-in fade-in zoom-in-95`}>
              <button 
                onClick={handleReply}
                className="p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-white/10"
                title="Reply"
              >
                <FiCornerUpLeft className="text-sm" />
              </button>
              <div className="relative">
                <button 
                  onClick={() => { setShowEmoji(!showEmoji); setShowDeleteMenu(false); }}
                  className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-full hover:bg-white/10"
                  title="React"
                >
                  <FiSmile className="text-sm" />
                </button>
                {showEmoji && (
                  <>
                    <div
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={(e) => { e.stopPropagation(); setShowEmoji(false); setShowFullPicker(false); }}
                    ></div>
                    <div className={`absolute bottom-full mb-2 z-20 ${isOwn ? 'right-0' : 'left-0'}`}>
                      {!showFullPicker ? (
                        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300">
                          {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => {
                            const isSelected = message.reactions?.some(r => (r.user?._id === user._id || r.user === user._id) && r.emoji === emoji);
                            return (
                              <button
                                key={emoji}
                                className={`hover:scale-125 hover:-translate-y-1 transition-all duration-300 text-2xl p-1.5 rounded-full ${isSelected ? 'bg-primary/40 shadow-[0_0_15px_rgba(0,255,100,0.2)]' : ''}`}
                                onClick={() => handleReaction({ emoji })}
                              >
                                {emoji}
                              </button>
                            );
                          })}
                          <div className="w-[1px] h-6 bg-white/20 mx-1"></div>
                          <button
                            className="hover:bg-white/10 hover:text-white rounded-full p-2 text-gray-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFullPicker(true);
                            }}
                          >
                            <FiPlus className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <EmojiPicker onEmojiClick={handleReaction} theme="dark" width={280} height={350} />
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => { setShowDeleteMenu(!showDeleteMenu); setShowEmoji(false); }}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-white/10"
                  title="Delete"
                >
                  <FiTrash2 className="text-sm" />
                </button>
                {showDeleteMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={(e) => { e.stopPropagation(); setShowDeleteMenu(false); }}
                    ></div>
                    <div className={`absolute bottom-full mb-2 z-20 ${isOwn ? 'right-0' : 'left-0'} bg-[#1a1b1e]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden min-w-[160px] animate-in fade-in slide-in-from-bottom-2 duration-200 flex flex-col`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete('for_me'); }}
                        className="px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-white/10 transition-colors"
                      >
                        Delete for me
                      </button>
                      {isOwn && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete('for_everyone'); }}
                          className="px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/10 transition-colors border-t border-white/5"
                        >
                          Delete for everyone
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`rounded-[20px] px-5 py-3 ${isOwn
                ? 'bg-gradient-to-br from-primary to-emerald-500 text-black rounded-tr-[4px] shadow-[0_4px_15px_rgba(0,255,100,0.2)]'
                : 'bg-[#202225] border border-white/5 text-gray-100 rounded-tl-[4px] shadow-[0_4px_15px_rgba(0,0,0,0.4)]'
              } leading-relaxed tracking-wide relative flex flex-col transition-all`}
          >
            {/* Quoted Message */}
            {message.replyTo && (
              <div 
                className={`mb-2 px-3 py-2 rounded-lg text-sm border-l-4 opacity-90 ${isOwn ? 'bg-black/10 border-black/30' : 'bg-[#1a1a1a] border-primary'}`}
              >
                <div className={`font-semibold mb-0.5 text-xs ${isOwn ? 'text-black/70' : 'text-primary'}`}>
                  {message.replyTo.sender?.username || 'User'}
                </div>
                <div className={`truncate max-w-[200px] md:max-w-xs ${isOwn ? 'text-black/80' : 'text-gray-300'}`}>
                  {message.replyTo.isDeleted ? 
                    <em>Message deleted</em> : 
                    (message.replyTo.content || message.replyTo.messageType)}
                </div>
              </div>
            )}

            {message.isDeleted ? (
              <p className={`italic ${isOwn ? 'text-black/60 font-medium' : 'text-gray-500'}`}>{message.content}</p>
          ) : (
            <>
              {message.messageType === 'text' && (
                <>
                  <p className="break-words whitespace-pre-wrap">{message.content}</p>
                  {/* Extract URL and render preview */}
                  {(() => {
                    const urlMatch = message.content.match(/(https?:\/\/[^\s]+)/);
                    if (urlMatch) {
                      return <LinkPreview url={urlMatch[0]} />;
                    }
                    return null;
                  })()}
                </>
              )}
              {message.messageType === 'image' && (
                <div className="mt-1 relative group cursor-pointer overflow-hidden rounded-xl border border-black/10 shadow-sm">
                  <a href={message.fileUrl} target="_blank" rel="noreferrer">
                    <img
                      src={message.fileUrl}
                      alt="Shared attachment"
                      className="max-w-[240px] md:max-w-sm max-h-[300px] object-cover hover:scale-[1.02] transition-transform duration-300"
                    />
                  </a>
                  {message.content && <p className="mt-2 break-words text-sm">{message.content}</p>}
                </div>
              )}
              {message.messageType === 'file' && (
                <div className="mt-1">
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-xl border ${isOwn ? 'bg-black/10 border-black/10 text-black hover:bg-black/20' : 'bg-[#1a1a1a] border-[#222] text-gray-200 hover:bg-[#222]'} transition-colors max-w-[280px] md:max-w-sm`}
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${isOwn ? 'bg-black/10 text-black' : 'bg-black/40 text-primary'}`}>
                      <FiFile className="text-xl" />
                    </div>
                    <div className="flex flex-col min-w-0 overflow-hidden">
                      <span className="font-semibold text-sm truncate">{message.fileName || 'Attachment'}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${isOwn ? 'text-black/60' : 'text-gray-500'}`}>Click to view</span>
                    </div>
                  </a>
                  {message.content && <p className="mt-2 break-words text-sm">{message.content}</p>}
                </div>
              )}
              {message.messageType === 'voice' && (
                <div className="mt-1">
                  <audio 
                    controls 
                    src={message.fileUrl} 
                    className="h-10 w-[200px] md:w-[250px] outline-none"
                  />
                  {message.content && message.content !== 'Voice message' && (
                    <p className="mt-2 break-words text-sm">{message.content}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Reactions */}
          {message.reactions?.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map((reaction, idx) => (
                <span 
                  key={idx} 
                  className={`text-[13px] px-2 py-0.5 rounded-full shadow-sm flex items-center justify-center border ${isOwn ? 'bg-black/20 border-black/10' : 'bg-[#111] border-[#333] text-gray-300 hover:border-gray-500 cursor-default'}`} 
                  title={reaction.user?.username || 'User'}
                >
                  {reaction.emoji}
                </span>
              ))}
            </div>
          )}
        </div>
        </div>

        {/* Message Meta */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
          {message.isEdited && <span>(edited)</span>}
          {isOwn && (
            <span>
              {isRead ? (
                <FiCheckCircle className="text-primary" />
              ) : isDelivered ? (
                <FiCheckCircle className="text-gray-400" />
              ) : (
                <FiCheck className="text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
