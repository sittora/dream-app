import React, { useState } from 'react';
import '../styles/dreams.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSmile, 
  faMeh, 
  faFrown, 
  faSave, 
  faTimesCircle 
} from '@fortawesome/free-solid-svg-icons';

const Dreams = () => {
  const [dreamText, setDreamText] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const moodOptions = [
    { icon: faSmile, label: 'Positive', value: 'positive' },
    { icon: faMeh, label: 'Neutral', value: 'neutral' },
    { icon: faFrown, label: 'Negative', value: 'negative' },
  ];

  const commonTags = [
    'Lucid', 'Recurring', 'Nightmare', 'Flying', 'Chase', 'Water',
    'Family', 'Adventure', 'Spiritual', 'Prophetic'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle dream submission logic here
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="dreams-container">
      <form className="dream-entry-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>Record Your Dream</h2>
          <p>Capture the essence of your dreams while they're still fresh in your mind</p>
        </div>

        <div className="dream-input-group">
          <label className="dream-input-label" htmlFor="dreamText">
            Dream Description
          </label>
          <textarea
            id="dreamText"
            className="dream-input-field"
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            placeholder="Describe your dream in detail..."
            required
          />
        </div>

        <div className="dream-input-group">
          <label className="dream-input-label">Dream Mood</label>
          <div className="mood-selector">
            {moodOptions.map((mood) => (
              <div
                key={mood.value}
                className={`mood-option ${selectedMood === mood.value ? 'selected' : ''}`}
                onClick={() => setSelectedMood(mood.value)}
              >
                <div className="mood-icon">
                  <FontAwesomeIcon icon={mood.icon} />
                </div>
                <span>{mood.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dream-input-group">
          <label className="dream-input-label">Dream Tags</label>
          <div className="dream-tags">
            {commonTags.map((tag) => (
              <span
                key={tag}
                className={`dream-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="dream-buttons-container">
          <button
            type="button"
            className="dream-button dream-button-secondary"
            onClick={() => {
              setDreamText('');
              setSelectedMood(null);
              setSelectedTags([]);
            }}
          >
            <FontAwesomeIcon icon={faTimesCircle} />
            Clear
          </button>
          <button type="submit" className="dream-button dream-button-primary">
            <FontAwesomeIcon icon={faSave} />
            Save Dream
          </button>
        </div>
      </form>
    </div>
  );
};

export default Dreams;
