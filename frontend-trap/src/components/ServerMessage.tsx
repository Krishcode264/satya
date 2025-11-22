import { useTrapStore } from '../store/trapStore';

export const ServerMessage = () => {
  const { serverMessage } = useTrapStore();

  if (!serverMessage) return null;

  // Check if it's an error message
  const isError = serverMessage.toLowerCase().includes('error') || 
                  serverMessage.toLowerCase().includes('connection');

  return (
    <div className={`mt-5 p-4 rounded-lg text-sm leading-relaxed break-words whitespace-pre-wrap ${
      isError 
        ? 'bg-red-50 border border-red-400 text-red-800' 
        : 'bg-yellow-50 border border-yellow-400 text-yellow-800'
    }`}>
      <div className="font-semibold mb-1">{isError ? '⚠️ Error' : '📋 Response'}</div>
      <div>{serverMessage}</div>
    </div>
  );
};
