import { useState } from 'react'
import { motion } from 'framer-motion'
import VideoEditor from './components/VideoEditor'
import WalletProvider from './components/WalletProvider'
import Header from './components/Header'
import MediaManager from './model/MediaManager'
import {  LoadingContextProvider } from './context/loadingContext'
window.global ||= window;



function App() {

  const handleFile = (file: File) => {
    console.log("Selected file:", file);
    // Next: Transcribe, upload to storage, etc.
  };

  return (
    <LoadingContextProvider>

    <WalletProvider>

      <div className="min-h-screen bg-[#000023]  scrollbar-thumb-rounded-full scrollbar-track-rounded-full  scrollbar-thin scrollbar-thumb-purple-950 scrollbar-track-transparent text-white overflow-hidden">
        {/* Aurora Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-800/10 pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-50">
          <Header />

          <MediaManager/>
        </div>
      </div>
 
    </WalletProvider>
    </LoadingContextProvider>
 
  )
}

export default App
