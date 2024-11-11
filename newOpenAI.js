const OpenAI = require("openai");

// Initialize OpenAI with your API key
const openai = new OpenAI({
    apiKey: "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" // Make sure to set this in your environment variables
});

// console.log(process.env.OPENAI_API_KEY);

async function createChatCompletion() {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "user", "content": "Write a haiku about AI" }
            ]
        });

        // Output the response
        console.log("Chat Completion:", completion.choices[0].message.content);
    } catch (error) {
        console.error("Error creating chat completion:", error);
    }
}

// Run the function
createChatCompletion();
