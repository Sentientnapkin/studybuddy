# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`
#from firebase_functions import firestore_fn, https_fn
import firebase_admin
from firebase_admin import initialize_app, firestore, storage, credentials
from firebase_functions import firestore_fn, https_fn, options
import google.cloud.firestore
from flask import Flask, request, jsonify
from typing import Any
import base64
import uuid
import json
import os

# Initialize Firebase Admin SDK
app = initialize_app()

# Firestore Database Instance
db = firestore.client()

# Firebase Storage bucket 
bucket = storage.bucket("studybuddy-d4472.firebasestorage.app")

# Cloud Function that takes in Note File and adds file to Firebase Storage and Firestore
@https_fn.on_call()
def upload_note(req: https_fn.CallableRequest) -> Any:

    # Checking that the user is authenticated.
    if req.auth is None:
        # Throwing an HttpsError so that the client gets the error details.
        raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                                  message="The function must be called while authenticated.")

    uid = req.auth.uid

    # Extracting HTML String
    html_content = req.data["note"]
    file_name = req.data["fileName"]
    
    # Saving HTML String as temp File
    temp_file_path = os.path.join("/tmp", file_name)
    with open(temp_file_path, "w", encoding="utf-8") as file:
        file.write(html_content)

    #stores temporary file in Notes folder in bucket (Firebase Storage)
    blob = bucket.blob(f"{uid}/notes/{uuid.uuid4()}")
    blob.upload_from_filename(temp_file_path, content_type="text/html")
    blob.make_public()

    public_url = blob.public_url

    #removes temp file
    os.remove(temp_file_path)

    # Uploading MetaData to FireStore
    doc_ref = db.collection(f"{uid}/notes").add({
            "name": file_name,
            "fileUrl": public_url,
            "summary": "",
            "createdAt": firestore.SERVER_TIMESTAMP,
        })
    
    # Return success message
    return {"message": "File uploaded successfully", "url": blob.public_url, "id": doc_ref[1].id}, 200

@https_fn.on_call()
def get_notes(req: https_fn.CallableRequest) -> Any:
   # Checking that the user is authenticated.
   if req.auth is None:
       # Throwing an HttpsError so that the client gets the error details.
       raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                                 message="The function must be called while authenticated.")

   uid = req.auth.uid

   todo_ref = db.collection(f"{uid}/notes")
   docs = todo_ref.stream()

   data = []

   for doc in docs:
       data.append({
                        "id": doc.id,
                        **doc.to_dict()
                   })

   return {"success": True, "data": data}, 200

@https_fn.on_call()
def delete_note(req: https_fn.CallableRequest) -> Any:
    # Checking that the user is authenticated.
    if req.auth is None:
        # Throwing an HttpsError so that the client gets the error details.
        raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                                  message="The function must be called while authenticated.")


    document_id = req.data["id"]

    todo = db.collection(f"{uid}/notes").document(document_id)
    todo.delete()

    return {"success": True}, 200

# Cloud Function to Handle Audio Metadata (Firestore) and Cloud Storage (Firebase)
@https_fn.on_call()
def store_audio_metadata(req: https_fn.CallableRequest) -> Any:
    # Checking that the user is authenticated.
    if req.auth is None:
        # Throwing an HttpsError so that the client gets the error details.
        raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                                  message="The function must be called while authenticated.")

    uid = req.auth.uid

    fileName = req.data['fileName']
    audio_bytes = base64.b64decode(req.data['audioData'])

    if fileName == '':
        return {"error": "No selected file"}, 400

    # Upload to Firebase Storage Recordings Folder
    blob = bucket.blob(f"{uid}/recordings/{uuid.uuid4()}")
    blob.upload_from_string(audio_bytes, content_type='audio/mp4')
    blob.make_public()

    public_url = blob.public_url

    # Store Metadata in Firestore
    doc_ref = db.collection(f"{uid}/recordings").add({
        "name": fileName,
        "fileUrl": public_url,
        "transcription": "",
        "createdAt": firestore.SERVER_TIMESTAMP,
    })

    #Success Message
    return {"message": "Audio uploaded successfully", "url": public_url, "id": doc_ref[1].id}, 200

@https_fn.on_call()
def get_audios(req: https_fn.CallableRequest) -> Any:
    # Checking that the user is authenticated.
    if req.auth is None:
        # Throwing an HttpsError so that the client gets the error details.
        raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                                  message="The function must be called while authenticated.")

    uid = req.auth.uid

    todo_ref = db.collection(f"{uid}/recordings")
    docs = todo_ref.stream()

    data = []

    for doc in docs:
        data.append({
                        "id": doc.id,
                        **doc.to_dict()
                    })

    return {"success": True, "data": data}, 200


@https_fn.on_call()
def delete_recording(req: https_fn.CallableRequest) -> Any:
    # Checking that the user is authenticated.
    if req.auth is None:
        # Throwing an HttpsError so that the client gets the error details.
        raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                                  message="The function must be called while authenticated.")

    uid = req.auth.uid

    document_id = req.data["id"]

    todo = db.collection(f"{uid}/recordings").document(document_id)
    todo.delete()

    return {"success": True}, 200

# Cloud Function to Store To-Do List Items in Firestore (NO Firebase Storage)
@https_fn.on_call()
def add_todo(req: https_fn.CallableRequest) -> Any:
    # Checking that the user is authenticated.
    if req.auth is None:
        # Throwing an HttpsError so that the client gets the error details.
        raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                                  message="The function must be called while authenticated.")
    uid = req.auth.uid
    
    # JSON File Check
    title = req.data["name"]
    description = req.data["description"]

    if not title:
        return jsonify({"error": "Missing title or description"}), 400

    # Save to Firestore
    doc_ref = db.collection(f"{uid}/todos").add({
        "title": title,
        "description": description,
        "createdAt": firestore.SERVER_TIMESTAMP,
    })

    return {"success": True, "id": doc_ref[1].id}, 200


@https_fn.on_call()
def get_todos(req: https_fn.CallableRequest) -> Any:
    # Checking that the user is authenticated.
    if req.auth is None:
        # Throwing an HttpsError so that the client gets the error details.
        raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                                  message="The function must be called while authenticated.")

    uid = req.auth.uid

    todo_ref = db.collection(f"{uid}/todos")
    docs = todo_ref.stream()

    data = []

    for doc in docs:
        data.append({
                    "id": doc.id,
                    **doc.to_dict()
                })

    return {"success": True, "data": data}, 200


@https_fn.on_call()
def delete_todo(req: https_fn.CallableRequest) -> Any:
    # Checking that the user is authenticated.
    if req.auth is None:
        # Throwing an HttpsError so that the client gets the error details.
        raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                                  message="The function must be called while authenticated.")

    uid = req.auth.uid

    document_id = req.data["id"]

    todo = db.collection(f"{uid}/todos").document(document_id)
    todo.delete()

    return {"success": True}, 200


@https_fn.on_call()
def upload_generic_note(req: https_fn.CallableRequest) -> Any:
    # Checking that the user is authenticated.
    if req.auth is None:
        # Throwing an HttpsError so that the client gets the error details.
        raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                                  message="The function must be called while authenticated.")

    uid = req.auth.uid

    # Extracting HTML String
    html_content = req.data["note"]
    file_name = req.data["fileName"]

    # Saving HTML String as temp File
    temp_file_path = os.path.join("/tmp", file_name)
    with open(temp_file_path, "w", encoding="utf-8") as file:
        file.write(html_content)

    #stores temporary file in Notes folder in bucket (Firebase Storage)
    blob = bucket.blob(f"{uid}/notes/{uuid.uuid4()}")
    blob.upload_from_filename(temp_file_path, content_type="text/html")
    blob.make_public()

    public_url = blob.public_url

    #removes temp file
    os.remove(temp_file_path)

    # Return success message
    return {"message": "File uploaded successfully", "url": blob.public_url}, 200
