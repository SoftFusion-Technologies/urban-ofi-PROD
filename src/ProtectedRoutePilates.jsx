import React from 'react';
import { Navigate } from 'react-router-dom';
import { useInstructorAuth } from './AuthContextInstructores';

const ProtectedRoutePilates = ({ children }) => {
  const { instructorToken } = useInstructorAuth();

  if (!instructorToken) {
    return <Navigate to="/pilates" />;
  }

  return children;
};

export default ProtectedRoutePilates;