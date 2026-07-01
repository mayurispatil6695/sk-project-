import os
import tempfile
import numpy as np
import faiss
import pymongo
from bson import ObjectId
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from deepface import DeepFace
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# ✅ Enhanced CORS - Allow your frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5000",
        "https://sk-project-ecru.vercel.app",
        "https://sk-project-git-main-mayuripatil6695-1049s-projects.vercel.app",
        "*"  # For testing, remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- MongoDB connection with SSL Fix ----------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
logger.info(f"Connecting to MongoDB at: {MONGO_URI[:30]}...")

try:
    # ✅ FIXED: Added SSL certificate bypass for production deployment
    client = pymongo.MongoClient(
        MONGO_URI, 
        serverSelectionTimeoutMS=5000,
        tls=True,
        tlsAllowInvalidCertificates=True,  # Fix SSL certificate issue
        tlsAllowInvalidHostnames=True       # Fix hostname validation
    )
    
    # Test connection
    client.admin.command('ping')
    db = client["mydatabase"]
    employees_collection = db["employees"]
    logger.info("✅ MongoDB connection successful with SSL fix")
except Exception as e:
    logger.error(f"❌ MongoDB connection failed: {e}")
    logger.error(f"❌ Error details: {str(e)}")
    # Create a dummy collection to avoid crashes
    db = None
    employees_collection = None

# ---------- Global FAISS index ----------
face_index = None
employee_ids = []

def load_embeddings():
    global face_index, employee_ids
    logger.info("🔄 Loading face embeddings from MongoDB...")
    
    if employees_collection is None:
        logger.error("❌ No database connection")
        face_index = None
        employee_ids = []
        return
    
    embeddings = []
    ids = []

    try:
        for emp in employees_collection.find({"faceEmbeddings": {"$exists": True, "$ne": []}}):
            emb_list = emp.get("faceEmbeddings", [])
            if not emb_list:
                continue
            for emb_raw in emb_list:
                try:
                    emb = np.array(emb_raw, dtype=np.float32)
                    if emb.shape[0] == 0:
                        continue
                    embeddings.append(emb)
                    ids.append(str(emp["_id"]))
                except Exception as e:
                    logger.warning(f"Error processing embedding: {e}")
                    continue

        if embeddings:
            embedding_matrix = np.vstack(embeddings).astype(np.float32)
            dimension = embedding_matrix.shape[1]
            index = faiss.IndexFlatL2(dimension)
            index.add(embedding_matrix)
            face_index = index
            employee_ids = ids
            logger.info(f"✅ Loaded {len(ids)} face embeddings into FAISS index")
        else:
            face_index = None
            employee_ids = []
            logger.warning("⚠️ No face embeddings found in DB")
    except Exception as e:
        logger.error(f"❌ Error loading embeddings: {e}")
        face_index = None
        employee_ids = []

# Load embeddings on startup
load_embeddings()

# ---------- Health Check Endpoint ----------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Face Recognition Service",
        "embeddings_loaded": len(employee_ids) if employee_ids else 0,
        "mongodb_connected": db is not None,
        "faiss_initialized": face_index is not None,
        "timestamp": datetime.now().isoformat()
    }

# ---------- /embedding endpoint (for registration) ----------
@app.post("/embedding")
async def get_embedding(file: UploadFile = File(...)):
    try:
        content = await file.read()
        logger.info(f"📸 Received image: {file.filename}, size: {len(content)} bytes")
        
        if len(content) == 0:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Empty file received"}
            )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        try:
            logger.info("🔄 Generating embedding with DeepFace...")
            embedding_obj = DeepFace.represent(
                img_path=tmp_path,
                model_name="Facenet",
                enforce_detection=False,
                detector_backend="opencv"
            )
            if not embedding_obj:
                return JSONResponse(
                    status_code=400,
                    content={"success": False, "message": "No face detected in image"}
                )

            embedding = embedding_obj[0]["embedding"]
            logger.info(f"✅ Embedding generated, dimension: {len(embedding)}")
            return {"success": True, "embedding": embedding}

        except Exception as e:
            logger.error(f"❌ DeepFace error: {e}")
            return JSONResponse(
                status_code=500,
                content={"success": False, "message": f"Face processing error: {str(e)}"}
            )
        finally:
            try:
                os.unlink(tmp_path)
            except:
                pass

    except Exception as e:
        logger.error(f"❌ /embedding error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": str(e)}
        )

# ---------- /reload endpoint ----------
@app.post("/reload")
async def reload_embeddings():
    load_embeddings()
    count = len(employee_ids) if employee_ids else 0
    logger.info(f"🔄 Reloaded FAISS index with {count} embeddings")
    return {"success": True, "message": f"Reloaded {count} embeddings", "count": count}

# ---------- /match endpoint ----------
@app.post("/match")
async def match_face(
    file: UploadFile = File(...),
    siteName: str = Form(None)
):
    try:
        if face_index is None or not employee_ids:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "No registered faces in database"}
            )

        content = await file.read()
        if len(content) == 0:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Empty file received"}
            )

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
                return JSONResponse(
                    status_code=400,
                    content={"success": False, "message": "No face detected in the image"}
                )

            query_embedding = np.array(
                embedding_obj[0]["embedding"], dtype=np.float32
            ).reshape(1, -1)

            distances, indices = face_index.search(query_embedding, k=1)
            best_distance = float(distances[0][0])
            best_idx = int(indices[0][0])

            logger.info(f"🔍 Best distance: {best_distance:.3f}, index: {best_idx}")

            # ✅ Fixed threshold — Facenet + FAISS L2 distance, good match is < 100
            THRESHOLD = 100.0
            if best_distance > THRESHOLD:
                return {
                    "success": False,
                    "message": f"Face not matched (distance {best_distance:.3f})"
                }

            matched_employee_id = employee_ids[best_idx]
            logger.info(f"✅ Matched employee ID: {matched_employee_id}")

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
            logger.error(f"❌ Face matching error: {e}")
            return JSONResponse(
                status_code=500,
                content={"success": False, "message": f"Matching error: {str(e)}"}
            )
        finally:
            try:
                os.unlink(tmp_path)
            except:
                pass

    except Exception as e:
        logger.error(f"❌ /match error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": str(e)}
        )
# ---------- GET handler for debugging ----------
@app.get("/match")
async def match_face_get():
    logger.error("🚨🚨🚨 GET request received at /match! This should be POST.")
    logger.error("🚨🚨🚨 This means something is redirecting or sending GET requests.")
    return JSONResponse(
        status_code=405,
        content={
            "success": False,
            "message": "Method not allowed. Use POST for face matching.",
            "received_method": "GET",
            "required_method": "POST",
            "fix": "Check your Express backend for redirects or URL rewriting"
        }
    )
# ---------- Root endpoint ----------
@app.get("/")
async def root():
    return {
        "service": "Face Recognition Service",
        "status": "running",
        "embeddings_loaded": len(employee_ids) if employee_ids else 0,
        "mongodb_connected": db is not None,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))