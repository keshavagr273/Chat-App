import { format } from 'date-fns';
import { FiCheck, FiCheckCircle, FiFile } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import Avatar from './Avatar';

const Message = ({ message, isOwn }) => {
  const { user } = useAuthStore();

  const isRead = message.readBy?.some(read => read.user !== user._id);
  const isDelivered = message.deliveredTo?.length > 0;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} message-enter`}>
      <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
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

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-5 py-3 ${isOwn
              ? 'bg-primary text-black rounded-tr-sm shadow-lg shadow-primary/20'
              : 'bg-[#111] text-gray-200 border border-border rounded-tl-sm shadow-md'
            } leading-relaxed tracking-wide`}
        >
          {message.isDeleted ? (
            <p className="italic text-gray-400">{message.content}</p>
          ) : (
            <>
              {message.messageType === 'text' && (
                <p className="break-words">{message.content}</p>
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
            </>
          )}

          {/* Reactions */}
          {message.reactions?.length > 0 && (
            <div className="flex gap-1 mt-1">
              {message.reactions.map((reaction, idx) => (
                <span key={idx} className="text-sm">
                  {reaction.emoji}
                </span>
              ))}
            </div>
          )}
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
