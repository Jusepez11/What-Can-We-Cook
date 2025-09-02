import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("secrets/secret.json")
firebase_admin.initialize_app(cred)