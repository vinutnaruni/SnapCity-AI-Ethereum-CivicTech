# 🚀 SnapCity - Complete Setup Guide for Mac M3

## 📋 Table of Contents
1. [Prerequisites Installation](#prerequisites-installation)
2. [MetaMask Setup](#metamask-setup)
3. [Project Setup](#project-setup)
4. [Smart Contract Deployment](#smart-contract-deployment)
5. [Python Backend Setup](#python-backend-setup)
6. [Running the Application](#running-the-application)
7. [Testing the System](#testing-the-system)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites Installation

### Step 1: Install Homebrew (Package Manager)
Open Terminal and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, add Homebrew to your PATH:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Step 2: Install Node.js (Latest LTS)
```bash
brew install node
```

Verify installation:
```bash
node --version  # Should show v20.x.x or higher
npm --version   # Should show 10.x.x or higher
```

### Step 3: Install Python 3.11+
```bash
brew install python@3.11
```

Verify installation:
```bash
python3.11 --version  # Should show Python 3.11.x
```

### Step 4: Install Git
```bash
brew install git
```

### Step 5: Install Visual Studio Code
```bash
brew install --cask visual-studio-code
```

---

## 🦊 MetaMask Setup

### Step 1: Install MetaMask Browser Extension
1. Open your browser (Chrome, Firefox, or Safari)
2. Go to [metamask.io/download](https://metamask.io/download/)
3. Click "Install MetaMask for [Your Browser]"
4. Add the extension to your browser
5. Pin the MetaMask extension to your browser toolbar

### Step 2: Create or Import Wallet
1. Click the MetaMask extension icon
2. Choose "Create a new wallet" or "Import an existing wallet"
3. Follow the setup wizard
4. **IMPORTANT**: Save your seed phrase securely!

### Step 3: Add Sepolia Test Network
1. Open MetaMask
2. Click the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" or "Add a network manually"
4. Enter the following details:
   - **Network Name**: Sepolia Test Network
   - **New RPC URL**: `https://sepolia.infura.io/v3/`
   - **Chain ID**: `11155111`
   - **Currency Symbol**: `SepoliaETH`
   - **Block Explorer URL**: `https://sepolia.etherscan.io`
5. Click "Save"
6. Switch to the Sepolia network

### Step 4: Get Test ETH
1. Copy your wallet address from MetaMask
2. Go to [sepoliafaucet.com](https://sepoliafaucet.com/)
3. Paste your address and request test ETH
4. Wait for the transaction to complete (usually 1-2 minutes)
5. Verify you have SepoliaETH in your MetaMask wallet

---

## 💻 Project Setup

### Step 1: Open Project in VS Code
1. Open Terminal
2. Navigate to your desired directory:
   ```bash
   cd ~/Desktop  # or wherever you want the project
   ```
3. If you have the project files, navigate to the project directory:
   ```bash
   cd snapcity-pothole-detection
   ```
4. Open in VS Code:
   ```bash
   code .
   ```

### Step 2: Install Project Dependencies
In VS Code, open the integrated terminal (`Terminal` → `New Terminal`) and run:

```bash
# Install all required dependencies
npm install

# Install additional blockchain dependencies
npm install ethers@latest web3@latest

# Verify all dependencies are installed
npm list
```

### Step 3: Install VS Code Extensions (Recommended)
1. Open VS Code Extensions panel (`Cmd + Shift + X`)
2. Install these extensions:
   - **ES7+ React/Redux/React-Native snippets**
   - **TypeScript Importer**
   - **Tailwind CSS IntelliSense**
   - **Auto Rename Tag**
   - **Prettier - Code formatter**
   - **Solidity** (for smart contract development)

---

## 🔗 Smart Contract Deployment

### Step 1: Open Remix IDE
1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create a new file called `PotholeDetection.sol`

### Step 2: Deploy the Contract
1. Copy the contract code from `src/lib/contract.sol` in your project
2. Paste it into the Remix editor
3. Go to the "Solidity Compiler" tab (left sidebar)
4. Select compiler version `0.8.19` or higher
5. Click "Compile PotholeDetection.sol"
6. Go to "Deploy & Run Transactions" tab
7. Set Environment to "Injected Provider - MetaMask"
8. Ensure MetaMask is connected and on Sepolia network
9. Click "Deploy"
10. Confirm the transaction in MetaMask
11. **COPY THE CONTRACT ADDRESS** from the deployed contracts section

### Step 3: Update Contract Address in Project
1. Open `src/lib/ethereum.ts` in VS Code
2. Find line with `CONTRACT_ADDRESS`
3. Replace with your deployed contract address:
   ```typescript
   const CONTRACT_ADDRESS = "0xYourContractAddressHere";
   ```
4. Save the file (`Cmd + S`)

---

## 🐍 Python Backend Setup

### Step 1: Create Python Virtual Environment
In VS Code terminal:
```bash
# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Verify activation (should show (venv) in prompt)
which python  # Should show path with /venv/
```

### Step 2: Install Python Dependencies
```bash
# Upgrade pip first
pip install --upgrade pip

# Install PyTorch for Apple Silicon
pip install torch torchvision torchaudio

# Install YOLO and computer vision libraries
pip install ultralytics opencv-python cvzone numpy

# Install blockchain libraries
pip install web3 python-dotenv

# Install additional dependencies
pip install requests pillow
```

### Step 3: Download YOLO Model
1. Place your trained YOLO model file (`best.pt`) in the project root directory
2. If you don't have a trained model, you can download a pre-trained one:
   ```bash
   # This will download a general YOLOv8 model
   python -c "from ultralytics import YOLO; model = YOLO('yolov8s-seg.pt')"
   ```

### Step 4: Create Python Environment File
Create a `.env` file in the project root:
```bash
touch .env
```

Add the following content:
```env
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=your_deployed_contract_address
PRIVATE_KEY=your_metamask_private_key_for_backend
```

**Note**: For production, use a separate wallet for the backend, not your main MetaMask wallet.

### Step 5: Update Python Detection Script
Create or update `detection_service.py`:
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
```

---

## 🚀 Running the Application

### Step 1: Start the Development Server
In VS Code terminal:
```bash
# Make sure you're in the project directory
pwd  # Should show your project path

# Start the development server
npm run dev
```

You should see output like:
```
  VITE v5.4.2  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 2: Open the Application
1. Open your browser
2. Navigate to `http://localhost:5173/`
3. You should see the SnapCity interface

### Step 3: Connect MetaMask
1. Click "Connect MetaMask" button
2. MetaMask popup should appear
3. Click "Connect" in MetaMask
4. The app should automatically switch to Sepolia network
5. Approve the network switch in MetaMask

---

## 🧪 Testing the System

### Step 1: Test Location Detection
1. Click "Use Current Location" button
2. Allow location access when browser prompts
3. Verify location is detected and displayed

### Step 2: Test Video Upload
1. Prepare a test video file (MP4, AVI, MOV, or MKV)
2. Drag and drop the video onto the upload area
3. Wait for processing simulation to complete
4. Check that detection appears in the list

### Step 3: Test Admin Validation
1. Navigate to "Admin Panel" in the sidebar
2. Find pending detections
3. Click "View Details" on a detection
4. Add admin notes if desired
5. Click "Validate" or "Reject"
6. Confirm the transaction in MetaMask
7. Verify the status updates

### Step 4: Test Python Backend (Optional)
```bash
# Activate Python environment
source venv/bin/activate

# Run detection on a test video
python detection_service.py
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. MetaMask Not Detected
**Error**: "MetaMask is not installed"
**Solutions**:
- Ensure MetaMask extension is installed and enabled
- Refresh the browser page
- Check that MetaMask is not disabled by other extensions
- Try in an incognito/private browser window

#### 2. Network Connection Issues
**Error**: "Failed to switch to Sepolia network"
**Solutions**:
- Manually add Sepolia network in MetaMask
- Check internet connection
- Try disconnecting and reconnecting MetaMask

#### 3. Transaction Failures
**Error**: "Transaction failed" or "Insufficient funds"
**Solutions**:
- Ensure you have SepoliaETH for gas fees
- Get more test ETH from [sepoliafaucet.com](https://sepoliafaucet.com/)
- Check that you're on the correct network (Sepolia)
- Wait for previous transactions to complete

#### 4. Location Detection Issues
**Error**: "Error getting location"
**Solutions**:
- Enable location services in System Preferences → Privacy & Security → Location Services
- Allow location access in browser settings
- Use manual location input as alternative
- Check that you're using HTTPS (required for geolocation)

#### 5. Python Dependencies Issues
**Error**: OpenCV or PyTorch installation failures
**Solutions**:
```bash
# For OpenCV issues
brew install opencv
pip install opencv-python-headless

# For PyTorch issues (Apple Silicon)
pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cpu

# For general dependency issues
pip install --upgrade pip
pip install --force-reinstall [package-name]
```

#### 6. YOLO Model Issues
**Error**: "Model file not found" or "Model loading failed"
**Solutions**:
- Ensure `best.pt` is in the project root directory
- Check file permissions: `chmod 644 best.pt`
- Verify model compatibility with installed ultralytics version
- Try downloading a fresh model file

#### 7. Smart Contract Issues
**Error**: "Contract not found" or "Invalid contract address"
**Solutions**:
- Verify contract is deployed on Sepolia network
- Check contract address in `src/lib/ethereum.ts`
- Ensure you have admin permissions for validation functions
- Verify contract compilation was successful

#### 8. Development Server Issues
**Error**: "Port already in use" or "Cannot start dev server"
**Solutions**:
```bash
# Kill processes using port 5173
lsof -ti:5173 | xargs kill -9

# Start server on different port
npm run dev -- --port 3000

# Clear npm cache
npm cache clean --force
```

#### 9. VS Code Issues
**Error**: TypeScript errors or IntelliSense not working
**Solutions**:
- Restart TypeScript server: `Cmd + Shift + P` → "TypeScript: Restart TS Server"
- Reload VS Code window: `Cmd + Shift + P` → "Developer: Reload Window"
- Check that all extensions are updated

#### 10. Browser Console Errors
**Error**: Various JavaScript errors
**Solutions**:
- Clear browser cache and cookies
- Disable browser extensions temporarily
- Try in incognito/private mode
- Check browser console for specific error messages

### Performance Optimization

#### For Better Development Experience:
1. **Enable Hot Reload**: Ensure `npm run dev` is running
2. **Use Browser DevTools**: Press `F12` to debug issues
3. **Monitor Network Tab**: Check for failed API calls
4. **Watch Console**: Look for error messages and warnings

#### For Better Python Performance:
1. **Use Virtual Environment**: Always activate before running Python scripts
2. **Monitor Memory Usage**: YOLO models can be memory-intensive
3. **Optimize Video Processing**: Process every nth frame for faster results
4. **Use GPU if Available**: Install CUDA-compatible PyTorch for better performance

### Getting Help

If you encounter issues not covered here:

1. **Check Browser Console**: Press `F12` and look for error messages
2. **Check Terminal Output**: Look for error messages in VS Code terminal
3. **Verify All Steps**: Ensure you followed each step exactly
4. **Check Network Status**: Ensure Sepolia network is accessible
5. **Test with Different Browser**: Try Chrome, Firefox, or Safari
6. **Check MetaMask Status**: Ensure it's unlocked and connected

### Useful Commands Reference

```bash
# Project Management
npm install                 # Install dependencies
npm run dev                # Start development server
npm run build              # Build for production
npm run preview            # Preview production build

# Python Environment
source venv/bin/activate   # Activate virtual environment
deactivate                 # Deactivate virtual environment
pip list                   # Show installed packages
pip freeze > requirements.txt  # Save dependencies

# Git Commands (if using version control)
git status                 # Check file changes
git add .                  # Stage all changes
git commit -m "message"    # Commit changes
git push                   # Push to repository

# System Information
node --version             # Check Node.js version
npm --version              # Check npm version
python3.11 --version       # Check Python version
which python               # Check Python path
```

---

## 🎉 Congratulations!

You have successfully set up SnapCity pothole detection system on your Mac M3! The application should now be running with:

- ✅ Modern React frontend with TypeScript
- ✅ MetaMask integration for Sepolia blockchain
- ✅ Smart contract for immutable data storage
- ✅ Location detection with GPS and manual input
- ✅ Admin validation system
- ✅ Python backend ready for YOLO integration
- ✅ Responsive design for all devices

The system is now ready for pothole detection, validation, and blockchain storage. Happy coding! 🚀