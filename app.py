import os
import tempfile
import streamlit as st
from streamlit_chat import message
from langchain.chains import ConversationalRetrievalChain
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms import LlamaCpp
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.document_loaders import PyPDFLoader
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI
from langchain.vectorstores import FAISS


def initialize_session_state():
    st.session_state.setdefault('history', [])
    st.session_state.setdefault('generated', ["Hello! Ask me anything about 🤗"])
    st.session_state.setdefault('past', ["Hey! 👋"])

def create_rag_chain(vector_store):
    model_path = r"C:/Users/bhoom/Downloads/mistral-7b-instruct-v0.1.Q3_K_L.gguf" 

    if not os.path.exists(model_path):
        st.error(f"Model path does not exist: {model_path}")
        return None

    try:
        llm = LlamaCpp(
            streaming=True,
            model_path=model_path,
            temperature=0.75,
            top_p=1,
            verbose=True,
            n_ctx=4096
        )
        retriever = vector_store.as_retriever(search_kwargs={"k": 2})
        rag_chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=retriever,
            chain_type="stuff",  # Can be "map_reduce" or other types based on your needs
            return_source_documents=True
        )
        return rag_chain
    except Exception as e:
        st.error(f"Failed to create RAG chain: {e}")
        return None

def generate_response(query, rag_chain):
    try:
        result = rag_chain({"query": query})
        answer = result["result"]

        st.session_state['history'].append((query, answer))
        return answer
    except Exception as e:
        st.error(f"Error in generating response: {e}")
        return "Sorry, I couldn't process your request."

def display_chat_history(rag_chain):
    reply_container = st.container()
    container = st.container()

    with container:
        with st.form(key='my_form', clear_on_submit=True):
            user_input = st.text_input("Question:", placeholder="Ask about your PDF", key='input')
            submit_button = st.form_submit_button(label='Send')

        if submit_button and user_input:
            with st.spinner('Generating response...'):
                output = generate_response(user_input, rag_chain)

            st.session_state['past'].append(user_input)
            st.session_state['generated'].append(output)

    if st.session_state['generated']:
        with reply_container:
            for i in range(len(st.session_state['generated'])):
                message(st.session_state["past"][i], is_user=True, key=str(i) + '_user')
                message(st.session_state["generated"][i], key=str(i))

def main():
    initialize_session_state()
    st.title("Multi-PDF ChatBot using Mistral-7B-Instruct :books:")
    st.sidebar.title("Document Processing")
    uploaded_files = st.sidebar.file_uploader("Upload files", accept_multiple_files=True)

    if uploaded_files:
        try:
            text = []
            for file in uploaded_files:
                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    temp_file.write(file.read())
                    temp_file_path = temp_file.name

                file_extension = os.path.splitext(file.name)[1]
                loader = PyPDFLoader(temp_file_path) if file_extension == ".pdf" else None

                if loader:
                    text.extend(loader.load())
                os.remove(temp_file_path)

            text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=20)
            text_chunks = text_splitter.split_documents(text)

            embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2",
                                               model_kwargs={'device': 'cpu'})
            vector_store = FAISS.from_documents(text_chunks, embedding=embeddings)
            rag_chain = create_rag_chain(vector_store)

            if rag_chain:
                display_chat_history(rag_chain)
        except Exception as e:
            st.error(f"An error occurred while processing documents: {e}")

if __name__ == "__main__":
    main()

