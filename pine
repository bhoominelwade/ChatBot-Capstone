# 2c584c12-165e-4c19-820e-719e5a9fac4d
import os
import pinecone
import PyPDF2
from pinecone import Pinecone
import numpy as np
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain.vectorstores import Pinecone
from langchain.vectorstores.base import VectorStore

api_key = os.environ.get("2c584c12-165e-4c19-820e-719e5a9fac4d")
index_host = os.environ.get("https://boty-zwdzzhc.svc.aped-4627-b74a.pinecone.io")

pc = Pinecone("2c584c12-165e-4c19-820e-719e5a9fac4d")
index = pc.Index("boty","https://boty-zwdzzhc.svc.aped-4627-b74a.pinecone.io")

index_name="boty"
model = "multilingual-e5-large"

# def generate_random_vector(dim=384):
#     return np.random.rand(dim).tolist()

# # Generate vectors of dimension 384
# vectors = [
#     {"id": "A", "values": generate_random_vector(),"metadata":{"description": "Vector A"}},
#     {"id": "B", "values": generate_random_vector()},
#     {"id": "C", "values": generate_random_vector()},
#     {"id": "D", "values": generate_random_vector()}
# ]

# # Upsert vectors into Pinecone index
# try:
#     index.upsert(vectors=vectors)
#     print("Upsert successful")
# except Exception as e:
#     print(f"An error occurred: {e}")

pdf = PyPDF2.PdfReader(r"C:\Users\nelwa\Downloads\BhoomiNelwadeCV.pdf")
pdf_text = ""
for page in pdf.pages:

        pdf_text += page.extract_text()

embeddings = OllamaEmbeddings(model="nomic-embed-text")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=50)
texts = text_splitter.split_text( pdf_text)
print(texts[0])

vectorstore=inecone.from_documents(text_key=texts,embedding=embeddings,index_name=index_name)
