import StudentPageTemplate from "./Student Side/StudentPageTemplate";
const NotFound = () => {
  return (
    <StudentPageTemplate pageTitle="404 Not Found">
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-8">Page Not Found</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700 transition"
        >
          Go Back
        </button>
      </div>
    </StudentPageTemplate>
  );
};

export default NotFound;
