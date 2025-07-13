export interface PotholeDetection {
  id: string;
  video_name: string;
  video_path: string;
  detection_count: number;
  confidence_avg: number;
  status: 'pending' | 'validated' | 'rejected';
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  detected_at: string;
  validated_at?: string;
  validated_by?: string;
  admin_notes?: string;
  frame_data: DetectionFrame[];
}

export interface DetectionFrame {
  frame_number: number;
  potholes: PotholeData[];
  timestamp: number;
}

export interface PotholeData {
  id: string;
  confidence: number;
  bbox: [number, number, number, number];
  contour_points: [number, number][];
  class_name: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}