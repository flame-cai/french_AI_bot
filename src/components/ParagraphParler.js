import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; 
import TextToSpeech from './TextToSpeech';

const ParagraphParler = ({ selectedWeek }) => {
  const [paragraph, setParagraph] = useState('');
  const { token } = useAuth();
  const [speed, setSpeed] = useState(0.85);

  useEffect(() => {
    const fetchParagraph = async () => {
      try {
        const response = await axios.post('https://asia-south1-ppt-tts.cloudfunctions.net/fr-lang-backend/para', { week: selectedWeek },{
            headers: {
                'Authorization': `Bearer ${token}`, // Include the token in the headers
              },
        });
        console.log(response)
        setParagraph(response.data.paragraph);
      } catch (error) {
        console.error('Error fetching paragraph:', error);
      }
    };

    fetchParagraph();
  }, [selectedWeek]);

  return(
    <div class="chat-container">
        <h1>Paragraph Parler</h1>
        <div className="paragraph-container">
      <p dangerouslySetInnerHTML={{ __html: paragraph }} />
      Normal speed: &nbsp; <TextToSpeech text={paragraph.replace(/\<br\>/g,'')}  speed={speed} /> &nbsp;
      Slow speed: &nbsp; <TextToSpeech text={paragraph.replace(/\<br\>/g,'')}  speed={0.75*speed} />
      {/* <button onClick={() => setSpeed(0.1)} className="btn btn-small btn-secondary">
          Slow Down to 75%
        </button>
        <button onClick={() => setSpeed(0.85)} className="btn btn-small btn-secondary">
          Reset Speed
        </button> */}
    </div>
    </div>
  );
};

export default ParagraphParler;