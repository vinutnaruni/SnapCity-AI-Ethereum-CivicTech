import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import VideoUpload from '../components/VideoUpload';
import LocationPicker from '../components/LocationPicker';
import WalletConnection from '../components/WalletConnection';
import DetectionCard from '../components/DetectionCard';
import { PotholeDetection } from '../types';
import { ethereumService } from '../lib/ethereum';
import { Camera, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const Detection: React.FC = () => {
  const [detections, setDetections] = useState<PotholeDetection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  useEffect(() => {
    loadDetections();
  }, []);

  const loadDetections = async () => {
    if (ethereumService.isConnected()) {
      try {
        const blockchainDetections = await ethereumService.getAllDetections();
        setDetections(blockchainDetections);
      } catch (error) {
        console.error('Error loading detections:', error);
        toast.error('Failed to load detections from blockchain');
      }
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!selectedLocation) {
      toast.error('Please set a location before uploading');
      return;
    }

    setIsProcessing(true);
    toast.loading('Processing video...', { id: 'processing' });

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate detection results
      const detectionData = {
        videoName: file.name,
        videoPath: `/videos/${file.name}`,
        detectionCount: Math.floor(Math.random() * 8) + 1,
        confidenceAvg: 0.8 + Math.random() * 0.2,
        locationName: selectedLocation.name,
        locationLat: selectedLocation.lat,
        locationLng: selectedLocation.lng
      };

      // Store on blockchain
      const txHash = await ethereumService.addDetection(detectionData);
      
      toast.success(`Detection stored on blockchain! TX: ${txHash.slice(0, 10)}...`, { id: 'processing' });
      
      // Reload detections from blockchain
      await loadDetections();
      
    } catch (error) {
      console.error('Error processing video:', error);
      if (error.message.includes('user rejected')) {
        toast.error('Transaction was rejected', { id: 'processing' });
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient SepoliaETH for gas fees', { id: 'processing' });
      } else {
        toast.error('Error processing video', { id: 'processing' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidation = async (id: string, isValid: boolean, notes?: string) => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const detectionId = parseInt(id);
      const txHash = await ethereumService.validateDetection(detectionId, isValid, notes || '');
      
      toast.success(`Validation recorded on blockchain! TX: ${txHash.slice(0, 10)}...`);
      
      // Reload detections from blockchain
      await loadDetections();
      
    } catch (error) {
      console.error('Error validating detection:', error);
      toast.error('Failed to validate detection');
    }
    
  };

  const stats = {
    total: detections.length,
    pending: detections.filter(d => d.status === 'pending').length,
    validated: detections.filter(d => d.status === 'validated').length,
    totalPotholes: detections.filter(d => d.status === 'validated').reduce((sum, d) => sum + d.detection_count, 0)
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Pothole Detection System
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-blue-200 text-lg"
        >
          Upload videos to detect and validate potholes using AI technology
        </motion.p>
      </div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3">
            <Camera className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-blue-200 text-sm">Total Videos</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-blue-200 text-sm">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.validated}</p>
              <p className="text-blue-200 text-sm">Validated</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalPotholes}</p>
              <p className="text-blue-200 text-sm">Potholes Found</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WalletConnection onConnectionChange={setIsWalletConnected} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <VideoUpload onUpload={handleVideoUpload} isProcessing={isProcessing} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LocationPicker onLocationSelect={setSelectedLocation} />
        </motion.div>
      </div>

      {/* Detections List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-white">Recent Detections</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {detections.map((detection, index) => (
            <motion.div
              key={detection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <DetectionCard
                detection={detection}
                onValidate={handleValidation}
                isAdmin={true} // This would come from user context
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Detection;