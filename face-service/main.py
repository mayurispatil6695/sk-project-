import os
import tempfile
import numpy as np
import faiss
import pymongo
from bson import ObjectId
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# ---------- MongoDB connection ----------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = pymongo.MongoClient(MONGO_URI)
db = client["mydatabase"]
employees_collection = db["employees"]

# ---------- Global FAISS index ----------
face_index = None
employee_ids = []

def load_embeddings():
    global face_index, employee_ids
    print("🔄 Loading face embeddings from MongoDB...")
    embeddings = []
    ids = []

    for emp in employees_collection.find({"faceEmbeddings": {"$exists": True, "$ne": []}}):
        emb_list = emp.get("faceEmbeddings", [])
        if not emb_list:
            continue
        for emb_raw in emb_list:
            emb = np.array(emb_raw, dtype=np.float32)
            if emb.shape[0] == 0:
                continue
            embeddings.append(emb)
            ids.append(str(emp["_id"]))

    if embeddings:
        embedding_matrix = np.vstack(embeddings).astype(np.float32)
        dimension = embedding_matrix.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embedding_matrix)
        face_index = index
        employee_ids = ids
        print(f"✅ Loaded {len(ids)} face embeddings into FAISS index")
    else:
        face_index = None
        employee_ids = []
        print("⚠️ No face embeddings found in DB")

load_embeddings()

# ---------- /embedding endpoint (for registration) ----------
@app.post("/embedding")
async def get_embedding(file: UploadFile = File(...)):
    content = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        embedding_obj = DeepFace.represent(
            img_path=tmp_path,
            model_name="Facenet",
            enforce_detection=False,
            detector_backend="opencv"
        )
        if not embedding_obj:
            return {"success": False, "message": "No face detected in image"}

        embedding = embedding_obj[0]["embedding"]
        print(f"✅ Embedding generated, dimension: {len(embedding)}")
        return {"success": True, "embedding": embedding}

    except Exception as e:
        print(f"❌ /embedding error: {e}")
        return {"success": False, "message": str(e)}
    finally:
        os.unlink(tmp_path)

# ---------- /reload endpoint (call after registering new face) ----------
@app.post("/reload")
async def reload_embeddings():
    load_embeddings()
    count = len(employee_ids)
    print(f"🔄 Reloaded FAISS index with {count} embeddings")
    return {"success": True, "message": f"Reloaded {count} embeddings"}

# ---------- /match endpoint ----------
@app.post("/match")
async def match_face(
    file: UploadFile = File(...),
    siteName: str = Form(None)
):
    if face_index is None or len(employee_ids) == 0:
        return {"success": False, "message": "No registered faces in database"}

    content = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        embedding_obj = DeepFace.represent(
            img_path=tmp_path,
            model_name="Facenet",
            enforce_detection=False,
            detector_backend="opencv"
        )
        if not embedding_obj:
            return {"success": False, "message": "No face detected in the image"}

        query_embedding = np.array(
            embedding_obj[0]["embedding"], dtype=np.float32
        ).reshape(1, -1)

        distances, indices = face_index.search(query_embedding, k=1)
        best_distance = float(distances[0][0])
        best_idx = int(indices[0][0])

        print(f"🔍 Best distance: {best_distance:.3f}, index: {best_idx}")

        # ✅ Fixed threshold — Facenet + FAISS L2 distance, good match is < 100
        THRESHOLD = 100.0
        if best_distance > THRESHOLD:
            return {
                "success": False,
                "message": f"Face not matched (distance {best_distance:.3f})"
            }

        matched_employee_id = employee_ids[best_idx]
        print(f"✅ Matched employee ID: {matched_employee_id}")

        # ✅ Fixed: query with ObjectId, not raw string
        try:
            obj_id = ObjectId(matched_employee_id)
        except Exception:
            obj_id = matched_employee_id

        if siteName:
            emp_check = employees_collection.find_one({
                "_id": obj_id,
                "siteName": siteName
            })
            if not emp_check:
                return {
                    "success": False,
                    "message": "Employee not assigned to this site"
                }

        employee = employees_collection.find_one({"_id": obj_id})
        if not employee:
            return {"success": False, "message": "Employee not found in database"}

        employee_name = employee.get("name", "Unknown")

        return {
            "success": True,
            "data": {
                "employeeId": matched_employee_id,
                "employeeName": employee_name,
                "confidence": round(1 - (best_distance / THRESHOLD), 3)
            }
        }

    except Exception as e:
        print(f"❌ /match error: {e}")
        return {"success": False, "message": str(e)}
    finally:
        os.unlink(tmp_path)