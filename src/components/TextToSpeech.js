import React, { useState, useEffect } from "react";

const TextToSpeech = ({ text,speed }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterances, setUtterances] = useState([]);
  const [voiceLoaded, setVoiceLoaded] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const splitText = (text) => {
      // Split text by sentences using regex
      return text.match(/[^.!?]*[.!?]/g) || [text];
    };

    const setVoiceAndCreateUtterances = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        const selectedVoice = voices.find(voice => voice.name === 'Google français') || voices.find(voice => voice.name === 'Thomas');
        if (selectedVoice) {
          const textChunks = splitText(text);
          const utterancesArray = textChunks.map(chunk => {
            const u = new SpeechSynthesisUtterance(chunk);
            u.voice = selectedVoice;
            u.rate = speed;
            // u.rate = 0.85;
            u.lang = 'fr-FR';
            return u;
          });
          setUtterances(utterancesArray);
          setVoiceLoaded(true);
          console.log(voices);
        }
      } else {
        console.log('No voices available yet');
      }
    };

    // Set voice once voices are loaded
    setVoiceAndCreateUtterances();

    // Add event listener for voiceschanged event
    synth.onvoiceschanged = setVoiceAndCreateUtterances;

    // Fallback using setTimeout to handle cases where the event might not fire
    const fallbackTimeout = setTimeout(setVoiceAndCreateUtterances, 1000);

    return () => {
      synth.cancel();
      clearTimeout(fallbackTimeout);
    };
  }, [text, speed]);

  const handleSpeechToggle = () => {
    const synth = window.speechSynthesis;

    if (!isSpeaking) {
      if (voiceLoaded && utterances.length > 0) {
        utterances.forEach(utterance => {
          synth.speak(utterance);
        });
        setIsSpeaking(true);
      } else {
        console.log('Voice not loaded yet');
      }
    } else {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <>
      {voiceLoaded && (
        <button className="icon-btn" onClick={handleSpeechToggle} disabled={!voiceLoaded}>
          <i className="fa-solid fa-volume-high"></i>
        </button>
      )}
    </>
  );
};

export default TextToSpeech;