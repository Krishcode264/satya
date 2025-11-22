import { useTrapStore } from '../store/trapStore';

export const ServerMessage = () => {
  const { serverMessage } = useTrapStore();

  if (!serverMessage) return null;

  // Handle both string and object cases (defensive programming)
  let messageText: string;
  if (typeof serverMessage === 'string') {
    messageText = serverMessage;
  } else if (typeof serverMessage === 'object' && serverMessage !== null) {
    // If it's an object, try to extract the message property
    messageText = (serverMessage as any).message || JSON.stringify(serverMessage);
  } else {
    messageText = String(serverMessage);
  }

  // Check if it's an error message
  const isError = messageText.toLowerCase().includes('error') || 
                  messageText.toLowerCase().includes('connection');

  return (
    <div className={`mt-5 p-4 rounded-lg text-sm leading-relaxed break-words whitespace-pre-wrap ${
      isError 
        ? 'bg-red-50 border border-red-400 text-red-800' 
        : 'bg-yellow-50 border border-yellow-400 text-yellow-800'
    }`}>
      <div className="font-semibold mb-1">{isError ? '⚠️ Error' : '📋 Response'}</div>
      <div>{messageText}</div>
    </div>
  );
};
