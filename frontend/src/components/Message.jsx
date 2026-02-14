import { format } from 'date-fns';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

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
            <img
              src={message.sender.avatar}
              alt={message.sender.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs text-gray-400">{message.sender.username}</span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-2 ${isOwn
              ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-none'
              : 'bg-dark-200 text-white rounded-tl-none'
            }`}
        >
          {message.isDeleted ? (
            <p className="italic text-gray-400">{message.content}</p>
          ) : (
            <>
              {message.messageType === 'text' && (
                <p className="break-words">{message.content}</p>
              )}
              {message.messageType === 'image' && (
                <img
                  src={message.fileUrl}
                  alt="Shared"
                  className="max-w-sm rounded-lg"
                />
              )}
              {message.messageType === 'file' && (
                <a
                  href={message.fileUrl}
                  download
                  className="flex items-center gap-2 hover:underline"
                >
                  📎 {message.fileName}
                </a>
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
                <FiCheckCircle className="text-blue-400" />
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
