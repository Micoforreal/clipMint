import { ChangeEvent, useState } from "react";
import styles from "./controls.module.css";
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Download, Scissors, Trash2Icon, Copy, ZoomIn, ZoomOut } from 'lucide-react'
import ExportModal from "./ExportModal";

export default function Controls(
    {
        playVideo,
        pauseVideo,
        isPlaying,
        currentTime,
        projectDuration,
        setCurrentTime,
        splitVideo,
        deleteSelectedSegment,
        setScaleFactor,
        scaleFactor
    }:
        {
            playVideo: any,
            pauseVideo: any,
            isPlaying: boolean,
            currentTime: number,
            projectDuration: number,
            splitVideo: any;
            setCurrentTime: (timestamp: number) => void,
            deleteSelectedSegment: any
            setScaleFactor: (scale: number) => void,
            scaleFactor: number
        }
) {

    const [showExportModal, setShowExportModal] = useState(false)
    const togglePlaying = () => {
        if (isPlaying) {
            pauseVideo();
        } else {
            playVideo();
        }
    };

    const increaseScale = () => {
        setScaleFactor(Math.min(1, scaleFactor * 1.2))
    }

    const decreaseScale = () => {
        setScaleFactor(Math.max(0.0001, scaleFactor * 0.8))
    }

    const onSeek = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentTime(+event.target.value * projectDuration);
    }

    const createSplit = () => {
        splitVideo(currentTime);
    };

    return (
        <div className={' border rounded-xl p-2 gap-1 flex  border-purple-500/20'}>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentTime(0)}
                className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300"
            >
                <SkipBack className="w-4 h-4" />
            </motion.button>


            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlaying}
                className="p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
            >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                // onClick={() => setCurrentTime(project.duration)}
                className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300"
            >
                <SkipForward className="w-4 h-4" />
            </motion.button>


            <div className="flex ms-auto">

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={decreaseScale}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-300"
                >
                    <ZoomOut className="w-4 h-4" />

                </motion.button>





                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={increaseScale}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-300"
                >
                    <ZoomIn className="w-4 h-4" />

                </motion.button>




                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={createSplit}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-300"
                >
                    <Scissors className="w-4 h-4" />

                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={deleteSelectedSegment}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300"
                >
                    <Trash2Icon className="w-4 h-4" />

                </motion.button>

            </div>
        



           

        </div>
    );
}
