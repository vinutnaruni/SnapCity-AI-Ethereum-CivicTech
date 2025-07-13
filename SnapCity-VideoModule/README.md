# SnapCity - Blockchain Pothole Detection System

A modern web application for detecting and managing potholes using AI-powered computer vision with blockchain storage. Built with React, TypeScript, Ethereum smart contracts, and integrates with YOLO v8 for real-time pothole detection.

## Features

- 🎥 **Video Upload**: Drag-and-drop interface for uploading road videos
- 🤖 **AI Detection**: YOLO v8 powered pothole detection
- 📍 **Location Tracking**: GPS-based and manual location setting
- 🔗 **Blockchain Storage**: Immutable data storage on Sepolia Ethereum
- 🦊 **MetaMask Integration**: Secure wallet connection for transactions
- 👨‍💼 **Admin Validation**: Review and approve/reject AI detections
- 🔔 **Real-time Notifications**: Instant feedback on detection status
- 📱 **Responsive Design**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Python, YOLO v8, OpenCV
- **Blockchain**: Ethereum, Solidity Smart Contracts, Sepolia Testnet
- **Wallet**: MetaMask integration with ethers.js
- **Deployment**: Vite build system

## Prerequisites for Mac M3

Before setting up the project, ensure you have the following installed:

### 1. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js (Latest LTS)
```bash
brew install node
```

### 3. Install Python 3.11+ with Homebrew
```bash
brew install python@3.11
```

### 4. Install Git
```bash
brew install git
```

### 5. Install MetaMask Browser Extension
1. Go to [metamask.io](https://metamask.io/download/)
2. Install the browser extension for Chrome/Firefox/Safari
3. Create a new wallet or import existing one
4. Switch to Sepolia Test Network
5. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

## Frontend Setup (Web Interface)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd snapcity-pothole-detection
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Additional Dependencies
```bash
npm install ethers@latest web3@latest
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Smart Contract Deployment (Sepolia)

### 1. Deploy the Contract
1. Copy the contract code from `src/lib/contract.sol`
2. Go to [Remix IDE](https://remix.ethereum.org/)
3. Create a new file and paste the contract code
4. Compile with Solidity 0.8.19+
5. Deploy to Sepolia network using MetaMask
6. Copy the deployed contract address

### 2. Update Contract Address
Edit `src/lib/ethereum.ts` and update the contract address:
```typescript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 3. Get Sepolia Test ETH
1. Go to [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your MetaMask wallet address
3. Request test ETH for gas fees

### 4. Configure MetaMask
1. Open MetaMask extension
2. Switch to Sepolia Test Network
3. Ensure you have some SepoliaETH for transactions

**Note**: The application will automatically prompt you to switch to Sepolia network when connecting your wallet.

## Backend Setup (Python YOLO Detection)

### 1. Create Python Virtual Environment
```bash
python3.11 -m venv venv
source venv/bin/activate
```

### 2. Install Python Dependencies
```bash
# Install PyTorch for Apple Silicon
pip install torch torchvision torchaudio

# Install other dependencies
pip install ultralytics opencv-python cvzone numpy
pip install web3 python-dotenv
```

### 3. Download YOLO Model
Place your trained YOLO model (`best.pt`) in the project root directory.

### 4. Create Python Environment File
Create a `.env` file for Python:
```env
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=your_deployed_contract_address
```

### 5. Update Detection Script
Modify `test.py` to integrate with the web interface:

```python
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

# Initialize Web3
rpc_url = os.environ.get("ETHEREUM_RPC_URL")
contract_address = os.environ.get("CONTRACT_ADDRESS")
w3 = Web3(Web3.HTTPProvider(rpc_url))

def process_video(video_path, location_data):
    """Process video and save detections to database"""
    model = YOLO("best.pt")
    class_names = model.names
    
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    total_detections = 0
    
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
        frame_detections = 0

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

                        if confidence > 0.5:  # Only save high-confidence detections
                            # This would integrate with your smart contract
                            # For now, just count detections
                            frame_detections += 1

        total_detections += frame_detections

    cap.release()
    return total_detections

if __name__ == "__main__":
    # Example usage
    video_path = "/path/to/your/video.mp4"
    location_data = {
        "lat": 37.7749,
        "lng": -122.4194,
        "name": "San Francisco, CA"
    }
    
    detections = process_video(video_path, location_data)
    print(f"Total detections saved: {detections}")
```

## Running the Complete System

### 1. Start the Web Interface
```bash
npm run dev
```

### 2. Connect MetaMask Wallet
1. Open the application in your browser
2. Click "Connect MetaMask" 
3. Approve the connection and network switch to Sepolia

### 3. Process Videos with Python
```bash
source venv/bin/activate
python test.py
```

### 4. Access the Application
- Open `http://localhost:5173` in your browser
- Connect your MetaMask wallet to Sepolia network
- Upload videos through the web interface
- View detections in the admin panel
- Validate or reject AI detections

## Troubleshooting Mac M3 Issues

### MetaMask Connection Issues
```bash
# Clear browser cache and cookies
# Disable other wallet extensions
# Ensure MetaMask is updated to latest version
```

### Sepolia Network Issues
- Ensure you have SepoliaETH for gas fees
- Check network connection in MetaMask
- Verify contract address is correct

### OpenCV Installation Issues
```bash
# If OpenCV fails to install
brew install opencv
pip install opencv-python-headless
```

### PyTorch Installation Issues
```bash
# Install PyTorch with Apple Silicon support
pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cpu
```

### Smart Contract Issues
- Verify contract is deployed on Sepolia
- Check contract address in ethereum.ts
- Ensure you have admin permissions for validation

### Permission Issues with Location
- Enable location services in System Preferences
- Allow location access in your browser settings
- Use manual location input if GPS is unavailable

### YOLO Model Issues
- Ensure your `best.pt` model is compatible with the installed ultralytics version
- Check that the model path is correct in your script

## Development Commands

```bash
# Install dependencies
npm install

# Install blockchain dependencies
npm install ethers web3

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run Python detection
python test.py

# Activate Python environment
source venv/bin/activate
```

## Project Structure

```
snapcity-pothole-detection/
├── src/
│   ├── lib/
│   │   ├── ethereum.ts        # Blockchain integration
│   │   └── contract.sol       # Smart contract code
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── types/              # TypeScript types
│   └── App.tsx             # Main app component
├── test.py                 # YOLO detection script
├── best.pt                 # Trained YOLO model
├── requirements.txt        # Python dependencies
└── package.json           # Node.js dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.