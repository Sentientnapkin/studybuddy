# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`
from firebase_admin import initialize_app, storage
from flask import Flask, request, jsonify
import os

# Initialize Firebase Admin SDK
initialize_app()

# Create Flask app for HTTP handling
app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_file():
    # Ensure the request contains a file
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save file temporarily
    temp_file_path = os.path.join('/tmp', file.filename)
    file.save(temp_file_path)

    # Upload the file to Firebase Storage
    bucket = storage.bucket()
    blob = bucket.blob(f"uploads/{file.filename}")
    blob.upload_from_filename(temp_file_path)

    # Clean up the temp file
    os.remove(temp_file_path)

    # Return success response
    return jsonify({"message": "File uploaded successfully", "url": blob.public_url})

if __name__ == '__main__':
    app.run(debug=True)
