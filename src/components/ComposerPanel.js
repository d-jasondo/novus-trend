import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaCalendarAlt, FaPlus, FaTimes, FaImage, FaMagic } from 'react-icons/fa';
import './ComposerPanel.css';

const API_BASE = 'http://localhost:4000';

function ComposerPanel({ selectedTrend, onTweetPost, onTweetSchedule }) {
  const [tweetContent, setTweetContent] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [suggestedHashtags, setSuggestedHashtags] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [characterCount, setCharacterCount] = useState(0);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [contentSource, setContentSource] = useState('manual'); // 'manual' or 'ai'
  const maxCharacters = 280;

  useEffect(() => {
    if (selectedTrend) {
      setTweetContent(`Just discovered something amazing about ${selectedTrend.hashtag}! 🚀\n\n`);
      setContentSource('manual');
      generateAISuggestions();
    }
  }, [selectedTrend]);

  useEffect(() => {
    setCharacterCount(tweetContent.length);
  }, [tweetContent]);

  const generateAISuggestions = async () => {
    if (!selectedTrend) return;
    setIsLoadingAI(true);
    try {
      const res = await axios.post(`${API_BASE}/tweets/generate`, {
        prompt: selectedTrend.hashtag
      });
      // The backend returns { ok: true, text: "..." }
      // We can parse hashtags from the text or just append the text to content
      // For this UI, we expect hashtags list. 
      // Let's try to extract hashtags from the generated text or just show a few generic ones + the text as suggestion

      // Simple extraction of hashtags from text
      const text = res.data.text || "";
      const extractedTags = text.match(/#[a-z0-9_]+/gi) || [];
      const uniqueTags = [...new Set(extractedTags)];

      // If no tags found, provide some fallbacks
      if (uniqueTags.length === 0) {
        setSuggestedHashtags(['#Trending', '#News', '#Update']);
      } else {
        setSuggestedHashtags(uniqueTags);
      }

      // Optionally update content with the generated text if it's empty or user wants it
      // For now, we just suggest hashtags as per original UI design, 
      // but maybe we can set the content too if it's the initial load?
      // Let's just stick to hashtags for now to match UI.

    } catch (err) {
      console.error("AI Gen failed", err);
      setSuggestedHashtags(['#Error', '#TryAgain']);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const addHashtag = (tag) => {
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setSuggestedHashtags(suggestedHashtags.filter(h => h !== tag));
    }
  };

  const removeHashtag = (tag) => {
    setHashtags(hashtags.filter(h => h !== tag));
  };

  const handlePostTweet = () => {
    if (tweetContent.trim() === '') return;

    const tweet = {
      content: tweetContent,
      hashtags: hashtags,
      media: mediaFiles.map(m => m.file), // Include media files
    };

    onTweetPost(tweet);
    resetComposer();
  };

  const handleScheduleTweet = () => {
    if (tweetContent.trim() === '' || !scheduleDate) return;

    const tweet = {
      content: tweetContent,
      hashtags: hashtags,
    };

    const scheduledTime = new Date(`${scheduleDate}T${scheduleTime}`);
    onTweetSchedule(tweet, scheduledTime);
    resetComposer();
    setShowScheduler(false);
  };

  const resetComposer = () => {
    setTweetContent('');
    setHashtags([]);
    setSuggestedHashtags([]);
    setScheduleDate('');
    setScheduleTime('09:00');
    setMediaFiles([]);
    setContentSource('manual');
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type
    }));
    setMediaFiles([...mediaFiles, ...newMedia].slice(0, 4)); // Max 4 images
  };

  const removeMedia = (index) => {
    const newMedia = [...mediaFiles];
    URL.revokeObjectURL(newMedia[index].preview);
    newMedia.splice(index, 1);
    setMediaFiles(newMedia);
  };

  const generateCaptionFromImage = async () => {
    if (mediaFiles.length === 0) return;

    setIsGeneratingCaption(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(mediaFiles[0].file);
      reader.onloadend = async () => {
        const base64Data = reader.result;
        const mimeType = mediaFiles[0].type;

        const res = await axios.post(`${API_BASE}/tweets/generate-caption`, {
          imageData: base64Data,
          mimeType: mimeType
        });

        if (res.data.ok) {
          setTweetContent(res.data.text);
          setContentSource('ai');

          // Extract hashtags from generated text
          const extractedTags = res.data.text.match(/#[a-z0-9_]+/gi) || [];
          const uniqueTags = [...new Set(extractedTags)];
          setSuggestedHashtags(uniqueTags);
        }
      };
    } catch (err) {
      console.error("Caption generation failed", err);
      alert("Failed to generate caption. Please try again.");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const isCharacterLimitExceeded = characterCount > maxCharacters;
  const canPost = tweetContent.trim() !== '' && !isCharacterLimitExceeded;

  return (
    <div className="composer-panel">
      <div className="panel-header">
        <h2>✍️ Compose Tweet</h2>
        {selectedTrend && <span className="selected-trend">{selectedTrend.hashtag}</span>}
      </div>

      <div className="panel-body scrollable">
        {/* Tweet Composer */}
        <div className="composer-box card-elevated">
          <textarea
            className={`tweet-input ${contentSource === 'ai' ? 'ai-generated' : ''}`}
            placeholder="Share your thoughts about this trend..."
            value={tweetContent}
            onChange={(e) => { setTweetContent(e.target.value); setContentSource('manual'); }}
            maxLength={280}
          />

          <div className="composer-footer">
            <div className="composer-footer-left">
              {/* Media Upload Button */}
              <label className="btn-upload-media" title="Add media">
                <FaImage />
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleMediaUpload}
                />
              </label>

              {/* Generate Caption from Image */}
              {mediaFiles.length > 0 && (
                <button
                  className="btn-generate-caption"
                  onClick={generateCaptionFromImage}
                  disabled={isGeneratingCaption}
                  title="Generate AI caption from image"
                >
                  {isGeneratingCaption ? <FaSpinner className="spinner" /> : <FaMagic />}
                  {isGeneratingCaption ? ' Generating...' : ' AI Caption'}
                </button>
              )}

              {/* Content Source Badge */}
              {contentSource === 'ai' && (
                <span className="content-source-badge ai">🤖 AI Generated</span>
              )}
            </div>

            <span className={`char-count ${isCharacterLimitExceeded ? 'exceeded' : ''}`}>
              {characterCount}/{maxCharacters}
            </span>
          </div>

          {/* Media Preview */}
          {mediaFiles.length > 0 && (
            <div className="media-preview-container">
              {mediaFiles.map((media, index) => (
                <div key={index} className="media-preview">
                  <img src={media.preview} alt={`Upload ${index + 1}`} />
                  <button className="btn-remove-media" onClick={() => removeMedia(index)}>
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Suggestion Box */}
        {selectedTrend && (
          <div className="ai-suggestion-box card">
            <div className="suggestion-header">
              <h3>🤖 AI-Powered Suggestions</h3>
              <button
                className="btn-refresh"
                onClick={generateAISuggestions}
                disabled={isLoadingAI}
              >
                {isLoadingAI ? <FaSpinner className="spinner" /> : '↻'}
              </button>
            </div>

            {isLoadingAI ? (
              <div className="loading-state">
                <FaSpinner className="spinner pulse" />
                <p>Generating AI suggestions...</p>
              </div>
            ) : (
              <div className="hashtag-chips">
                {suggestedHashtags.map((tag) => (
                  <button
                    key={tag}
                    className="hashtag-chip"
                    onClick={() => addHashtag(tag)}
                  >
                    <FaPlus /> {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Hashtags */}
        {hashtags.length > 0 && (
          <div className="selected-hashtags card">
            <h4>Selected Hashtags ({hashtags.length})</h4>
            <div className="hashtag-list">
              {hashtags.map((tag) => (
                <div key={tag} className="hashtag-badge">
                  {tag}
                  <button
                    className="btn-remove-tag"
                    onClick={() => removeHashtag(tag)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="composer-actions">
        {!showScheduler ? (
          <>
            <button
              className="btn-secondary"
              onClick={() => setShowScheduler(true)}
              disabled={!canPost}
            >
              <FaCalendarAlt /> Schedule
            </button>
            <button
              className="btn-primary"
              onClick={handlePostTweet}
              disabled={!canPost}
            >
              Post Now
            </button>
          </>
        ) : (
          <>
            <div className="scheduler-box">
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="date-input"
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="time-input"
              />
            </div>
            <button
              className="btn-success"
              onClick={handleScheduleTweet}
              disabled={!scheduleDate || !canPost}
            >
              Schedule Tweet
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowScheduler(false)}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ComposerPanel;
