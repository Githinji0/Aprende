const { GoogleGenAI } = require('@google/genai');

// @desc    Interact with Gemini AI for roleplay
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
  const { userMessage, chatHistory, scenario } = req.body;

  try {
    if (!userMessage || !scenario) {
      return res.status(400).json({ message: 'User message and scenario are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API Key is not configured on the server. Please define GEMINI_API_KEY.' });
    }

    // Initialize the GoogleGenAI SDK client
    const ai = new GoogleGenAI({ apiKey });

    // Define instructions based on the selected scenario
    let scenarioInstruction = '';
    if (scenario === 'waiter') {
      scenarioInstruction = 'You are a waiter (camarero) in a traditional restaurant in Madrid. The user is a customer trying to order food in Spanish.';
    } else if (scenario === 'receptionist') {
      scenarioInstruction = 'You are a hotel receptionist (recepcionista) in Cancún, Mexico. The user is a guest checking in and asking for their room key.';
    } else if (scenario === 'market') {
      scenarioInstruction = 'You are a friendly market vendor (vendedor) in a local market in Buenos Aires, Argentina. The user is buying fresh fruits and vegetables.';
    } else {
      scenarioInstruction = `You are playing the role of: ${scenario}. Interact with the user in this context.`;
    }

    const systemInstruction = `
${scenarioInstruction}
You are a Spanish conversation partner for a language learner.
Follow these rules strictly:
1. Stay firmly in character. Do not break character under any circumstances.
2. Respond in natural, clear Spanish appropriate for a beginner to intermediate Spanish student (use simple vocabulary, clear sentence structure, and avoid overly complex idioms).
3. Limit your Spanish response to 1 to 3 sentences.
4. AT THE VERY END OF YOUR RESPONSE, append a brief English translation or hint wrapped in square brackets, exactly like this: [English translation or vocabulary tip here]. This is crucial to help the student learn.
`;

    // Map history to Google GenAI structure:
    // Format: [{ role: 'user' | 'model', parts: [{ text: string }] }]
    const formattedContents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach(msg => {
        if (msg.role && msg.content) {
          formattedContents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      });
    }

    // Add current user message
    formattedContents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Generate content targeting gemini-1.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const aiResponseText = response.text;
    res.json({ reply: aiResponseText });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ message: 'Failed to communicate with AI: ' + error.message });
  }
};

module.exports = { chatWithAI };
