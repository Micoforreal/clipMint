
export interface TimelineClip {
  id: string
  mediaId: string
  startTime: number
  duration: number
  trimStart: number
  trimEnd: number
  track: number
}

export interface Project {
  id: string
  name: string
  timeline: TimelineClip[]
  width?: number;
    height?: number;
  framerate?: number;
  duration: number
}

export interface Source {
    track: number;
    element: HTMLVideoElement | HTMLAudioElement;
    inUse: boolean;
}

export interface Template {
  id: string
  name: string
  description: string
  format: string
  clips: TimelineClip[]
}



export interface MediaItem {
  sources: Source[]; // Source 0 should allways be present
  id?: string
  name?: string
  type?: 'video' | 'audio' | 'text'
  url?: string
  duration?: number
  file: File
  transcription?: string
   thumbnail?: string;
   
 
}


export interface Segment {
    media: MediaItem;
    start: number; // Global start
    duration: number;
    mediaStart: number;
    keyframes: KeyFrame[]; // Keyframe 0 should allways be present
    texture: WebGLTexture;
}

export interface KeyFrame {
    start: number; // Offset from segment start
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
    trimLeft?: number;
    trimRight?: number
    trimTop?: number;
    trimBottom?: number;
}

export interface SegmentID {
    index: number;
    track: number;
}

export interface MintData  {
  address: string;
  metaplexLink: string;
  solScanLink: string;
};

