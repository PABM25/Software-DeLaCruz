/**
 * Copyright (c) [2024] [Pilar Bonnault Mancilla, Nicolás González Espinoza y Christofer Ruiz Almonacid]
 * Licensed under the MIT License.
 * See LICENSE file in the root directory.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Redirige después de 3 segundos si está cargando
    setTimeout(() => {
      window.location.href = "/login"; // Cambiar a una redirección más directa
    }, 3000);
    return <div>Cargando...</div>;
  }

  return user ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
