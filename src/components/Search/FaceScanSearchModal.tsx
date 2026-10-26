import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  UserPlus, 
  ExternalLink, 
  ShieldCheck, 
  Upload, 
  Sparkles, 
  Scan,
  MapPin,
  Building2,
  Calendar,
  FlipHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Child } from '../../types';
import { 
  verifyCameraPermission, 
  loadFaceRecognitionModels, 
  extractFaceDescriptorFromMedia,
  extractFaceDescriptorFromImageUrl,
  findBestFaceMatch,
  euclideanDistanceToSimilarity 
} from '../../utils/faceRecognition';

interface FaceScanSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChild: (childId: string) => void;
  onOpenRegisterWithPhoto?: (photoUrl: string, faceDescriptor: number[]) => void;
  onOpenAddRescueLog?: (child: Child) => void;
}

type ScanStatus = 
  | 'initializing'
  | 'ready'
  | 'scanning'
  | 'searching'
  | 'match_found'
  | 'no_match'
  | 'permission_denied'
  | 'error';

export const FaceScanSearchModal: React.FC<FaceScanSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectChild,
  onOpenRegisterWithPhoto,
  onOpenAddRescueLog,
}) => {
  const { children, language } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanStatus, setScanStatus] = useState<ScanStatus>('initializing');
  const [errorMessage, setErrorMessage] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [extractedDescriptor, setExtractedDescriptor] = useState<number[] | null>(null);

  // Match result state
  const [matchedResult, setMatchedResult] = useState<{
    child: Child;
    distance: number;
    similarity: number;
  } | null>(null);

  // Active scanning mode: 'camera' | 'upload'
  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('camera');
  const [modelStatusMsg, setModelStatusMsg] = useState('Initializing Face Recognition Engine...');

  // Clean up camera stream
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start camera when modal opens
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCameraStream();
    setScanStatus('initializing');
    setErrorMessage('');
    setModelStatusMsg(language === 'bn' ? 'ক্যামেরা ও এআই ইঞ্জিন চালু হচ্ছে...' : 'Initializing Camera & AI Engine...');

    try {
      // 1. Trigger model loading in background
      loadFaceRecognitionModels().then((success) => {
        if (success) {
          setModelStatusMsg(language === 'bn' ? 'বায়োমেট্রিক মডেল সক্রিয়' : 'Biometric Models Ready');
        }
      });

      // 2. Request user camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setScanStatus('ready');
        };
      }
    } catch (err: any) {
      console.warn('Camera initiation error:', err);
      // Fallback try with generic video
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setScanStatus('ready');
          };
        }
      } catch (fallbackErr: any) {
        setScanStatus('permission_denied');
        setErrorMessage(
          language === 'bn'
            ? 'ফেস স্ক্যানিং এর জন্য ক্যামেরা পারমিশন প্রয়োজন। অনুগ্রহ করে ব্রাউজার সেটিংসে ক্যামেরা অ্যাক্সেস চালু করুন।'
            : 'Camera access is required for face scanning. Please enable camera access in your browser settings.'
        );
      }
    }
  };

  // Effect to manage lifecycle
  useEffect(() => {
    if (isOpen) {
      setMatchedResult(null);
      setCapturedPhotoUrl(null);
      setExtractedDescriptor(null);
      if (inputMode === 'camera') {
        startCamera();
      }
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, inputMode]);

  // Flip camera between front & back
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Perform Face Scan and Search against Firestore children collection
  const handleCaptureAndSearch = async () => {
    if (!videoRef.current || scanStatus === 'scanning' || scanStatus === 'searching') return;

    try {
      setScanStatus('scanning');
      setModelStatusMsg(language === 'bn' ? 'চেহারা স্ক্যান ও ফিচার বিশ্লেষণ হচ্ছে...' : 'Scanning face & extracting biometric features...');

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context error');

      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhotoUrl(photoDataUrl);

      // Extract 128-d biometric descriptor
      const extractionResult = await extractFaceDescriptorFromMedia(video);
      setExtractedDescriptor(extractionResult.descriptor);

      setScanStatus('searching');
      setModelStatusMsg(language === 'bn' ? 'ফায়ারবেস ডাটাবেজে রেকর্ড অনুসন্ধান করা হচ্ছে...' : 'Searching database for biometric matches...');

      // Small delay for smooth UX transition
      await new Promise((r) => setTimeout(r, 600));

      // Match against children in Firestore
      const match = findBestFaceMatch(extractionResult.descriptor, children, 0.58);

      if (match) {
        setMatchedResult(match);
        setScanStatus('match_found');
      } else {
        setMatchedResult(null);
        setScanStatus('no_match');
      }
    } catch (err: any) {
      console.error('Face scanning error:', err);
      setScanStatus('error');
      setErrorMessage(
        language === 'bn'
          ? 'ফেস স্ক্যানিং প্রক্রিয়া সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
          : 'Face scanning process could not be completed. Please try again.'
      );
    }
  };

  // Handle uploaded photo scan
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setCapturedPhotoUrl(dataUrl);
      setScanStatus('scanning');
      setModelStatusMsg(language === 'bn' ? 'আপলোডকৃত ছবি বিশ্লেষণ হচ্ছে...' : 'Analyzing uploaded photo...');

      try {
        const descriptor = await extractFaceDescriptorFromImageUrl(dataUrl);
        if (descriptor) {
          setExtractedDescriptor(descriptor);
          setScanStatus('searching');
          setModelStatusMsg(language === 'bn' ? 'ফায়ারবেস ক্লাউডে তুলনা করা হচ্ছে...' : 'Comparing against cloud biometric database...');

          await new Promise((r) => setTimeout(r, 500));
          const match = findBestFaceMatch(descriptor, children, 0.58);

          if (match) {
            setMatchedResult(match);
            setScanStatus('match_found');
          } else {
            setMatchedResult(null);
            setScanStatus('no_match');
          }
        } else {
          setScanStatus('no_match');
        }
      } catch (err) {
        setScanStatus('error');
        setErrorMessage(
          language === 'bn'
            ? 'ছবি থেকে ফেস ফিচার রিড করা যায়নি। পরিষ্কার ছবি দিন।'
            : 'Could not extract face features from this image. Please provide a clear portrait photo.'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset scanner to scan again
  const handleResetScanner = () => {
    setMatchedResult(null);
    setCapturedPhotoUrl(null);
    setExtractedDescriptor(null);
    setScanStatus('ready');
    if (inputMode === 'camera' && (!streamRef.current || !streamRef.current.active)) {
      startCamera();
    }
  };

  // Navigate to child profile
  const handleProceedToProfile = (childId: string) => {
    stopCameraStream();
    onClose();
    onSelectChild(childId);
  };

  // Proceed with new registration pre-filling captured photo & descriptor
  const handleProceedToNewRegistration = () => {
    stopCameraStream();
    onClose();
    if (onOpenRegisterWithPhoto && capturedPhotoUrl && extractedDescriptor) {
      onOpenRegisterWithPhoto(capturedPhotoUrl, extractedDescriptor);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E31B23] text-white rounded-xl shadow-xs">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display flex items-center gap-2">
                <span>{language === 'bn' ? 'ফেস রিকগনিশন ও বায়োমেট্রিক সার্চ' : 'Face Recognition & Biometric Search'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  AI 128-d
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn' 
                  ? 'ক্যামেরা স্ক্যান করে সেকেন্ডেই উদ্ধারকৃত শিশুর প্রোফাইল ও হিস্ট্রি খুঁজুন' 
                  : 'Scan child face to instantly match profiles or register new intakes'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Mode Selector Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setInputMode('camera')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              inputMode === 'camera'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4 text-rose-600" />
            <span>{language === 'bn' ? 'লাইভ ক্যামেরা স্ক্যানার' : 'Live Camera Scanner'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              setInputMode('upload');
            }}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              inputMode === 'upload'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? 'ফাইল/ছবি আপলোড করুন' : 'Upload Child Photo'}</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* CAMERA PERMISSION DENIED VIEW */}
          {scanStatus === 'permission_denied' && (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-rose-900">
                {language === 'bn' ? 'ক্যামেরা অ্যাক্সেস বন্ধ রয়েছে' : 'Camera Permission Denied'}
              </h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
                {errorMessage}
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => startCamera()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পুনরায় অনুমতি চান' : 'Retry Camera Access'}</span>
                </button>
                <button
                  onClick={() => setInputMode('upload')}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>{language === 'bn' ? 'ছবি ফাইল আপলোড করুন' : 'Use Photo Upload'}</span>
                </button>
              </div>
            </div>
          )}

          {/* LIVE CAMERA VIEWER & FRAME SCANNER */}
          {inputMode === 'camera' && scanStatus !== 'permission_denied' && (
            <div className="space-y-3">
              <div className="relative w-full aspect-4/3 max-h-72 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Live Scanning Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Guide Oval/Square for Face */}
                  <div className="relative w-48 h-56 sm:w-56 sm:h-64 border-2 border-dashed border-rose-500/80 rounded-3xl shadow-[0_0_20px_rgba(227,27,35,0.25)] flex items-center justify-center">
                    {/* Reticle Corner Brackets */}
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-rose-500 rounded-tl-xl -mt-0.5 -ml-0.5" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-rose-500 rounded-tr-xl -mt-0.5 -mr-0.5" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-rose-500 rounded-bl-xl -mb-0.5 -ml-0.5" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-rose-500 rounded-br-xl -mb-0.5 -mr-0.5" />

                    {/* Scanning Laser Animation */}
                    {(scanStatus === 'scanning' || scanStatus === 'searching') && (
                      <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#E31B23] animate-bounce" />
                    )}

                    {/* Center guidance text */}
                    <span className="text-[10px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full font-medium">
                      {language === 'bn' ? 'শিশুর মুখ মাঝে রাখুন' : 'Center Face in Frame'}
                    </span>
                  </div>
                </div>

                {/* Flip camera control */}
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-xs transition-all cursor-pointer border border-white/10"
                  title="Switch Camera (Front/Back)"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>

                {/* Model / Camera status pill */}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] text-emerald-400 border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{modelStatusMsg}</span>
                </div>
              </div>

              {/* Action Trigger Buttons for Camera */}
              {scanStatus !== 'match_found' && scanStatus !== 'no_match' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={scanStatus === 'scanning' || scanStatus === 'searching'}
                    onClick={handleCaptureAndSearch}
                    className="flex-1 py-3 bg-[#E31B23] hover:bg-[#c9151d] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {scanStatus === 'scanning' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{language === 'bn' ? 'মুখমণ্ডল স্ক্যান করা হচ্ছে...' : 'Scanning face...'}</span>
                      </>
                    ) : scanStatus === 'searching' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{language === 'bn' ? 'ডাটাবেজে অনুসন্ধান চলছে...' : 'Searching database...'}</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>{language === 'bn' ? 'ফেস ক্যাপচার ও সার্চ করুন' : 'Capture & Search Face'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PHOTO UPLOAD SCANNER VIEW */}
          {inputMode === 'upload' && scanStatus !== 'match_found' && scanStatus !== 'no_match' && (
            <div className="p-6 border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-2xl bg-slate-50/70 text-center space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {language === 'bn' ? 'শিশুর সাম্প্রতিক পোর্ট্রেট ছবি সিলেক্ট করুন' : 'Select Portrait Photo of Child'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  JPG, PNG or WEBP &bull; Clear front-facing facial photo for best matching
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-rose-500" />
                <span>{language === 'bn' ? 'ডিভাইস থেকে ছবি বেছে নিন' : 'Browse Child Photo'}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* STATUS: MATCH FOUND NOTIFICATION & WORKFLOW */}
          {scanStatus === 'match_found' && matchedResult && (
            <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-4 animate-in fade-in duration-200">
              {/* Header Match Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                      {language === 'bn' ? '🎉 শিশু সনাক্ত হয়েছে! (Child Found)' : '🎉 Child Found! Match Confirmed'}
                    </span>
                    <div className="text-[11px] text-emerald-700">
                      {language === 'bn' 
                        ? `বায়োমেট্রিক মিল: ${matchedResult.similarity}% (Euclidean Distance: ${matchedResult.distance})` 
                        : `Biometric Confidence: ${matchedResult.similarity}% (Distance: ${matchedResult.distance})`}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-emerald-200 text-emerald-900 text-[10px] font-black rounded-full font-mono">
                  MATCH {matchedResult.similarity}%
                </span>
              </div>

              {/* Matched Child Profile Snapshot Card */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs flex items-start gap-3.5">
                <div className="relative w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  {matchedResult.child.photoUrl ? (
                    <img 
                      src={matchedResult.child.photoUrl} 
                      alt={matchedResult.child.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-700 font-mono text-sm">
                      {matchedResult.child.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {matchedResult.child.name}
                    </span>
                    {matchedResult.child.nickname && (
                      <span className="text-xs text-slate-500">
                        ("{matchedResult.child.nickname}")
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900 px-1.5 py-0.5 bg-slate-100 rounded text-[11px]">
                      {matchedResult.child.id}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {matchedResult.child.estimatedAge} yrs &bull; {matchedResult.child.gender}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {matchedResult.child.shelterName}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                      {matchedResult.child.caseStatus}
                    </span>
                    {matchedResult.child.rescueHistory && matchedResult.child.rescueHistory.length > 0 && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                        {matchedResult.child.rescueHistory.length} previous rescue encounters
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Action Buttons */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => handleProceedToProfile(matchedResult.child.id)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ডিটেইল প্রোফাইল ও কেস হিস্ট্রি খুলুন' : 'Open Detailed Profile'}</span>
                  </button>

                  {onOpenAddRescueLog && (
                    <button
                      type="button"
                      onClick={() => {
                        stopCameraStream();
                        onClose();
                        onOpenAddRescueLog(matchedResult.child);
                      }}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'bn' ? 'নতুন রেসকিউ লগ যুক্ত করুন' : 'Add New Rescue Location/Log'}</span>
                    </button>
                  )}
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleResetScanner}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    {language === 'bn' ? 'আরেকটি শিশুর ফেস স্ক্যান করুন' : 'Scan Another Child'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATUS: NO MATCH FOUND NOTIFICATION & WORKFLOW */}
          {scanStatus === 'no_match' && (
            <div className="p-4 sm:p-5 bg-amber-50 border border-amber-300 rounded-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                  <Info className="w-5 h-5 text-amber-700" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                    {language === 'bn' 
                      ? 'কোনো পূর্ববর্তী শিশু রেকর্ড পাওয়া যায়নি' 
                      : 'No Existing Child Record Found With This Face'}
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {language === 'bn'
                      ? 'এই শিশুর বায়োমেট্রিক ফেস ডাটাবেজের কোনো রেজিস্টার্ড প্রোফাইলের সাথে মেলেনি। এটি সম্ভবত একটি সম্পূর্ণ নতুন রেসকিউ কেস।'
                      : 'This child’s facial features do not match any existing registered records in the database. This appears to be a new rescue intake.'}
                  </p>
                </div>
              </div>

              {/* Captured Photo Snapshot thumbnail */}
              {capturedPhotoUrl && (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-amber-200">
                  <img 
                    src={capturedPhotoUrl} 
                    alt="Scanned Face" 
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" 
                  />
                  <div className="text-xs text-slate-600 min-w-0">
                    <span className="font-bold text-slate-900 block truncate">Captured Face Photo</span>
                    <span className="text-[11px] text-emerald-700 block truncate font-mono">
                      ✓ 128-d descriptor vector extracted
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons for No Match */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleProceedToNewRegistration}
                  className="flex-1 py-3 bg-[#E31B23] hover:bg-[#c9151d] text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {language === 'bn' 
                      ? 'এই ছবি সহ নতুন শিশু নিবন্ধন করুন' 
                      : 'Register New Child With This Face'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetScanner}
                  className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 rounded-xl text-xs transition-all cursor-pointer"
                >
                  {language === 'bn' ? 'পুনরায় স্ক্যান' : 'Rescan'}
                </button>
              </div>
            </div>
          )}

          {/* GENERAL ERROR VIEW */}
          {scanStatus === 'error' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={handleResetScanner}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>LEEDO Biometric Privacy & Child Protection Protocol</span>
          </span>
          <span className="font-mono text-slate-400">Euclidean Threshold &le; 0.58</span>
        </div>
      </div>
    </div>
  );
};
