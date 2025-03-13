# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`
#from firebase_functions import firestore_fn, https_fn
import firebase_admin
from firebase_admin import initialize_app, firestore, storage, credentials
import google.cloud.firestore
from flask import Flask, request, jsonify
import os

# Initialize Firebase Admin SDK
initialize_app()

# Firestore Database Instance
db = firestore.client()

# Create Flask app for HTTP handling
app = Flask(__name__)

# Cloud Function that takes in Note File (PDF) and adds file to Firebase Storage
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
    bucket = storage.bucket("studybuddy-d4472.appspot.com")
    blob = bucket.blob(f"uploads/{file.filename}")
    blob.upload_from_filename(temp_file_path)

    # Clean up the temp file
    os.remove(temp_file_path)

    # Return success response
    return jsonify({"message": "File uploaded successfully", "url": blob.public_url})

# Cloud Function to Handle Audio Metadata Storage
@app.route('/store_audio_metadata', methods=['POST'])
def store_audio_metadata():
    try:
        # Ensure request is JSON
        data = request.get_json()

        # Extract metadata from request
        file_name = data.get("fileName")
        download_url = data.get("downloadURL")

        if not file_name or not download_url:
            return jsonify({"error": "Missing fileName or downloadURL"}), 400

        # Save metadata in Firestore
        doc_ref = db.collection("audioRecordings").add({
            "name": file_name,
            "fileUrl": download_url,
            "createdAt": firestore.SERVER_TIMESTAMP,
        })

        return jsonify({"success": True, "id": doc_ref[1].id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run Flask App (for local testing)
if __name__ == '__main__':
    app.run(port=5000)
