import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

class MongoSingleton:
    _client = None

    @classmethod
    def get_client(cls):
        if cls._client is None:
            cls._client = MongoClient(MONGODB_URI)
        return cls._client

    @classmethod
    def get_db(cls, db_name="angariacoes_dev"):
        return cls.get_client()[db_name]
