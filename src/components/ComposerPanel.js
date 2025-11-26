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
  const [selectedPlatform, setSelectedPlatform] = useState('twitter'); // 'twitter' or 'linkedin'
  const [linkedinUser, setLinkedinUser] = useState(null);
  // Platform-specific character limits
  const maxCharacters = selectedPlatform === 'linkedin' ? 3000 : 280;

  useEffect(() => {
    const linkedinTokens = localStorage.getItem('linkedinTokens');
    if (linkedinTokens) {
      const parsed = JSON.parse(linkedinTokens);
      setLinkedinUser(parsed.name || 'LinkedIn User');
    }

    // Load saved draft on component mount
    const savedDraft = localStorage.getItem('composerDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setTweetContent(draft.content || '');
      setHashtags(draft.hashtags || []);
      setSelectedPlatform(draft.platform || 'twitter');
      setMediaFiles(draft.mediaFiles || []);
      setContentSource(draft.contentSource || 'manual');
    }
  }, []);

  // Save draft to localStorage whenever content changes
  useEffect(() => {
    if (tweetContent || hashtags.length > 0) {
      const draft = {
        content: tweetContent,
        hashtags,
        platform: selectedPlatform,
        mediaFiles: [], // Don't persist actual file objects
        contentSource
      };
      localStorage.setItem('composerDraft', JSON.stringify(draft));
    }
  }, [tweetContent, hashtags, selectedPlatform, contentSource]);

  useEffect(() => {
    if (selectedTrend) {
      // Don't set a generic template - let AI generate platform-appropriate content
      setTweetContent(''); // Start with empty content
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
      // Platform-specific prompts
      const platformPrompts = {
        twitter: `Write an engaging, creative tweet about the trending topic: ${selectedTrend.hashtag}. Make it contextual and interesting. Include relevant hashtags. IMPORTANT: Keep it under 250 characters to fit Twitter's limit.`,
        linkedin: `Write an engaging, professional LinkedIn post about the trending topic: ${selectedTrend.hashtag}. Make it contextual, insightful, and longer-form (around 500-800 characters). Include relevant hashtags and provide value to professionals.`
      };

      const res = await axios.post(`${API_BASE}/tweets/generate`, {
        prompt: platformPrompts[selectedPlatform] || platformPrompts.twitter
      });

      let text = res.data.text || "";

      // Clean up the text - remove common prefixes like "Category:", "Tweet:", etc.
      text = text
        .replace(/^Category:\s*[^\n]+\s*/i, '')  // Remove "Category: ..." line
        .replace(/^Tweet:\s*/i, '')               // Remove "Tweet:" prefix  
        .replace(/^Post:\s*/i, '')                // Remove "Post:" prefix
        .replace(/^Content:\s*/i, '')             // Remove "Content:" prefix
        .trim();

      // Set the AI-generated text as the tweet content
      if (text) {
        setTweetContent(text);
        setContentSource('ai');
      }

      // Extract hashtags from the generated text
      const extractedTags = text.match(/#[a-z0-9_]+/gi) || [];
      const uniqueTags = [...new Set(extractedTags)];

      // If no tags found, provide some fallbacks
      if (uniqueTags.length === 0) {
        setSuggestedHashtags(['#Trending', '#News', '#Update']);
      } else {
        setSuggestedHashtags(uniqueTags);
      }

    } catch (err) {
      console.error("AI Gen failed", err);
      // Fallback to a simple template if AI fails
      setTweetContent(`Check out what's trending: ${selectedTrend.hashtag} 🔥`);
      setSuggestedHashtags([selectedTrend.hashtag, '#Trending', '#News']);
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
      platform: selectedPlatform, // Add platform selection
    };

    onTweetPost(tweet);
    resetComposer();
  };

  const handleScheduleTweet = () => {
    if (tweetContent.trim() === '' || !scheduleDate) return;

    const tweet = {
      content: tweetContent,
      hashtags: hashtags,
      platform: selectedPlatform, // Add platform selection
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
    // Clear saved draft
    localStorage.removeItem('composerDraft');
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

      <div className="platform-selector" style={{ padding: '0 20px 20px', display: 'flex', gap: '16px' }}>
        <button
          onClick={() => setSelectedPlatform('twitter')}
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: '12px',
            border: selectedPlatform === 'twitter' ? 'none' : '2px solid rgba(0, 229, 255, 0.3)',
            background: selectedPlatform === 'twitter' ? 'linear-gradient(135deg, #00E5FF, #8B5CF6)' : 'transparent',
            color: selectedPlatform === 'twitter' ? 'white' : '#00E5FF',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            boxShadow: selectedPlatform === 'twitter' ? '0 0 20px rgba(0, 229, 255, 0.5)' : 'none',
            transform: selectedPlatform === 'twitter' ? 'translateY(-2px)' : 'none'
          }}
        >
          🐦 Twitter
        </button>
        <button
          onClick={() => setSelectedPlatform('linkedin')}
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: '12px',
            border: selectedPlatform === 'linkedin' ? 'none' : '2px solid rgba(255, 20, 147, 0.3)',
            background: selectedPlatform === 'linkedin' ? 'linear-gradient(135deg, #8B5CF6, #FF1493)' : 'transparent',
            color: selectedPlatform === 'linkedin' ? 'white' : '#FF1493',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            boxShadow: selectedPlatform === 'linkedin' ? '0 0 20px rgba(255, 20, 147, 0.5)' : 'none',
            transform: selectedPlatform === 'linkedin' ? 'translateY(-2px)' : 'none'
          }}
        >
          💼 LinkedIn
        </button>
      </div>

      <div className="panel-body scrollable">
        {/* Tweet Composer */}
        <div className="composer-box card-elevated">
          <textarea
            className={`tweet-input ${contentSource === 'ai' ? 'ai-generated' : ''}`}
            placeholder={selectedPlatform === 'linkedin' ? 'Share your professional insights...' : 'Share your thoughts about this trend...'}
            value={tweetContent}
            onChange={(e) => { setTweetContent(e.target.value); setContentSource('manual'); }}
            maxLength={maxCharacters}
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
