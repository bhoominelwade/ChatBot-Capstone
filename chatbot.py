# Importing all the libraries
import streamlit as st
from streamlit_lottie import st_lottie
from streamlit_chat import message
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
import utils
import requests
import base64


def set_page_title():
    """
    Function to add the Header and Title of the streamlit webapp
    """
    st.set_page_config(page_title="Saiyan AI - Gen AI Powered Chatbot", page_icon=":robot:", layout="wide")
    st.markdown("""
    <style>
    .big-font {
        font-size:80px !important;
        color:#dc143c;
    }
    </style>
    """, unsafe_allow_html=True)


def load_lottieurl(url):
    """
    Function to add Chatbot animation using from lottie on the streamlit web app.
    """
    r = requests.get(url)
    if r.status_code != 200:
        return None
    return r.json()


def add_bg_from_local(image_file):
    """
    Function to add background image for the webapp.
    """
    with open(image_file, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    st.markdown(
    f"""
    <style>
    .stApp {{
        background-image: url(data:image/{"png"};base64,{encoded_string.decode()});
        background-size: cover
    }}
    </style>
    """,
    unsafe_allow_html=True
    )
  

def load_local_css(file_name):
    """
    Function to use css file stored in the style folder for improving the design of the web app.
    """
    with open(file_name) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)


def initialize_session_state():
    """
    Session State is a way to share variables between reruns, for each user session.
    """
    st.session_state.setdefault('history', [])
    st.session_state.setdefault('generated', ["Hi! I am here to help you with any queries related to the uploaded files."])
    st.session_state.setdefault('past', ["Hi User!"])


def create_conversational_chain(llm, vector_store):
    """
    Creating conversational chain using Mistral 7B LLM instance and vector store instance

    Args:
    - llm: Instance of Mistral 7B GGUF
    - vector_store: Instance of FAISS Vector store having all the PDF document chunks 
    """
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    
    chain = ConversationalRetrievalChain.from_llm(llm=llm, chain_type='stuff',
                                                 retriever=vector_store.as_retriever(search_kwargs={"k": 2}),
                                                 memory=memory)
    return chain


def display_chat(conversation_chain):
    """
    Args:
    - conversation_chain: Instance of LangChain ConversationalRetrievalChain
    """
    # Create containers to better organise the elements on the streamlit webapp
    reply_container = st.container()
    container = st.container()

    with container:
        with st.form(key='chat_form', clear_on_submit=True):
            user_input = st.text_input("Question:", placeholder="Ask me any questions related to the uploaded file", key='input')
            submit_button = st.form_submit_button(label='Send ⬆️')
        
        # Check if user submit question with user input and generate response of the question
        if submit_button and user_input:
            generate_response(user_input, conversation_chain)
    
    # Display generated response to streamlit webapp
    display_generated_responses(reply_container)


def generate_response(user_input, conversation_chain):
    """
    Generate LLM response based on the user question by retrieving data from Vector Database
    Also, stores information to streamlit session states 'past' and 'generated' so that it can
    have memory of previous generation for conversational type of chats (Like chatGPT)

    Args
    - user_input(str): User input as a text
    - conversation_chain: Instance of ConversationalRetrievalChain 
    """
    with st.spinner('Generating your answer.....'):
        output = conversation_chat(user_input, conversation_chain, st.session_state['history'])

    st.session_state['past'].append(user_input)
    st.session_state['generated'].append(output)


def conversation_chat(user_input, conversation_chain, history):
    """
    Returns LLM response after invoking model through conversation_chain

    Args:
    - user_input(str): User input
    - conversation_chain: Instance of ConversationalRetrievalChain
    - history: Previous response history
    returns:
    - result["answer"]: Response generated from LLM
    """
    result = conversation_chain.invoke({"question": user_input, "chat_history": history})
    history.append((user_input, result["answer"]))
    return result["answer"]


def display_generated_responses(reply_container):
    """
    Display generated LLM response to Streamlit Web UI

    Args:
    - reply_container: Streamlit container created at previous step
    """
    if st.session_state['generated']:
        with reply_container:
            for i in range(len(st.session_state['generated'])):
                message(st.session_state["past"][i], is_user=True, key=f"{i}_user", avatar_style="adventurer")
                message(st.session_state["generated"][i], key=str(i), avatar_style="bottts")


def main():
    """
    First function to call when we start streamlit app
    """
    # Set the page title and header
    set_page_title()

    # Initialize session state
    initialize_session_state()

    # Add the chatbot animation on the webapp
    lottie_chatbot = load_lottieurl("https://lottie.host/0db79b20-1283-48cc-988c-ac773cdfafdb/SAuFvCieET.json")
    st_lottie(lottie_chatbot, height=400, key="Sayian AI Chatbot")

    # Use local css file to improve the webapp further.
    load_local_css("style/style.css")
    
    # Hide some of the streamlit features
    hide_streamlit_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            </style>

            """
    st.markdown(hide_streamlit_style, unsafe_allow_html=True) 

    # Create the background for the webapp
    add_bg_from_local("images/background.jpg")  

    # Initialize Streamlit and create a sidebar for uploading files
    st.sidebar.title("Upload Pdf here")
    pdf_files = st.sidebar.file_uploader("", accept_multiple_files=True)
    
    # Create instance of Mistral 7B GGUF file format using llama.cpp    
    llm = utils.create_llm()

    # Create vector store and store the uploaded Pdf file to the in-memory vector Database FAISS
    # and return an instance of vector store
    vector_store = utils.create_vector_store(pdf_files)

    if vector_store:
        chain = create_conversational_chain(llm, vector_store)
        display_chat(chain)
    else:
        print('Initialzed App.')

if __name__ == "__main__":
    main()
