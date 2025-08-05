export interface LoopTrainerSession {
  id: string;
  user_id: string;
  youtube_url: string;
  video_title: string | null;
  start_time_sec: number;
  end_time_sec: number;
  playback_speed: number;
  pitch_shift: number;
  loop_count: number;
  total_practice_time: number;
  session_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoopTrainerFormData {
  youtube_url: string;
  video_title?: string;
  start_time_sec: number;
  end_time_sec: number;
  playback_speed: number;
  pitch_shift: number;
  session_notes?: string;
}

export interface YouTubePlayerState {
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
}

export interface LoopTrainerControls {
  isLooping: boolean;
  hasLooped: boolean;
  loopCount: number;
  startTime: number;
  endTime: number;
  speed: number;
  pitch: number;
}