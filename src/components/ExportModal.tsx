import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { X, Download, Coins, Sparkles, Video, DollarSign, Loader } from 'lucide-react'
import { Project } from '../types'
import { WebBundlr } from "@bundlr-network/client";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { useMetaplex } from '../hooks/useMetaplex'








interface Props {
  project: File | undefined
  onClose: () => void
  render: () => void,
}

type MintData = {
  address: string;
  metaplexLink: string;
  solScanLink: string;
};

const ExportModal = ({ project, onClose, render }: Props) => {
  const { connected, publicKey, wallet, signMessage, signTransaction } = useWallet()
  const [exportFormat, setExportFormat] = useState('mp4')
  const [quality, setQuality] = useState('1080p')
  const [mintData, setMintData] = useState<MintData | undefined>()
  const [isExporting, setIsExporting] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [mintPrice, setMintPrice] = useState<BigNumber | string>()
  const {
    mintNft
  } = useMetaplex();












  const handleExport = async () => {
    setIsMinting(true)


    // Simulate export process
    if (connected) {
      const file: any = await render()
      if (!file && file == undefined) {
        alert("Failed to render video file.");
        setIsMinting(false);
        return;
      }
      const mint = await mintNft(file)
      console.log(mint)







      // alert('Video exported and minted as NFT successfully!')
      if ( mint ) {

        setMintData(mint)
      } else {
        setError("unable to mint video Please try again")
        setIsMinting(false)
      }


    } else {



      alert('Video exported successfully!')
    }



    setIsMinting(false)
    // onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-black border border-purple-500/30 rounded-xl p-6 max-w-md w-full"
        >

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Export Video</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-purple-500/20 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isExporting ? (
            <div className='flex h-[60vh] flex-col space-y-7 justify-center items-center'>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Exporting

              <span className='text-xs my-7 text-purple-400 animate-pulse'> preparing for download</span>
            </div>
          ) : isMinting ?
            (
              <>
                <div className='flex h-[60vh] flex-col space-y-7 justify-center items-center'>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>

                    Miniting video on chain
                  </span>
                </div>
              </>

            ) : mintData ?
              (
                <div className=' flex flex-col  justify-center items-center'>

                  <h1>Your nft has been minted</h1>



                  <p>{mintData?.address}</p>

                  <p className='my-4'>
                    <span className='my-4'>

                      View on metaplex:
                    </span>


                    <a
                      className="w-full flex items-center my-4 justify-center gap-3 p-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"

                      href={mintData?.metaplexLink}>

                      metaplex


                    </a>


                  </p>


                  <p className='my-4'>
                    <span className='my-4'>

                      View on metaplex:
                    </span>


                    <a
                      className="w-full flex items-center my-4 justify-center gap-3 p-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"

                      href={mintData?.solScanLink}>

                      solScan


                    </a>


                  </p>


                </div>


              )

              : error ?

                (<><h1 className='h-[60vh] text-red-400 flex flex-col items-center justify-center'>
                  <span className='my-auto'>

                  {error}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full flex mt-auto items-center justify-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Try again
                  </motion.button>

                </h1></>)
                :


                (<>
                  {/* Header */}

                  {/* Export Settings */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="w-full p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-white focus:border-purple-400 focus:outline-none"
                      >
                        <option value="mp4">MP4</option>
                        <option value="mov">MOV</option>
                        <option value="avi">AVI</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Quality</label>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-white focus:border-purple-400 focus:outline-none"
                      >
                        <option value="720p">720p HD</option>
                        <option value="1080p">1080p Full HD</option>
                        <option value="4k">4K Ultra HD</option>
                      </select>
                    </div>
                  </div>

                  {/* NFT Minting Option */}
                  {connected && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-purple-600">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">Mint as NFT</h3>
                          <p className="text-sm text-gray-300 mb-3">
                            Turn your video into an NFT and earn money when it goes viral!
                          </p>
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <DollarSign className="w-4 h-4" />
                            <span>Earn royalties from future sales</span>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Export Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export and Mint
                  </motion.button>
                </>)}

          {!connected && (
            <p className="text-center text-sm text-gray-400 mt-3">
              Connect wallet to mint as NFT
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ExportModal
