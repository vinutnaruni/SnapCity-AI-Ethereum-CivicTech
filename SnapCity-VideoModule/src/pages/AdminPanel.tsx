import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Filter, Download, RefreshCw } from 'lucide-react';
import WalletConnection from '../components/WalletConnection';
import DetectionCard from '../components/DetectionCard';
import { PotholeDetection } from '../types';
import { ethereumService } from '../lib/ethereum';
import toast from 'react-hot-toast';

const AdminPanel: React.FC = () => {
  const [detections, setDetections] = useState<PotholeDetection[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | 'rejected'>('pending');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDetections();
    setIsRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleExport = () => {
    // In production, this would generate and download a CSV/Excel file
    toast.success('Export started - check your downloads');
  };

  const filteredDetections = detections.filter(detection => {
    if (filter === 'all') return true;
    return detection.status === filter;
  });

  const stats = {
    pending: detections.filter(d => d.status === 'pending').length,
    validated: detections.filter(d => d.status === 'validated').length,
    rejected: detections.filter(d => d.status === 'rejected').length,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500 rounded-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-blue-200">Review and validate pothole detections</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Wallet Connection */}
      {!isWalletConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WalletConnection onConnectionChange={setIsWalletConnected} />
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-blue-200 mt-2">Pending Review</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{stats.validated}</p>
            <p className="text-blue-200 mt-2">Validated</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-blue-200 mt-2">Rejected</p>
          </div>
        </motion.div>
      </div>

      {/* Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center space-x-4"
      >
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-200" />
          <span className="text-white font-medium">Filter:</span>
        </div>
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'validated', label: 'Validated' },
            { key: 'rejected', label: 'Rejected' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-blue-200 hover:bg-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Detections Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      >
        {filteredDetections.map((detection, index) => (
          <motion.div
            key={detection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <DetectionCard
              detection={detection}
              onValidate={handleValidation}
              isAdmin={true}
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredDetections.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-blue-200 text-lg">No detections found for the selected filter</div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminPanel;