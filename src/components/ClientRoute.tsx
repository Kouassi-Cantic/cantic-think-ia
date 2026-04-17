import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ClientRouteProps {
  children: React.ReactNode;
}

const ClientRoute: React.FC<ClientRouteProps> = ({ children }) => {
  const location = useLocation();
  const isClient = !!localStorage.getItem('cantic_client_email');

  if (!isClient) {
    return <Navigate to="/client/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ClientRoute;
