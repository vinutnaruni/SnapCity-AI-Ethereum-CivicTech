import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ethereumService } from '../lib/ethereum';

interface WalletConnectionProps {
  onConnectionChange: (connected: boolean) => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (ethereumService.isConnected()) {
      setIsConnected(true);
      const address = await ethereumService.getWalletAddress();
      setWalletAddress(address);
      onConnectionChange(true);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      await ethereumService.connectWallet();
      setIsConnected(true);
      const address = await ethereumService.getWalletAddress();
      setWalletAddress(address);
      onConnectionChange(true);
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      if (error.message.includes('MetaMask is not installed')) {
        toast.error('MetaMask is not installed. Please install it to continue.');
      } else if (error.message.includes('not the active wallet provider')) {
        toast.error('Please make sure MetaMask is your active wallet provider');
      } else if (error.message.includes('User rejected')) {
        toast.error('Connection was rejected. Please try again.');
      } else if (error.message.includes('already processing')) {
        toast.error('MetaMask is busy. Please check MetaMask and try again.');
      } else {
        toast.error(`Connection failed: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && walletAddress) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-xl p-4"
      >
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Wallet Connected</p>
            <p className="text-sm text-green-600">{formatAddress(walletAddress)}</p>
            <p className="text-xs text-green-500 mt-1">Sepolia Test Network</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Wallet className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Connect Wallet</h3>
          <p className="text-sm text-gray-600">Connect MetaMask to store data on Sepolia</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Requirements:</p>
              <ul className="text-sm text-blue-600 mt-1 space-y-1">
                <li>• MetaMask browser extension installed</li>
                <li>• MetaMask set as active wallet provider</li>
                <li>• Connected to Sepolia Test Network</li>
                <li>• Some SepoliaETH for gas fees</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          {isConnecting ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
        </button>

        <div className="text-center">
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Don't have MetaMask? Download here
          </a>
          <p className="text-xs text-gray-500 mt-2">
            After installing, refresh this page and try connecting again
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default WalletConnection;