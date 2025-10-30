import React from 'react';

const Loader: React.FC = () => (
  <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center z-[100]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

export default Loader;
