from flask import Flask, request, jsonify
from transformers import BartTokenizer, BartForConditionalGeneration
from flask_cors import CORS  # Importing CORS

# Initialize the Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Load the BART model and tokenizer
tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')
model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')

def generate_summary(text):
    # Encode the input text
    inputs = tokenizer.encode("summarize: " + text, return_tensors="pt", max_length=1024, truncation=True)
    
    # Generate summary using the model
    summary_ids = model.generate(inputs, max_length=100, min_length=100, length_penalty=2.0, num_beams=4, early_stopping=True)
    
    # Decode the summary
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

@app.route('/summarize', methods=['POST'])
def summarize_text():
    # Get JSON data from the request
    data = request.get_json()

    # Check if 'text' is in the request
    if 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400

    # Get the text from the request
    text = data['text']

    # Generate the summary
    summary = generate_summary(text)

    # Return the summary in a JSON response
    return jsonify({'summary': summary})

if __name__ == '__main__':
    # Run the Flask app on localhost, port 5000
    app.run(debug=True)
