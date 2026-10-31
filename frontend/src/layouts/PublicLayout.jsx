import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DemoBar from '../components/DemoBar';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf8] text-[#172033]">
      <DemoBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
