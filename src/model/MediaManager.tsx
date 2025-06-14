import { useContext, useEffect, useRef, useState } from "react";
import { calculateProperties } from "../utils/utils";
// import PlaybackController from "./playbackController";
import { MediaItem, Project, Segment, SegmentID, Source } from "../types";
import { WebGLRenderer } from "./webgl";
import VideoEditor from "../components/VideoEditor";
import { LoadingContext } from "../context/loadingContext";
// import VideoEditor from "./VideoEditor";

















function PlaybackController(props: {
  setProjects: (projects: Project[]) => void;
  projects: Project[];
  
  project: Project[]

  projectUser: string;
  setProjectUser: (user: string) => void;
  canvasRef: HTMLCanvasElement;
  mediaList: MediaItem[];
  setMediaList: (mediaList: MediaItem[]) => void;
  trackList: Segment[][];
  setTrackList: (segments: Segment[][]) => void;
  addVideo: (file: File[]) => void;
  deleteVideo: (media: MediaItem) => void;
  renderer: WebGLRenderer;
  dragAndDrop: (media: MediaItem) => void;
  setSelectedSegment: (selected: SegmentID | null) => void;
  selectedSegment: SegmentID | null;
  updateSegment: (id: SegmentID, segment: Segment) => void;
  splitVideo: (timestamp: number) => void;
  deleteSelectedSegment: () => void;
  projectWidth: number;
  projectHeight: number;
  projectFramerate: number;
  projectDuration: number;
  projectId: string;
  setProjectId: (id: string) => void;
  setProjectDuration: (duration: number) => void;
}) {

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isRecordingRef = useRef(false);
  const [currentTime, _setCurrentTime] = useState<number>(0);
  const trackListRef = useRef(props.trackList);
  const playbackStartTimeRef = useRef(0);
  const lastPlaybackTimeRef = useRef(0);
  const projectDurationRef = useRef(0);
  const mediaListRef = useRef<MediaItem[]>([]);
  const isPlayingRef = useRef(false);
  const [projectFile,setProjectFile]= useState<File | undefined>()
  const SKIP_THREASHOLD = 100;
  let recordedChunks: Array<any>;
  const mediaRecorderRef = useRef<MediaRecorder>(null);

  trackListRef.current = props.trackList;
  projectDurationRef.current = props.projectDuration;
  mediaListRef.current = props.mediaList;
  isPlayingRef.current = isPlaying;

  const setCurrentTime = (timestamp: number) => {
    lastPlaybackTimeRef.current = timestamp;
    playbackStartTimeRef.current = performance.now();
    _setCurrentTime(timestamp);
    if (!isPlayingRef.current) renderFrame(false);
  };

  useEffect(() => {
    if (!isPlayingRef.current) renderFrame(false);
  }, [props.trackList]);

  useEffect(() => {
    if (currentTime > props.projectDuration)
      setCurrentTime(props.projectDuration);
  }, [props.projectDuration]);

  const renderFrame = async (update: boolean) => {
    let curTime =
      performance.now() -
      playbackStartTimeRef.current +
      lastPlaybackTimeRef.current;
    if (!update) curTime = lastPlaybackTimeRef.current;
    if (curTime >= projectDurationRef.current)
      curTime = projectDurationRef.current;
    _setCurrentTime(curTime);

    for (const media of mediaListRef.current) {
      for (const source of media.sources) {
        source.inUse = false;
      }
    }

    let segments: Segment[] = [];
    let elements: (HTMLVideoElement | HTMLAudioElement)[] = [];

    let needsSeek = false;

    for (let i = trackListRef.current.length - 1; i >= 0; i--) {
      for (let j = 0; j < trackListRef.current[i].length; j++) {
        const segment = trackListRef.current[i][j];
        if (
          curTime >= segment.start &&
          curTime < segment.start + segment.duration
        ) {
          let source = segment.media.sources.find(
            (source) => source.track === i
          ) as Source;
          source.inUse = true;
          let mediaTime = curTime - segment.start + segment.mediaStart;
          if (
            Math.abs(source.element.currentTime * 1000 - mediaTime) >
            SKIP_THREASHOLD ||
            source.element.paused
          )
            needsSeek = true;
          segments.push(segment);
          // if (source.element instanceof HTMLVideoElement) {

          elements.push(source.element);
          // }
        }
      }
    }

    for (const media of mediaListRef.current) {
      for (const source of media.sources) {
        if (!source.inUse) {
          source.element.pause();
          source.inUse = true;
        }
      }
    }

    if (needsSeek) {
      if (isRecordingRef.current) {
        if (mediaRecorderRef.current != null) mediaRecorderRef.current.pause();
      }
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        elements[i].pause();
        let mediaTime = (curTime - segment.start + segment.mediaStart) / 1000;

        if (elements[i].currentTime !== mediaTime) {
          await new Promise<void>((resolve, reject) => {
            elements[i].onseeked = () => resolve();
            elements[i].currentTime = mediaTime;
          });
        }
      }
      try {
        await Promise.allSettled(elements.map((element) => element.play()));
      } catch (error) { }
      lastPlaybackTimeRef.current = curTime;
      playbackStartTimeRef.current = performance.now();
      if (isRecordingRef.current) {
        if (mediaRecorderRef.current != null) mediaRecorderRef.current.resume();
      }
    }

    props.renderer.drawSegments(
      segments,
      elements.filter((el) => el instanceof HTMLVideoElement),
      curTime);

    if (!isPlayingRef.current) {
      for (const element of elements) {
        element.pause();
      }
      return;
    }

    if (curTime === projectDurationRef.current) {
      pause();
      if (isRecordingRef.current) {
        if (mediaRecorderRef.current != null) mediaRecorderRef.current.stop();
        isRecordingRef.current = false;
      }
      return;
    }

    (setTimeout(() => {
      renderFrame(true);
    }, 1 / props.projectFramerate) as unknown) as number;
  };

  const play = async () => {
    if (currentTime >= projectDurationRef.current) return;

    setIsPlaying(true);
    lastPlaybackTimeRef.current = currentTime;
    playbackStartTimeRef.current = performance.now();
    isPlayingRef.current = true;

    renderFrame(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  function Render() : Promise<File | undefined> |undefined {
    let canvas: HTMLCanvasElement | null = props.canvasRef;

    // Optional frames per second argument.
    if (canvas != null) {
        return new Promise<File | undefined>((resolve, reject) => {

      try {
        
        
        
        let stream = canvas.captureStream(props.projectFramerate);
        recordedChunks = [];
        let options = { mimeType: "video/webm; codecs=vp9" };
        mediaRecorderRef.current = new MediaRecorder(stream, options);
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const file :File = new File([blob], "project.webm", { type: "video/webm" });
          setProjectFile(file)
            resolve(file); 
          
        }
        
        
        
        setCurrentTime(0);
        isRecordingRef.current = true;
        mediaRecorderRef.current.start();
        setIsPlaying(true);
        renderFrame(true);
     
          
          
          
    
      } catch (error) {
        console.log(error)
        
      }

        });
    }
  
    
    
    

}
  
  function handleDataAvailable(event: any) {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  }

  function download() {
    var blob = new Blob(recordedChunks, {
      type: "video/mp4",
    });
   
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = "project.mp4";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <VideoEditor
      {...props}
      projectFile={projectFile}
      render={Render}
      playVideo={play}
      pauseVideo={pause}
      isPlaying={isPlaying}
      currentTime={currentTime}
      setCurrentTime={setCurrentTime}


    />
  );
}
















const MediaManager = () => {

  const [projects, setProjects] = useState<Project[]>([{
    id: "eoeino48h8h48h84",
    name: 'project1',
    // framerate: 30,
    timeline: [],
    duration: 200
  }]);
  const [currentProject, setCurrentProject] = useState<number>(0);
  const [projectUser, setProjectUser] = useState<string>("mylo");
  const [projectId, setProjectId] = useState<string>("1");
  const [projectName, setProjectName] = useState<string>("");
  const [projectWidth, setProjectWidth] = useState<number>(1920);
  const [projectHeight, setProjectHeight] = useState<number>(1080);
  const [projectFramerate, setProjectFramerate] = useState<number>(30);



  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [trackList, setTrackList] = useState<Segment[][]>([[]]);
  const [selectedSegment, setSelectedSegment] = useState<SegmentID | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement>(document.createElement("canvas"));
  const [renderer, setRenderer] = useState<WebGLRenderer>(new WebGLRenderer(canvasRef, projectWidth, projectHeight));

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isRecordingRef = useRef(false);
  const [currentTime, _setCurrentTime] = useState<number>(0);
  const trackListRef = useRef(trackList);
  const playbackStartTimeRef = useRef(0);
  const lastPlaybackTimeRef = useRef(0);
  const projectDurationRef = useRef(0);
  const mediaListRef = useRef<MediaItem[]>([]);
  const isPlayingRef = useRef(false);
  const [projectDuration, setProjectDuration] = useState<number>(0);




  useEffect(() => {
    canvasRef.width = projectWidth;
    canvasRef.height = projectHeight;
  }, [canvasRef, projectHeight, projectWidth]);

  useEffect(() => {
    let duration = 0;
    for (const track of trackList) {
      if (track.length === 0) continue;
      duration = Math.max(duration, track[track.length - 1].start + track[track.length - 1].duration);
    }

    setProjectDuration(duration);
  }, [trackList]);

  const thumbnailCanvas = document.createElement("canvas");
  const thumbnailCanvasContext = thumbnailCanvas.getContext("2d") as CanvasRenderingContext2D;

  const generateThumbnail = async (file: File) => {
    let elm: any;
    const isVideo = file.type.startsWith("video");
    const isAudio = file.type.startsWith("audio");

    if (isVideo) {
      elm = document.createElement("video") as HTMLVideoElement;
    } else if (isAudio) {
      elm = document.createElement("audio") as HTMLAudioElement;
    } else {
      throw new Error("Unsupported file type");
    }

    elm.preload = "auto";
    elm.src = URL.createObjectURL(file);

    // Wait for media to load
    await new Promise<void>((resolve, reject) => {
      elm.onloadeddata = () => resolve();
      elm.onerror = () => reject(new Error("Failed to load media"));
    });

    // If video, capture a frame for the thumbnail
    let thumbnail = "";
    if (isVideo) {
      thumbnailCanvas.width = elm.videoWidth;
      thumbnailCanvas.height = elm.videoHeight;
      thumbnailCanvasContext.drawImage(
        elm,
        0,
        0,
        elm.videoWidth,
        elm.videoHeight
      );
      thumbnail = thumbnailCanvas.toDataURL();
    }

    const media: MediaItem = {
      sources: [{ track: 0, element: elm, inUse: false }],
      file: file,
      type: isVideo ? "video" : "audio",
      thumbnail: thumbnail, // empty string if it's audio
    };

    return media;
  };



  const addVideo = async (files: File[]) => {
    let uniqueFiles: File[] = [];
    let found = false;
    for (let file of files) {
      for (let i = 0; i < mediaList.length; i++) {
        if (mediaList[i].file.name === file.name) {
          found = true;
          break;
        }
      }
      if (found) continue;
      uniqueFiles.push(file);
    }

    let filesList: MediaItem[] = [];

    for (let file of uniqueFiles) {

      filesList.push(await generateThumbnail(file));
    }


    setMediaList([...mediaList, ...filesList]);

    console.log("Sucessfully Loaded Segment Thumbnail!");
    return;
  }

  const dragAndDrop = (media: MediaItem) => {
    if (renderer == null) return;
    let segment: Segment = {
      media: media,
      start: 0,
      duration: media.sources[0].element.duration * 1000,
      mediaStart: 0,
      texture: renderer.createTexture(),
      keyframes: [
        {
          start: 0,
          x: 0,
          y: 0,
          trimRight: 0,
          trimLeft: 0,
          trimTop: 0,
          trimBottom: 0,
          scaleX: 1.0,
          scaleY: 1.0,
        },
      ]
    };

    let newElement = media.sources[0].element.cloneNode() as HTMLVideoElement;
    newElement.pause();

    if (trackList[trackList.length - 1].length === 0) {
      if (!media.sources.find(source => source.track === trackList.length - 1))
        media.sources.push({ track: trackList.length - 1, element: newElement, inUse: false });
      setTrackList([...trackList.slice(0, trackList.length - 1), [segment], []]);
    } else {
      media.sources.push({ track: trackList.length, element: newElement, inUse: false });
      setTrackList([...trackList, [segment], []]);
    }
  }

  const deleteVideo = (media: MediaItem) => {
    for (const source of media.sources) {
      source.element.pause();
    }

    if (selectedSegment && trackList[selectedSegment.track][selectedSegment.index].media === media) setSelectedSegment(null);
    setMediaList(mediaList.filter(item => item !== media));

    let newTrackList = trackList.map(track => track.filter(segment => segment.media !== media));

    // Clean Tracklist
    while (newTrackList.length > 0 && newTrackList[newTrackList.length - 1].length === 0) newTrackList.pop();
    newTrackList.push([]);

    setTrackList(newTrackList);
  }

  const deleteSelectedSegment = () => {
    if (selectedSegment === null) return;

    for (const source of trackList[selectedSegment.track][selectedSegment.index].media.sources) {
      source.element.pause();
    }

    let newTrackList = [
      ...trackList.slice(0, selectedSegment.track),
      [...trackList[selectedSegment.track].slice(0, selectedSegment.index), ...trackList[selectedSegment.track].slice(selectedSegment.index + 1)],
      ...trackList.slice(selectedSegment.track + 1)
    ];

    // Clean Tracklist
    while (newTrackList.length > 0 && newTrackList[newTrackList.length - 1].length === 0) newTrackList.pop();
    newTrackList.push([]);

    setTrackList(newTrackList);
    setSelectedSegment(null);
  }

  const split = (timestamp: number) => {

    if (selectedSegment === null) return;

    const segment = trackList[selectedSegment.track][selectedSegment.index];

    if (segment.start > timestamp || segment.start + segment.duration < timestamp) return;

    // Find index of current keyframe at timestamp
    // There is always at least 1 keyframe in a segment

    let segmentTimeCut = timestamp - segment.start;
    let lenKeyframes = segment.keyframes.length;
    let keyFrameIndex = 0;
    for (let i = 1; i < lenKeyframes; i++) {
      let checkKeyframe = segment.keyframes[i];
      if (checkKeyframe.start > segmentTimeCut) {
        break;
      }
      keyFrameIndex = i;
    }

    let interpKeyFrame = calculateProperties(segment, timestamp);

    // Remove remaining keyframes from split segment
    let leftSegmentKeyFrames = segment.keyframes.slice(0, keyFrameIndex + 1);
    // Move remaining keyframes to new split segment
    let rightSegmentKeyFrames = segment.keyframes.slice(keyFrameIndex + 1, lenKeyframes);

    // Edit new keyframes to new offset
    for (let i = 0; i < rightSegmentKeyFrames.length; i++) {
      rightSegmentKeyFrames[i].start -= segmentTimeCut;
    }

    // Add interpolated keyframe at the end of the selected split segement
    let newInterpKeyFrame = {
      ...interpKeyFrame,
      start: segmentTimeCut - 1 / projectFramerate
    };
    leftSegmentKeyFrames.push(newInterpKeyFrame);

    setTrackList([
      ...trackList.slice(0, selectedSegment.track),
      [
        ...trackList[selectedSegment.track].slice(0, selectedSegment.index),
        {
          ...trackList[selectedSegment.track][selectedSegment.index], duration: timestamp - segment.start,
          keyframes: leftSegmentKeyFrames
        },
        {
          media: segment.media,
          start: timestamp,
          duration: segment.start + segment.duration - timestamp,
          mediaStart: timestamp - segment.start + segment.mediaStart,
          texture: segment.texture,
          keyframes: [interpKeyFrame].concat(rightSegmentKeyFrames)
        },
        ...trackList[selectedSegment.track].slice(selectedSegment.index + 1)
      ],
      ...trackList.slice(selectedSegment.track + 1)
    ]);
  }




  const updateSegment = (id: SegmentID, newSegment: Segment) => {
    setTrackList([
      ...trackList.slice(0, id.track),
      [...trackList[id.track].slice(0, id.index), newSegment, ...trackList[id.track].slice(id.index + 1)],
      ...trackList.slice(id.track + 1)
    ]);
  }





  return (
    <>
      <PlaybackController
        // {...props}

        dragAndDrop={dragAndDrop}
        mediaList={mediaList}
        setMediaList={setMediaList}
        trackList={trackList}
        setTrackList={setTrackList}
        addVideo={addVideo}
        deleteVideo={deleteVideo}
        deleteSelectedSegment={deleteSelectedSegment}
        renderer={renderer}
        selectedSegment={selectedSegment}
        setSelectedSegment={setSelectedSegment}
        updateSegment={updateSegment}
        projectDuration={projectDuration}
        setProjectDuration={setProjectDuration}
        // playVideo={play}
        // pauseVideo={pause}
        // isPlaying={isPlaying}
        // currentTime={currentTime}
        // setCurrentTime={setCurrentTime}
        splitVideo={split}
        projectId={projectId}
        setProjectId={setProjectId}
        projectUser={projectUser}
        setProjectUser={setProjectUser}
        projects={projects}
        project={projects}
        setProjects={setProjects}
        projectHeight={projectHeight}
        projectFramerate={projectFramerate}
        projectWidth={projectWidth}
        canvasRef={canvasRef}

      />
    </>
  );



}



export default MediaManager















