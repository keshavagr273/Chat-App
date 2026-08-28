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

  const isRead = message.readBy?.some(read => 
    (read.user?._id || read.user)?.toString() !== user._id?.toString()
  );
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
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} message-enter group relative my-1`}>
      <div className={`max-w-[85%] sm:max-w-md ${isOwn ? 'order-2' : 'order-1'} relative`}>
        {/* Sender name for group chats */}
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1 pl-1">
            <Avatar
              src={message.sender.avatar}
              name={message.sender.username}
              className="w-5 h-5"
            />
            <span className="font-display text-[11px] font-medium text-text-muted">{message.sender.username}</span>
          </div>
        )}

        {/* Message Bubble Container */}
        <div className="flex items-center gap-2 relative">
          
          {/* Hover Menu */}
          {!message.isDeleted && (
            <div className={`${(showEmoji || showDeleteMenu) ? 'flex' : 'hidden group-hover:flex'} items-center gap-0.5 absolute top-1/2 -translate-y-1/2 ${isOwn ? 'right-full mr-2' : 'left-full ml-2'} z-20 bento-card p-1 shadow-2xl transition-all duration-200`}>
              <button 
                onClick={handleReply}
                className="p-1.5 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-container-highest"
                title="Reply"
              >
                <FiCornerUpLeft className="text-xs" />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => { setShowEmoji(!showEmoji); setShowDeleteMenu(false); }}
                  className="p-1.5 text-text-muted hover:text-yellow-400 transition-colors rounded-lg hover:bg-surface-container-highest"
                  title="Add Reaction"
                >
                  <FiSmile className="text-xs" />
                </button>
                {showEmoji && (
                  <>
                    <div
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={(e) => { e.stopPropagation(); setShowEmoji(false); setShowFullPicker(false); }}
                    ></div>
                    <div className={`absolute bottom-full mb-2 z-30 ${isOwn ? 'right-0' : 'left-0'}`}>
                      {!showFullPicker ? (
                        <div className="flex items-center gap-1 bento-card px-2.5 py-1.5 shadow-2xl">
                          {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => {
                            const isSelected = message.reactions?.some(r => (r.user?._id === user._id || r.user === user._id) && r.emoji === emoji);
                            return (
                              <button
                                key={emoji}
                                className={`hover:scale-125 transition-all text-xl p-1 rounded-lg ${isSelected ? 'bg-primary/20 ring-1 ring-primary' : ''}`}
                                onClick={() => handleReaction({ emoji })}
                              >
                                {emoji}
                              </button>
                            );
                          })}
                          <div className="w-[1px] h-5 bg-border-glass mx-1"></div>
                          <button
                            className="hover:bg-surface-container-highest text-text-muted hover:text-on-surface rounded-lg p-1.5 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFullPicker(true);
                            }}
                          >
                            <FiPlus className="text-xs" />
                          </button>
                        </div>
                      ) : (
                        <div className="shadow-2xl rounded-2xl overflow-hidden border border-border-glass">
                          <EmojiPicker onEmojiClick={handleReaction} theme="dark" width={280} height={340} />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => { setShowDeleteMenu(!showDeleteMenu); setShowEmoji(false); }}
                  className="p-1.5 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-surface-container-highest"
                  title="Options"
                >
                  <FiTrash2 className="text-xs" />
                </button>
                {showDeleteMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={(e) => { e.stopPropagation(); setShowDeleteMenu(false); }}
                    ></div>
                    <div className={`absolute bottom-full mb-2 z-30 ${isOwn ? 'right-0' : 'left-0'} bento-card p-1.5 shadow-2xl min-w-[150px] flex flex-col`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete('for_me'); }}
                        className="px-3 py-1.5 text-left text-xs font-display font-medium text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors"
                      >
                        Delete for me
                      </button>
                      {isOwn && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete('for_everyone'); }}
                          className="px-3 py-1.5 text-left text-xs font-display font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-t border-border-glass/40 mt-1 pt-1.5"
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

          {/* Actual Chat Bubble */}
          <div
            className={`rounded-[20px] px-4 py-2.5 ${
              isOwn
                ? 'bg-gradient-to-br from-primary-container to-secondary-container text-on-primary font-medium rounded-tr-[4px] shadow-[0_4px_20px_rgba(16,185,129,0.22)]'
                : 'bg-surface-glass-card border border-border-glass text-on-surface rounded-tl-[4px] shadow-glass backdrop-blur-md'
            } leading-relaxed relative flex flex-col transition-all`}
          >
            {/* Quoted Message */}
            {message.replyTo && (
              <div 
                className={`mb-2 px-3 py-1.5 rounded-lg text-xs border-l-2 ${
                  isOwn 
                    ? 'bg-black/15 border-black/40 text-on-primary' 
                    : 'bg-surface-container-highest border-primary text-text-muted'
                }`}
              >
                <div className={`font-display font-semibold mb-0.5 text-[10px] ${isOwn ? 'text-black/80' : 'text-primary'}`}>
                  {message.replyTo.sender?.username || 'User'}
                </div>
                <div className="truncate max-w-[200px] sm:max-w-xs">
                  {message.replyTo.isDeleted ? 
                    <em className="opacity-70">Message deleted</em> : 
                    (message.replyTo.content || message.replyTo.messageType)}
                </div>
              </div>
            )}

            {message.isDeleted ? (
              <p className={`italic text-xs ${isOwn ? 'text-black/70' : 'text-text-muted'}`}>{message.content}</p>
            ) : (
              <>
                {message.messageType === 'text' && (
                  <>
                    <p className="break-words whitespace-pre-wrap text-sm font-sans">{message.content}</p>
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
                  <div className="mt-1 relative overflow-hidden rounded-xl border border-black/10 shadow-sm">
                    <a href={message.fileUrl} target="_blank" rel="noreferrer">
                      <img
                        src={message.fileUrl}
                        alt="Shared attachment"
                        className="max-w-[220px] sm:max-w-sm max-h-[300px] object-cover hover:scale-[1.02] transition-transform duration-300 rounded-lg"
                      />
                    </a>
                    {message.content && <p className="mt-2 break-words text-xs">{message.content}</p>}
                  </div>
                )}
                {message.messageType === 'file' && (
                  <div className="mt-1">
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
                        isOwn 
                          ? 'bg-black/15 border-black/15 text-on-primary hover:bg-black/25' 
                          : 'bg-surface-container-highest border-border-glass text-on-surface hover:bg-surface-container-high'
                      } transition-colors max-w-[260px] sm:max-w-sm`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${isOwn ? 'bg-black/20 text-on-primary' : 'bg-primary/20 text-primary'}`}>
                        <FiFile className="text-base" />
                      </div>
                      <div className="flex flex-col min-w-0 overflow-hidden">
                        <span className="font-display font-semibold text-xs truncate">{message.fileName || 'Attachment'}</span>
                        <span className={`text-[10px] uppercase font-label font-bold tracking-wider mt-0.5 ${isOwn ? 'text-black/60' : 'text-text-muted'}`}>
                          Download file
                        </span>
                      </div>
                    </a>
                    {message.content && <p className="mt-2 break-words text-xs">{message.content}</p>}
                  </div>
                )}
                {message.messageType === 'voice' && (
                  <div className="mt-1">
                    <audio 
                      controls 
                      src={message.fileUrl} 
                      className="h-9 w-[200px] sm:w-[240px] outline-none"
                    />
                    {message.content && message.content !== 'Voice message' && (
                      <p className="mt-1.5 break-words text-xs">{message.content}</p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Reactions Badges */}
            {message.reactions?.length > 0 && (
              <div className={`flex flex-wrap gap-1 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {message.reactions.map((reaction, idx) => (
                  <span 
                    key={idx} 
                    className={`text-xs px-2 py-0.5 rounded-full flex items-center justify-center border shadow-sm ${
                      isOwn 
                        ? 'bg-black/20 border-black/20 text-on-primary' 
                        : 'bg-surface-container-highest border-border-glass text-on-surface'
                    }`} 
                    title={reaction.user?.username || 'User'}
                  >
                    {reaction.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timestamp and Checkmarks */}
        <div className={`flex items-center gap-1 mt-1 text-[10px] font-label text-text-muted ${isOwn ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
          <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
          {message.isEdited && <span>(edited)</span>}
          {isOwn && (
            <span>
              {isRead ? (
                <FiCheckCircle className="text-primary text-xs" />
              ) : isDelivered ? (
                <FiCheckCircle className="text-text-muted text-xs" />
              ) : (
                <FiCheck className="text-text-muted text-xs" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
