import os
import json
from web3 import Web3
from datetime import datetime
from ultralytics import YOLO
import cv2
import numpy as np
import cvzone
from dotenv import load_dotenv

load_dotenv()

class PotholeDetectionService:
    def __init__(self):
        self.model = YOLO("best.pt")  # or "yolov8s-seg.pt" for general model
        self.class_names = self.model.names
        
        # Initialize Web3 (optional for backend processing)
        rpc_url = os.environ.get("ETHEREUM_RPC_URL")
        if rpc_url:
            self.w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    def process_video(self, video_path, location_data=None):
        """Process video and return detection results"""
        cap = cv2.VideoCapture(video_path)
        frame_count = 0
        total_detections = 0
        confidence_scores = []
        
        while True:
            ret, img = cap.read()
            if not ret:
                break

            frame_count += 1
            if frame_count % 3 != 0:  # Process every 3rd frame
                continue

            img = cv2.resize(img, (1020, 500))
            h, w, _ = img.shape

            results = self.model.predict(img)
            frame_detections = 0

            for r in results:
                boxes = r.boxes
                masks = r.masks

                if masks is not None:
                    masks = masks.data.cpu()
                    for seg, box in zip(masks.numpy(), boxes):
                        seg = cv2.resize(seg, (w, h))
                        contours, _ = cv2.findContours(
                            (seg).astype(np.uint8), 
                            cv2.RETR_EXTERNAL, 
                            cv2.CHAIN_APPROX_SIMPLE
                        )

                        for contour in contours:
                            class_id = int(box.cls)
                            class_name = self.class_names[class_id]
                            confidence = float(box.conf[0]) if box.conf is not None else 0.0

                            if confidence > 0.5:  # Only count high-confidence detections
                                frame_detections += 1
                                confidence_scores.append(confidence)

            total_detections += frame_detections

        cap.release()
        
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        return {
            'detection_count': total_detections,
            'confidence_avg': avg_confidence,
            'processed_frames': frame_count // 3
        }

if __name__ == "__main__":
    service = PotholeDetectionService()
    
    # Example usage
    video_path = "/path/to/your/video.mp4"
    results = service.process_video(video_path)
    print(f"Detection Results: {results}")