import styles from "./mediaPool.module.css";
import React, { useState } from 'react';
import { MediaItem } from "../types";
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { li } from "framer-motion/m";
import { Music, Plus, Trash2, Upload } from "lucide-react";
import { motion } from 'framer-motion'
const options = {
    types: [
        {
            accept: {
                'videos/*': ['.mp4', '.mov', '.wmv', '.avi', '.flv'],
                'images/*': ['.jpg', '.png', '.gif', '.jpeg'],
                'audio/*': ['.mp3', '.wav', '.aac', '.flac']
            }
        },
    ],
    multiple: true,
    excludeAcceptAllOption: true
};

export default function MediaLibrary(props: any) {
    const [status, setStatus] = useState<string>('');
    const [draggedOn, setDraggedOn] = useState<String>("");



    const listItems = props.mediaList.map((item: MediaItem, index: number) => {
        // if (!item) {
        //     return null
        // }
        return (
            <Draggable key={item.file.name} draggableId={item.file.name} index={index}>
                {(provided) => (
                    <li className={` flex p-3 gap-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors`}
                        // key={item.file.name}
                        ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                    >

                        {item.type === 'audio' && <Music className="w-5 h-5 text-purple-400" />}
                        {item.type === 'video' && (<img className={'w-10 h-5 rounded'} src={item.thumbnail} alt={item.file.name} />)}
                        {/* {console.log(item)} */}
                        <p className={styles.cardCaption}>{item.file.name}</p>


                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => props.deleteVideo(item)}
                            className="p-1 ms-auto rounded text-red-400 hover:bg-red-500/20"
                        >
                            <Trash2 className="w-4 h-4" />
                        </motion.button>

                    </li >
                )
                }
            </Draggable >
        );
        // }
    });




    const onClick = async () => {
        try {
            const files: File[] = [];
            //@ts-ignore
            const Handle = await window.showOpenFilePicker(options);
            setStatus('Loading...');
            for (const entry of Handle) {
                let file = await entry.getFile();
                files.push(file);
            }
            await props.addVideo(files);
            setStatus('');
        } catch (error) {
            console.log(error);
        }
    }

    const onDrag = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggedOn("");
        if (!e.dataTransfer) return;
        const files: File[] = [];

        for (const item of Object.values(e.dataTransfer.items)) {
            const file = item.getAsFile();

            if (file !== null && (file.type.includes('video/') || file.type.includes('image/') || file.type.includes('audio/'))) files.push(file);
            else alert(`Could not upload file: ${file?.name}. file type not accepted `);
        }
        await props.addVideo(files);
        setStatus('');
    }

    return (
        <div
            onDragOver={(e) => { e.stopPropagation(); e.preventDefault(); setDraggedOn('draggedOn'); }}
            onDragEnter={(e) => { e.stopPropagation(); e.preventDefault(); setDraggedOn('draggedOn'); }}
            onDragLeave={(e) => { e.stopPropagation(); e.preventDefault(); setDraggedOn(""); }}
            onDrop={onDrag}
            className={` h-[400px]   ${draggedOn}`}
        >
            <div className={styles.hbox}>
                <h2 className={'text-lg font-semibold mb-4 text-purple-300'}>Media Library</h2>
                <button
                    className={" rounded-full  w-7 h-7  text-purple-400"}
                    onClick={onClick}
                    title="Add files"
                >
                    <Plus className="w-full h-full  " />
                </button>
            </div>


            <div className={""} >

                <Droppable droppableId="card"  >
                    {
                        (provided) => (
                            <ul className="card overflow-y-auto  scrollbar-thumb-rounded-full scrollbar-track-rounded-full  scrollbar-thin scrollbar-thumb-purple-950 scrollbar-track-transparent  max-h-[340px] w-full flex flex-col gap-4  min-h-200px " {...provided.droppableProps} ref={provided.innerRef}>
                                {/* {console.log(listItems) } */}
                                {listItems.length > 0 ? listItems :
                                    (

                                        <motion.div

                                            whileHover={{ scale: 1.02 }}
                                            className={`border-2 w-[95%] mx-auto border-dashed rounded-lg p-6 my-8 cursor-pointer transition-colors
                                        border-purple-500/30 bg-purple-500/5'
                                        `}
                                        >

                                            <div className="text-center py-10">
                                                {/* <Upload className="w-8 h-8 mx-auto mb-2 text-purple-400" /> */}
                                                <p className="text-sm text-gray-300">
                                                    {'Drag & drop to upload'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Video & Audio files</p>
                                            </div>
                                        </motion.div>
                                    )

                                }
                                {provided.placeholder}
                            </ul>
                        )}
                </Droppable>
            </div>


            <p className={styles.loader}>{status}</p>
        </div>
    )
}