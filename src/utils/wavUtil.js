const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}; // WAV 파일 변환을 위한 유틸리티 함수

export const encodeWAV = (audioBuffer, sampleRate) => {
  const numOfChannels = 1; // 단일 채널
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const buffer = new ArrayBuffer(44 + audioBuffer.length * bytesPerSample);
  const view = new DataView(buffer);

  // WAV 헤더 작성
  writeString(view, 0, "RIFF"); // ChunkID
  view.setUint32(4, 36 + audioBuffer.length * bytesPerSample, true); // ChunkSize
  writeString(view, 8, "WAVE"); // Format
  writeString(view, 12, "fmt "); // Subchunk1ID
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, numOfChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(view, 36, "data"); // Subchunk2ID
  view.setUint32(40, audioBuffer.length * bytesPerSample, true); // Subchunk2Size

  // 오디오 데이터를 PCM으로 변환
  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    const sample = Math.max(-1, Math.min(1, audioBuffer[i])); // -1 ~ 1 사이 값 제한
    view.setInt16(offset, sample * 0x7fff, true); // 16-bit PCM 값으로 변환
    offset += bytesPerSample;
  }

  return new Blob([buffer], { type: "audio/wav" });
};
