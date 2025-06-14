import { useRef, useEffect, JSX, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Project } from '../types'

interface Props {
  project: Project
  canvasRef: HTMLCanvasElement;

}

const VideoPreview = ({ project, canvasRef }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {


    canvasRef.classList.add('canvas');
    ref.current?.appendChild(canvasRef);

  }, []);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="h-ful flex items-center justify-center px-4"
    >
      <div ref={ref} className=" mx-auto max-w-2xl  w-full aspect-video bg-black rounded-lg border border-purple-500/30 overflow-hidden shadow-2xl">


      </div>
    </motion.div>
  )
}

export default VideoPreview
