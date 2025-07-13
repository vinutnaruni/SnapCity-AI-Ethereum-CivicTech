import React, { useState } from 'react';
import { MapPin, Calendar, Clock, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { PotholeDetection } from '../types';

interface DetectionCardProps {
  detection: PotholeDetection;
  onValidate: (id: string, isValid: boolean, notes?: string) => void;
  isAdmin: boolean;
}

const DetectionCard: React.FC<DetectionCardProps> = ({ detection, onValidate, isAdmin }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes] = useState(detection.admin_notes || '');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidation = async (isValid: boolean) => {
    setIsValidating(true);
    await onValidate(detection.id, isValid, notes);
    setIsValidating(false);
  };

  const getStatusColor = () => {
    switch (detection.status) {
      case 'validated': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = () => {
    switch (detection.status) {
      case 'validated': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {detection.video_name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(detection.detected_at), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(detection.detected_at), 'HH:mm')}</span>
              </div>
              {detection.location_name && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate max-w-32">{detection.location_name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="capitalize">{detection.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{detection.detection_count}</div>
            <div className="text-sm text-blue-600">Potholes Found</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">{Math.round(detection.confidence_avg * 100)}%</div>
            <div className="text-sm text-purple-600">Avg Confidence</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">
              {showDetails ? 'Hide Details' : 'View Details'}
            </span>
          </button>

          {isAdmin && detection.status === 'pending' && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleValidation(false)}
                disabled={isValidating}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                Reject
              </button>
              <button
                onClick={() => handleValidation(true)}
                disabled={isValidating}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                Validate
              </button>
            </div>
          )}
        </div>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 space-y-4"
          >
            {detection.location_lat && detection.location_lng && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                <p className="text-sm text-gray-600">
                  Lat: {detection.location_lat.toFixed(6)}, Lng: {detection.location_lng.toFixed(6)}
                </p>
              </div>
            )}

            {isAdmin && detection.status === 'pending' && (
              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Admin Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Add validation notes..."
                />
              </div>
            )}

            {detection.admin_notes && detection.status !== 'pending' && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Admin Notes</h4>
                </div>
                <p className="text-sm text-gray-600">{detection.admin_notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DetectionCard;