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

# Create Flask app 
app = Flask(__name__)

# Firebase Storage bucket 
bucket = storage.bucket("studybuddy-d4472.appspot.com")

# Cloud Function that takes in Note File and adds file to Firebase Storage and Firestore
@app.route('/upload_html_note', methods=['POST'])
def upload_note():

    # Extracting HTML String
    data = request.get_json()
    html_content = data.get("htmlString") 
    file_name = data.get("fileName", f"note_{int(os.time())}.html") 
    
    # Saving HTML String as temp File
    temp_file_path = os.path.join("/tmp", file_name)
    with open(temp_file_path, "w", encoding="utf-8") as file:
        file.write(html_content)

    #stores temporary file in Notes folder in bucket (Firebase Storage)
    blob = bucket.blob(f"Notes/{file_name}") 
    blob.upload_from_filename(temp_file_path, content_type="text/html")

    #signed url (temp) CAN BE REMOVED 
    signed_url = blob.generate_signed_url(expiration=3600)

    #removes temp file
    os.remove(temp_file_path)

    # Uploading MetaData to FireStore
    doc_ref = db.collection("notes").add({
            "name": file.filename,
            "fileUrl": signed_url,
            "createdAt": firestore.SERVER_TIMESTAMP,
        })
    
    # Return success message
    return jsonify({"message": "File uploaded successfully", "url": blob.public_url, "id": doc_ref[1].id})

# Cloud Function to Handle Audio Metadata (Firestore) and Cloud Storage (Firebase)
@app.route('/store_audio_metadata', methods=['POST'])
def store_audio_metadata():
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Temp file
        temp_file_path = os.path.join('/tmp', file.filename)
        file.save(temp_file_path)

        # Upload to Firebase Storage Recordings Folder
        blob = bucket.blob(f"Recordings/{file.filename}")
        blob.upload_from_filename(temp_file_path, content_type="audio/mp4")  # Set to mp4 for M4A Audio File Type

        # temp signed url CAN BE REMOVED
        signed_url = blob.generate_signed_url(expiration=3600)

        # delete temp file
        os.remove(temp_file_path)

        # Store Metadata in Firestore
        doc_ref = db.collection("audioRecordings").add({
            "name": file.filename,
            "fileUrl": signed_url,
            "createdAt": firestore.SERVER_TIMESTAMP,
        })

        #Success Message
        return jsonify({
            "message": "Audio uploaded successfully",
            "url": signed_url,
            "id": doc_ref[1].id
        }), 200

# Cloud Function to Store To-Do List Items in Firestore (NO Firebase Storage)
@app.route('/add_todo', methods=['POST'])
def add_todo():
    
    # JSON File Check
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")

    if not title or not description:
        return jsonify({"error": "Missing title or description"}), 400

    # Save to Firestore
    doc_ref = db.collection("toDoList").add({
        "title": title,
        "description": description,
        "createdAt": firestore.SERVER_TIMESTAMP,
    })

    return jsonify({"success": True, "id": doc_ref[1].id}), 200

# Run Flask App (for local testing)
if __name__ == '__main__':
    app.run(port=5000)
