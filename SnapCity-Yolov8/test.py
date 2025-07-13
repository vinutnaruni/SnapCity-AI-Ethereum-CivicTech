from ultralytics import YOLO
import cv2
import numpy as np
import cvzone

# Load a trained segmentation model
model = YOLO("/Users/vinutnaruni/Desktop/yolov8-roadpothole-detection-main/best.pt")
class_names = model.names

# Load the test video
cap = cv2.VideoCapture('/Users/vinutnaruni/Desktop/yolov8-roadpothole-detection-main/p.mp4')
frame_count = 0

while True:
    ret, img = cap.read()
    if not ret:
        break

    frame_count += 1
    if frame_count % 3 != 0:
        continue

    img = cv2.resize(img, (1020, 500))
    h, w, _ = img.shape

    results = model.predict(img)
    pothole_count = 0

    for r in results:
        boxes = r.boxes
        masks = r.masks

        if masks is not None:
            masks = masks.data.cpu()
            for seg, box in zip(masks.numpy(), boxes):
                seg = cv2.resize(seg, (w, h))
                contours, _ = cv2.findContours((seg).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

                for contour in contours:
                    class_id = int(box.cls)
                    class_name = class_names[class_id]
                    confidence = float(box.conf[0]) if box.conf is not None else 0.0

                    x, y, x1, y1 = cv2.boundingRect(contour)
                    cv2.polylines(img, [contour], True, color=(0, 0, 255), thickness=2)
                    cv2.putText(
                        img, f"{class_name} {confidence:.2f}", (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2
                    )

                    pothole_count += 1

    # Draw total pothole count
    cv2.putText(
        img, f"Potholes Detected: {pothole_count}", (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2
    )

    cv2.imshow('Pothole Detection', img)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
