import { ethers } from 'ethers';

// Smart contract ABI for pothole detection storage
const POTHOLE_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_videoName", "type": "string"},
      {"internalType": "string", "name": "_videoPath", "type": "string"},
      {"internalType": "uint256", "name": "_detectionCount", "type": "uint256"},
      {"internalType": "uint256", "name": "_confidenceAvg", "type": "uint256"},
      {"internalType": "string", "name": "_locationName", "type": "string"},
      {"internalType": "int256", "name": "_locationLat", "type": "int256"},
      {"internalType": "int256", "name": "_locationLng", "type": "int256"}
    ],
    "name": "addDetection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_detectionId", "type": "uint256"},
      {"internalType": "bool", "name": "_isValid", "type": "bool"},
      {"internalType": "string", "name": "_notes", "type": "string"}
    ],
    "name": "validateDetection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDetectionCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_detectionId", "type": "uint256"}],
    "name": "getDetection",
    "outputs": [
      {"internalType": "string", "name": "videoName", "type": "string"},
      {"internalType": "string", "name": "videoPath", "type": "string"},
      {"internalType": "uint256", "name": "detectionCount", "type": "uint256"},
      {"internalType": "uint256", "name": "confidenceAvg", "type": "uint256"},
      {"internalType": "string", "name": "locationName", "type": "string"},
      {"internalType": "int256", "name": "locationLat", "type": "int256"},
      {"internalType": "int256", "name": "locationLng", "type": "int256"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "address", "name": "submitter", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Replace with your deployed contract address on Sepolia
const CONTRACT_ADDRESS = "0x48ee16d81055638a50db98a6875b8eec885d7016";

export class EthereumService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  async connectWallet(): Promise<boolean> {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Check if MetaMask is the provider
      if (!window.ethereum.isMetaMask) {
        throw new Error('MetaMask is not the active wallet provider');
      }

      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Switch to Sepolia network
        await this.switchToSepolia();
        
        this.signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, POTHOLE_CONTRACT_ABI, this.signer);
        
        return true;
      } catch (connectionError: any) {
        if (connectionError.code === 4001) {
          throw new Error('User rejected the connection request');
        } else if (connectionError.code === -32002) {
          throw new Error('MetaMask is already processing a request. Please wait.');
        } else {
          throw connectionError;
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async switchToSepolia(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'SEP',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Failed to add Sepolia network');
        }
      } else {
        throw new Error('Failed to switch to Sepolia network');
      }
    }
  }

  async addDetection(detection: {
    videoName: string;
    videoPath: string;
    detectionCount: number;
    confidenceAvg: number;
    locationName: string;
    locationLat: number;
    locationLng: number;
  }): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Convert coordinates to integers (multiply by 1000000 for precision)
      const latInt = Math.round(detection.locationLat * 1000000);
      const lngInt = Math.round(detection.locationLng * 1000000);
      const confidenceInt = Math.round(detection.confidenceAvg * 100);

      const tx = await this.contract.addDetection(
        detection.videoName,
        detection.videoPath,
        detection.detectionCount,
        confidenceInt,
        detection.locationName,
        latInt,
        lngInt
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error adding detection:', error);
      throw error;
    }
  }

  async validateDetection(detectionId: number, isValid: boolean, notes: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.validateDetection(detectionId, isValid, notes);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error validating detection:', error);
      throw error;
    }
  }

  async getDetectionCount(): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const count = await this.contract.getDetectionCount();
      return Number(count);
    } catch (error) {
      console.error('Error getting detection count:', error);
      throw error;
    }
  }

  async getDetection(detectionId: number): Promise<any> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const detection = await this.contract.getDetection(detectionId);
      return {
        videoName: detection.videoName,
        videoPath: detection.videoPath,
        detectionCount: Number(detection.detectionCount),
        confidenceAvg: Number(detection.confidenceAvg) / 100,
        locationName: detection.locationName,
        locationLat: Number(detection.locationLat) / 1000000,
        locationLng: Number(detection.locationLng) / 1000000,
        status: Number(detection.status), // 0: pending, 1: validated, 2: rejected
        timestamp: Number(detection.timestamp),
        submitter: detection.submitter
      };
    } catch (error) {
      console.error('Error getting detection:', error);
      throw error;
    }
  }

  async getAllDetections(): Promise<any[]> {
    try {
      const count = await this.getDetectionCount();
      const detections = [];

      for (let i = 0; i < count; i++) {
        const detection = await this.getDetection(i);
        detections.push({
          id: i.toString(),
          video_name: detection.videoName,
          video_path: detection.videoPath,
          detection_count: detection.detectionCount,
          confidence_avg: detection.confidenceAvg,
          location_name: detection.locationName,
          location_lat: detection.locationLat,
          location_lng: detection.locationLng,
          status: detection.status === 0 ? 'pending' : detection.status === 1 ? 'validated' : 'rejected',
          detected_at: new Date(detection.timestamp * 1000).toISOString(),
          submitter: detection.submitter,
          frame_data: []
        });
      }

      return detections;
    } catch (error) {
      console.error('Error getting all detections:', error);
      return [];
    }
  }

  getWalletAddress(): string | null {
    return this.signer ? this.signer.getAddress() as any : null;
  }

  isConnected(): boolean {
    return this.contract !== null;
  }
}

// Global instance
export const ethereumService = new EthereumService();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}