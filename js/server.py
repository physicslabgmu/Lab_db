from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for all origins

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_prompt = data.get('prompt', '')

        if not user_prompt:
            return jsonify({'response': 'Please enter a message.'}), 400

        # Example response logic (Replace with actual chatbot logic)
        bot_response = generate_response(user_prompt)

        return jsonify({'response': bot_response})

    except Exception as e:
        return jsonify({'response': f'Error: {str(e)}'}), 500

def generate_response(prompt):
    """ Simple function to return a bot response """
    responses = {
        "hello": "Hello! How can I assist you?",
        "who are you": "I am an AI assistant!",
        "help": "Sure! What do you need help with?"
    }
    return responses.get(prompt.lower(), f"I don't understand: {prompt}")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
