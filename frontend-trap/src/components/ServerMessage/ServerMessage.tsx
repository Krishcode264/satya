import './ServerMessage.css';

interface ServerMessageProps {
  message: string;
}

const ServerMessage = ({ message }: ServerMessageProps): JSX.Element | null => {
  if (!message) return null;

  return (
    <div className="server-message">
      {message}
    </div>
  );
};

export default ServerMessage;

