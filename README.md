# Agentic Ethereum Hackathon India

# 🛠 Project Title - SnapCity

Welcome to our submission for the **Agentic Ethereum Hackathon** organized by **Reskilll & Geodework**! This repository includes our complete project codebase, smart contracts, documentation, and demo resources.

---

## 📌 Problem Statement

We addressed the challenge: **“AI Agents on Ethereum – Build autonomous agents for decentralized applications”**

Indian cities face a daily influx of civic problems — potholes, garbage overflows, traffic jams, and infrastructure failures. Current grievance redressal systems are opaque, centralized, and plagued by delays or lack of follow-through. Citizens have no real-time, transparent, or trustworthy way to report or track these issues.

---

## 💡 Our Solution

### 🧠 Project Name: SnapCity

SnapCity is a **decentralized AI-powered civic issue reporting and monitoring platform**. It empowers citizens to report civic problems via media (photo/video), while an AI agent performs real-time object detection on both manual reports and live CCTV or phone-streamed video.

All reports are **securely logged to the Ethereum blockchain** via smart contracts — enabling transparent, immutable, and trustless governance with on-chain tracking, public accountability, and verifiable resolution history.

SnapCity bridges Web3, computer vision, and governance — solving real-world problems with real-time AI + Ethereum automation.

---

## 🧱 Tech Stack

| Layer        | Technology Used                          |
|--------------|-------------------------------------------|
| 🖥 Frontend   | React.js, TailwindCSS, Mapbox GL JS       |
| ⚙ Backend    | Firebase Functions + Firebase Auth        |
| 🧠 AI         | YOLOv8 Object Detection, Gemini 1.5       |
| 🔗 Blockchain | Ethereum (Sepolia), Solidity, Hardhat     |
| 🪪 Identity   | Polygon ID (SSI), ENS (planned)           |
| 🔍 Storage    | IPFS (via Web3.Storage), Firebase Storage |
| 🧪 Dev Tools  | Hardhat, GitHub, VS Code, Pinata          |
| 🚀 Hosting    | Firebase Hosting (Dev), Vercel (optional) |

---

## 👤 User Flow (v1)

- **User Portal**
  - Submit civic report via image/video upload
  - Add optional comments, location (manual/GPS), and anonymity
  - View submitted reports and their blockchain status
- **Live CCTV Monitoring**
  - AI agent reads live webcam/mobile camera stream
  - Auto-detects issues (e.g., garbage, potholes)
  - Submits report automatically if detected
- **Blockchain Interaction**
  - Report metadata + IPFS hash logged via smart contract on Ethereum
  - Returns a verifiable `transactionHash` stored in frontend
- **Admin Dashboard**
  - Monitor incoming reports (map + status)
  - Filter by category (pothole, garbage, etc.), date, location
  - View report image, user comment, current on-chain status

---

## 👩‍💻 Key Features

- 🧠 AI-powered object detection (YOLOv8 on user uploads & live video)
- 📍 Geo-tagged & categorized civic issue reporting
- 🔗 On-chain logging of issues for transparency (Ethereum smart contracts)
- 🌐 IPFS storage for decentralized media access
- 🕵 Anonymous and verified user modes (Polygon ID planned)
- 📊 Admin dashboard with analytics, filters & map view
- 📱 Real-time user notifications and status updates

---

### 🔐 Prerequisites
- Node.js (v18+)
- Hardhat
- Git
- Firebase CLI
- IPFS account (e.g., web3.storage or Pinata)
- MetaMask wallet (connected to Sepolia testnet

#### ✅ Milestones Achieved
✅ Milestones Achieved
- Manual report submission + IPFS upload
- YOLOv8 detection + AI classification
- Real-time Ethereum contract logging (Sepolia)
- Live webcam streaming for issue detection
- Admin dashboard with status filters + map view
- Working demo with real data, not dummy JSON
