const { generateAssistantResponse } = require('../services/aiAssistantService');

// @desc    Process natural language scheme assistance queries
// @route   POST /api/chat
// @access  Public
const handleChat = async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    const response = await generateAssistantResponse(message.trim(), language);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('[AI Chat Error]', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate assistant response. Please try again.' });
  }
};

module.exports = {
  handleChat,
};
