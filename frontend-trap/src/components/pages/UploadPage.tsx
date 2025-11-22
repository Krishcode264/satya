import { useTrapStore } from '../../store/trapStore';
import { analyzeInput } from '../../utils/api';

export const UploadPage = () => {
  const {
    uploadFile,
    uploadDescription,
    isLoading,
    setUploadFile,
    setUploadDescription,
    setIsLoading,
    setServerMessage,
  } = useTrapStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerMessage('');

    try {
      const messages: string[] = [];

      // Send file name if file is selected
      if (uploadFile) {
        const fileNameResponse = await analyzeInput({
          userInput: uploadFile.name,
          page: 'upload',
          field: 'filename',
        });
        messages.push(fileNameResponse);
      }

      // Send description
      if (uploadDescription) {
        const descriptionResponse = await analyzeInput({
          userInput: uploadDescription,
          page: 'upload',
          field: 'description',
        });
        messages.push(descriptionResponse);
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
        <label htmlFor="upload-file" className="text-sm font-medium text-gray-800">
          Upload File
        </label>
        <input
          type="file"
          id="upload-file"
          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          required
          className="px-3 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary/90"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="upload-description" className="text-sm font-medium text-gray-800">
          Description
        </label>
        <textarea
          id="upload-description"
          value={uploadDescription}
          onChange={(e) => setUploadDescription(e.target.value)}
          placeholder="Enter file description"
          required
          rows={4}
          className="px-3 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="py-3.5 bg-gradient-to-r from-primary to-secondary text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all mt-2.5 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isLoading ? 'Uploading...' : 'Upload File'}
      </button>
    </form>
  );
};

