import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface VideoUploadProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload, isProcessing }) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onUpload(file);
            setUploadProgress(0);
          }, 500);
        }
      }, 100);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv']
    },
    maxFiles: 1,
    disabled: isProcessing || uploadProgress > 0
  });

  const getDropzoneStatus = () => {
    if (isProcessing) return 'processing';
    if (uploadProgress > 0) return 'uploading';
    if (isDragReject) return 'rejected';
    if (isDragActive) return 'active';
    return 'idle';
  };

  const status = getDropzoneStatus();

  const statusConfig = {
    idle: {
      icon: Upload,
      title: 'Upload Video',
      subtitle: 'Drag and drop your video file here, or click to browse',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600'
    },
    active: {
      icon: Video,
      title: 'Drop it here!',
      subtitle: 'Release to upload your video',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-600'
    },
    rejected: {
      icon: AlertCircle,
      title: 'Invalid file type',
      subtitle: 'Please upload a valid video file (MP4, AVI, MOV, MKV)',
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-600'
    },
    uploading: {
      icon: Upload,
      title: 'Uploading...',
      subtitle: `${uploadProgress}% complete`,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-600'
    },
    processing: {
      icon: CheckCircle,
      title: 'Processing video...',
      subtitle: 'AI is analyzing your video for potholes',
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-600'
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${config.borderColor} ${config.bgColor} hover:shadow-lg`}
      >
        <input {...getInputProps()} />
        
        <motion.div
          key={status}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className={`mx-auto w-16 h-16 ${config.textColor} flex items-center justify-center`}>
            <IconComponent className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className={`text-xl font-semibold ${config.textColor}`}>
              {config.title}
            </h3>
            <p className="text-gray-600 mt-2">
              {config.subtitle}
            </p>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </motion.div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-purple-600 font-medium">Analyzing video...</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VideoUpload;