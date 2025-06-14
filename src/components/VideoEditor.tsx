import { useState } from 'react'
import { motion } from 'framer-motion'
import MediaLibrary from './MediaLibrary'
import Timeline from './Timeline'
import VideoPreview from './VideoPreview'
import ToolPanel from './ToolPanel'
import ExportModal from './ExportModal'
import { MediaItem, Project, Segment, SegmentID } from '../types'
import { DragDropContext } from 'react-beautiful-dnd';
import { WebGLRenderer } from "../model/webgl";
import Controls from './controls'
import { Download, Menu, X } from 'lucide-react'





const VideoEditor = (props: {

  canvasRef: HTMLCanvasElement,
  mediaList: MediaItem[],
  setMediaList: (mediaList: MediaItem[]) => void,
  trackList: Segment[][],
  setTrackList: (segments: Segment[][]) => void,
  addVideo: (file: File[]) => void,
  deleteVideo: (media: MediaItem) => void,
  playVideo: () => void,
  pauseVideo: () => void,
  // projectWidth: number,
  projectFile: File | undefined,
  render: () => void,
  renderer: WebGLRenderer,
  // projectFramerate: number,

  projectDuration: number,
  isPlaying: boolean,
  currentTime: number,
  setProjectDuration: (duration: number) => void;
  setCurrentTime: (timestamp: number) => void,
  dragAndDrop: (media: MediaItem) => void,
  selectedSegment: SegmentID | null,
  setSelectedSegment: (selected: SegmentID | null) => void,
  updateSegment: (id: SegmentID, segment: Segment) => void,
  splitVideo: (timestamp: number) => void,
  deleteSelectedSegment: () => void,
  projectId: string,
  setProjectId: (id: string) => void,
  projectUser: string,
  setProjectUser: (user: string) => void,
  project: Project[]

}
) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [showExportModal, setShowExportModal] = useState(false)
  const [scaleFactor, setScaleFactor] = useState<number>(0.1);
  const [showMenu, setShowMenu] = useState(false);

  const addMediaItem = (item: MediaItem) => {
    setMediaItems(prev => [...prev, item])
  }

  const removeMediaItem = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id))
  }




  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;



    // for re-ordering files in the media pool
    if (source.droppableId === destination.droppableId) {
      const items = props.mediaList.slice();
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      props.setMediaList(items);
    }
    else {
      props.dragAndDrop(props.mediaList[result.source.index]);
      const items = props.mediaList.slice();
      props.setMediaList(items);
    }
  }


  return (


    <DragDropContext onDragEnd={handleOnDragEnd}>
      {/* Left Panel - Media Library & Tools */}

      <div


        className='flex    h-screen  -[calc(100vh-80px)]'>


        <button
          onClick={() => { setShowMenu(true) }}
          className='absolute md:hidden text-purple-400 flex my-4 px-2 '>
          <Menu />
        </button>
        <div


          className={`w-80  ${showMenu ? "" : "md:block hidden"} md:static absolute z-50 pointer-events- border-purple-5 bg-black/50 backdrop-blur-sm`}
        >


          <button
            onClick={() => { setShowMenu(false) }}
            className=' md:hidden text-purple-400  mt-2 px-2'>
            <X />
          </button>



          <div className='overflow-y-auto    scrollbar-thumb-rounded-full scrollbar-track-rounded-full  scrollbar-thin scrollbar-thumb-purple-950 scrollbar-track-transparent  p-2 h-full '>

            <div className=" border-b p-4 border-purple-500/20">
              <MediaLibrary
                mediaList={props.mediaList}
                setMediaList={props.setMediaList}
                addVideo={props.addVideo}
                deleteVideo={props.deleteVideo}
              />
            </div>
            <div className="">
              <ToolPanel
                selectedTool={selectedTool}
                onToolSelect={setSelectedTool}
              />
            </div>
          </div>
        </div>
        {/* Center - Video Preview */}
        <div


          className=" flex flex-col mx-auto bord md:w-[75%] w-[100%] "
        >
          <div className="flex-1 p-4">
            <VideoPreview

              canvasRef={props.canvasRef}
              project={props.project[0]} />
          </div>

          {/* Timeline */}
          <div className="h  bg-black/30 kdrop-blur-sm">
            {/* <Timeline 
            project={project}
            onProjectUpdate={setProject}
            mediaItems={mediaItems}
            onExport={() => setShowExportModal(true)}
            /> */}
            <Controls
              playVideo={props.playVideo}
              pauseVideo={props.pauseVideo}
              isPlaying={props.isPlaying}
              currentTime={props.currentTime}
              projectDuration={props.projectDuration}
              setCurrentTime={props.setCurrentTime}
              deleteSelectedSegment={props.deleteSelectedSegment}
              splitVideo={props.splitVideo}
              setScaleFactor={setScaleFactor}
              scaleFactor={scaleFactor}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => { setShowExportModal(true), props.render() }}

              className="flex flex-col items-center absolute right-[2%] md:top-110  top-78 gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
            >
              <Download className="w-4 h-4" />

            </motion.button>


            <Timeline
              trackList={props.trackList}
              projectDuration={props.projectDuration}
              selectedSegment={props.selectedSegment}
              setSelectedSegment={props.setSelectedSegment}
              currentTime={props.currentTime}
              setCurrentTime={props.setCurrentTime}
              updateSegment={props.updateSegment}
              scaleFactor={scaleFactor}
              setTrackList={props.setTrackList}

            />
          </div>
        </div>
      </div>

      {showExportModal && (
        <ExportModal
        project={props.projectFile}
          render={props.render}
          
          onClose={() => setShowExportModal(false)}
        />
      )}
    </DragDropContext>
  )
}

export default VideoEditor
