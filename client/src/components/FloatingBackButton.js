import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const FloatingBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on dashboard (home page)
  if (location.pathname === '/dashboard') {
    return null;
  }

  const goBack = () => {
    navigate(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-6 right-6 z-50 lg:hidden"
    >
      <button
        onClick={goBack}
        className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

export default FloatingBackButton;
