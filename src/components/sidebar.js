import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/side-bar.css';
import Wash from '../resources/washing-machine.png';

// Component that renders each navigation item with an icon and label
const NavItem = ({ onClick, icon, label }) => (
  <li onClick={onClick}>
    {icon}
    <span>{label}</span>
  </li>
);

const Sidebar = ({ isOpen }) => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Close the sidebar if click is outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // Close sidebar logic (if needed)
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Icon components for reuse
  const homeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16%" height="auto" fill="currentColor" className="bi bi-house-door" viewBox="0 0 16 16">
      <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
    </svg>
  );

  const pecherasIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="17%" height="auto" viewBox="0 0 640 512">
      <path d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0l12.6 0c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7 480 448c0 35.3-28.7 64-64 64l-192 0c-35.3 0-64-28.7-64-64l0-250.3-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0l12.6 0z" />
    </svg>
  );

  const plusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="17%" height="17%" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
    </svg>
  );

  const companyIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="17%" height="auto" fill="currentColor" className="bi bi-buildings" viewBox="0 0 16 16">
      <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z" />
    </svg>
  );

  const distributionIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20%" height="auto" fill="currentColor" className="bi bi-box2" viewBox="0 0 16 16">
      <path d="M2.95.4a1 1 0 0 1 .8-.4h8.5a1 1 0 0 1 .8.4l2.85 3.8a.5.5 0 0 1 .1.3V15a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4.5a.5.5 0 0 1 .1-.3zM7.5 1H3.75L1.5 4h6zm1 0v3h6l-2.25-3zM15 5H1v10h14z" />
    </svg>
  );

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
      <nav className="barra">
        <ul>
          <NavItem onClick={() => handleNavigation('/dashboard')} icon={homeIcon} label="Dashboard" />
          <NavItem onClick={() => handleNavigation('/datopecheras')} icon={pecherasIcon} label="Pecheras" />
          <NavItem onClick={() => handleNavigation('/registropecheras')} icon={plusIcon} label="Registrar pecheras" />
          <NavItem onClick={() => handleNavigation('/empresa')} icon={companyIcon} label="Empresas" />
          <NavItem onClick={() => handleNavigation('/lavado')} icon={<img src={Wash} className='wash' />} label="Lavado" />
          <NavItem onClick={() => handleNavigation('/usuarios')} icon={            <svg xmlns="http://www.w3.org/2000/svg" width="20%" height="auto" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
            </svg>} label="Usuarios" />
          <NavItem onClick={() => handleNavigation('/distribucion')} icon={distributionIcon} label="Distribución" />
          <li onClick={() => handleNavigation('/ecovista')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20%" height="auto" fill="currentColor" class="bi bi-recycle" viewBox="0 0 16 16">
              <path d="M9.302 1.256a1.5 1.5 0 0 0-2.604 0l-1.704 2.98a.5.5 0 0 0 .869.497l1.703-2.981a.5.5 0 0 1 .868 0l2.54 4.444-1.256-.337a.5.5 0 1 0-.26.966l2.415.647a.5.5 0 0 0 .613-.353l.647-2.415a.5.5 0 1 0-.966-.259l-.333 1.242zM2.973 7.773l-1.255.337a.5.5 0 1 1-.26-.966l2.416-.647a.5.5 0 0 1 .612.353l.647 2.415a.5.5 0 0 1-.966.259l-.333-1.242-2.545 4.454a.5.5 0 0 0 .434.748H5a.5.5 0 0 1 0 1H1.723A1.5 1.5 0 0 1 .421 12.24zm10.89 1.463a.5.5 0 1 0-.868.496l1.716 3.004a.5.5 0 0 1-.434.748h-5.57l.647-.646a.5.5 0 1 0-.708-.707l-1.5 1.5a.5.5 0 0 0 0 .707l1.5 1.5a.5.5 0 1 0 .708-.707l-.647-.647h5.57a1.5 1.5 0 0 0 1.302-2.244z"/>
            </svg>
            <span>EcoVista</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
