// #  functional_flow :  음성인식 ->  STT -> OPENAI -> TTS

// fetch
// STT
const speechToText = async (audio) => {
  const endPoint = process.env.REACT_APP_STT_ENDPOINT;
  const apiKey = process.env.REACT_APP_SPEECH_STT_KEY;

  console.log("STT endpoint:", endPoint);
  console.log("STT key:", apiKey);

  const response = await fetch(endPoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Content-Type": "application/octet-stream",
    },
    body: audio,
  });
  const result = await response.json();
  return result.DisplayText;
};

// GPT
const chatGPT = async (text) => {
  const endPoint = process.env.REACT_APP_CHAT_ENDPOINT;
  const apiKey = process.env.REACT_APP_CHAT_KEY;

  const response = await fetch(endPoint, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: "너는 친절하고 유능한 조력자야" },
        {
          role: "system",
          content:
            "일체의 마크업이나 html 요소들을 생략하고 일반 텍스트만 답변해줘. 특수기호 사용 금지!",
        },
        {
          role: "user",
          content: text,
        },
      ],
    }),
  });
  const result = await response.json();
  return result.choices[0].message.content;
};

// TTS
// wav 파일 url 받아서 재생
// SSML(Speech Synthesis Markup Language, 음성 합성 마크업 언어)
const synthesizeSpeech = async (text) => {
  const endPoint = process.env.REACT_APP_TTS_ENDPOINT;
  const apiKey = process.env.REACT_APP_SPEECH_STT_KEY;
  const response = await fetch(endPoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "riff-16khz-16bit-mono-pcm",
    },
    body: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ko-KR">
                <voice name="ko-KR-SunHiNeural">
                    ${text}
                </voice>
            </speak>`,
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("TTS API Error", errorText);
    throw new Error("TTS API 호출 실패");
  }
  // Byte단위로 직렬화 되서 온것 받음
  const audioBlob = await response.blob();

  // audio 저장된 URL 받음
  const audioURL = URL.createObjectURL(audioBlob);

  // audio 플레이어 만들고
  const audio = new Audio(audioURL);
  // 재생
  audio.play();
};

export { speechToText, chatGPT, synthesizeSpeech };
