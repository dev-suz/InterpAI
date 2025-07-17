import React from "react";
import { speechToText, chatGPT, synthesizeSpeech } from "../utils/apis";
import { useState } from "react";
import AudioRecoder from "./AudioRecorder";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleAudioCaptured = async (audioBlob) => {
    try {
      console.log("hello ???");
      // 1. STT
      const resultSTT = await speechToText(audioBlob);
      setQuery(resultSTT);
      console.log("====resultSTT", resultSTT);
      // 2. Chat
      const resultChat = await chatGPT(resultSTT);
      console.log("===rsChat", resultChat);
      setResponse(resultChat);
      // 3.  TTS
      await synthesizeSpeech(resultChat);
    } catch (error) {
      console.log("error 발생 :", error);
    }
  };
  return (
    <div>
      <p>녹음된 질문 : {query} </p>
      <AudioRecoder onAudioCaptured={handleAudioCaptured} />
      <p>gpt 의 응답 : {response} </p>
    </div>
  );
}
