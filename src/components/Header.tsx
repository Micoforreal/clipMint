import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { motion } from 'framer-motion'
import { Video, Sparkles, X } from 'lucide-react'
import { useState } from 'react'

const Header = () => {
  const [showAlert, setShowAlert] = useState(true)

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between p-4 border-b border-purple-500/20 backdrop-blur-sm"
    >

      {showAlert && (

        <div className='absolute md:hidden  bg-black p-4 z-50  gap-5 w-[90%] max-w-[500px] justify-between rounded-2xl flex'

        >
          <h2
            className='text-orange-500 bg-orange-'
          >

            ⚠️ For a better experience use this app on desktop</h2>

          <button

            className='text-red-700'
            onClick={() => setShowAlert(false)}>
            <X />
          </button>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800">
          <Video className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            ClipMint
          </h1>
          <p className="text-xs text-gray-400">Onchain Video Editor</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/30"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="md:text-sm text-xs text-purple-300">Mint as NFT</span>
        </motion.div>



        <WalletMultiButton />

      </div>
    </motion.header>
  )
}

export default Header
