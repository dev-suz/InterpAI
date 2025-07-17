import React from "react";
import { useState, useRef } from "react";
import { encodeWAV } from "../utils/wavUtil";

export default function AudioRecoder({ onAudioCaptured }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecordRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    // 마이크 사용 허가
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // mediaRecorder  레퍼런스 나중에 사용
    mediaRecordRef.current = new MediaRecorder(stream);

    mediaRecordRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecordRef.current.onstop = async () => {
      // Blob(대상, 형식)
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      // wave 헤더에 들어가는 내용
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer);

      const wavBlob = encodeWAV(
        audioBuffer.getChannelData(0),
        // 초당비율
        audioBuffer.sampleRate
      );

      // Wave의 URL
      const wavUrl = URL.createObjectURL(wavBlob);

      setAudioUrl(wavUrl);

      // 넘기기
      onAudioCaptured(wavBlob);
      // 자원정리
      audioChunksRef.current = [];
    };
    mediaRecordRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    mediaRecordRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "녹음중지" : "녹음 시작"}
      </button>
      {audioUrl && (
        <div>
          <p>녹음된 오디오</p>
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  );
}
