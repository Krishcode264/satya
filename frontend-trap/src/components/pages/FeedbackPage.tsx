import { useTrapStore } from '../../store/trapStore';
import { analyzeInput } from '../../utils/api';

export const FeedbackPage = () => {
  const {
    feedbackName,
    feedbackEmail,
    feedbackComment,
    isLoading,
    setFeedbackName,
    setFeedbackEmail,
    setFeedbackComment,
    setIsLoading,
    setServerMessage,
  } = useTrapStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerMessage('');

    try {
      const messages: string[] = [];

      // Send name
      if (feedbackName) {
        const nameResponse = await analyzeInput({
          userInput: feedbackName,
          page: 'feedback',
          field: 'name',
        });
        messages.push(nameResponse.message || '');
      }

      // Send email
      if (feedbackEmail) {
        const emailResponse = await analyzeInput({
          userInput: feedbackEmail,
          page: 'feedback',
          field: 'email',
        });
        messages.push(emailResponse.message || '');
      }

      // Send comment
      if (feedbackComment) {
        const commentResponse = await analyzeInput({
          userInput: feedbackComment,
          page: 'feedback',
          field: 'comment',
        });
        messages.push(commentResponse.message || '');
      }

      setServerMessage(messages.join('\n\n'));
    } catch (error) {
      setServerMessage(error instanceof Error ? error.message : 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="feedback-name" className="text-sm font-medium text-gray-800">
          Name
        </label>
        <input
          type="text"
          id="feedback-name"
          value={feedbackName}
          onChange={(e) => setFeedbackName(e.target.value)}
          placeholder="Enter your name"
          required
          autoComplete="name"
          className="px-3 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="feedback-email" className="text-sm font-medium text-gray-800">
          Email
        </label>
        <input
          type="email"
          id="feedback-email"
          value={feedbackEmail}
          onChange={(e) => setFeedbackEmail(e.target.value)}
          placeholder="Enter your email"
          required
          autoComplete="email"
          className="px-3 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="feedback-comment" className="text-sm font-medium text-gray-800">
          Comment
        </label>
        <textarea
          id="feedback-comment"
          value={feedbackComment}
          onChange={(e) => setFeedbackComment(e.target.value)}
          placeholder="Enter your feedback or comment"
          required
          rows={5}
          className="px-3 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="py-3.5 bg-gradient-to-r from-primary to-secondary text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all mt-2.5 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isLoading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
};

