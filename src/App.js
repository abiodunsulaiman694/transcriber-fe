import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import TimePicker from './TimePicker';
import { toast, ToastContainer } from 'react-toastify';

// Helper function for conversion from time to seconds
const timeToSeconds = (time) => {
  const [hours, minutes, seconds] = time.split(':').map((v) => parseInt(v, 10));
  return hours * 3600 + minutes * 60 + seconds;
};

// Helper function for conversion from seconds to time
const secondsToTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Helper function for conversion from time to minutes and seconds
const timeToMinutesAndSeconds = (time) => {
  const totalSeconds = timeToSeconds(time);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const TranscriptionPage = () => {
  const [uploading, setUploading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('00:10:00'); // 10 minutes default endtime
  const [audioDuration, setAudioDuration] = useState(null);

  const handleStartTimeChange = (newStartTime) => {
    const startTimeSeconds = timeToSeconds(newStartTime);
    const endTimeSeconds = timeToSeconds(endTime);

    if (startTimeSeconds >= endTimeSeconds) {
      const newEndTimeSeconds = Math.min(startTimeSeconds + 600, audioDuration || 0);
      const newEndTime = secondsToTime(newEndTimeSeconds);
      setEndTime(newEndTime);
    }

    setStartTime(newStartTime);
  };

  const getAudioDuration = (file) => {
    const audio = new Audio(URL.createObjectURL(file));
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    if (!file.type.startsWith('audio/') || file.size > 400 * 1024 * 1024) {
      return;
    }

    setAudioFile(file);
    getAudioDuration(file);
  }, []);

  const transcribeAudio = async () => {
    setUploading(true);

    try {
      const formData = new FormData();
      audioFile && formData.append('file', audioFile);
      formData.append('startTime', timeToMinutesAndSeconds(startTime));
      formData.append('endTime', timeToMinutesAndSeconds(endTime));

      const response = await axios.post(`http://localhost:3001/api/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTranscription(response.data.transcription);
      toast.success('Transcription successful.')
    } catch (error) {
      toast.error('An error occurred during transcription.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: 'audio/*',
  });

  return (
    <div className="container mx-auto py-12">
      <ToastContainer />
      <h1 className="text-4xl mb-6">Wrytr</h1>
      <div
        {...getRootProps()}
        className={`dropzone p-6 border-2 border-dashed rounded ${isDragActive ? 'border-green-500' : isDragReject ? 'border-red-500' : 'border-gray-300'
          }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the audio file here...</p>
        ) : audioFile ? (
          <p>Selected file: {audioFile.name}</p>
        ) : (
          <p>Drag and drop an audio file here, or click to select a file</p>
        )}
      </div>
      <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8 mt-2">
        <TimePicker id="start-time" label="Start Time:" value={startTime} onChange={handleStartTimeChange} maxDuration={audioDuration || Infinity} />
        <TimePicker id="end-time" label="End Time:" value={endTime} onChange={setEndTime} maxDuration={audioDuration || Infinity} />
      </div>
      {uploading && <p className="mt-4">Uploading and transcribing...</p>}
      {transcription && (
        <div className="mt-4">
          <h2 className="text-2xl mb-2">Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}
      <button
        className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded"
        onClick={transcribeAudio}
        disabled={uploading || !audioFile}
      >
        Transcribe
      </button>
    </div>
  );
};

export default TranscriptionPage;
