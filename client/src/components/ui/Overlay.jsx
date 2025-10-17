const Overlay = ({ alertFlag, setAlertFlag, children }) => {
    if (!alertFlag) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-lg p-4 shadow-lg relative">
          {children ? (
            children
          ) : (
            <div className="text-center">
              <p>Something went wrong!</p>
              <button
                onClick={() => setAlertFlag(false)}
                className="mt-3 bg-red-500 text-white px-3 py-1 rounded"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  export default Overlay;
  