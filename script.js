const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileuploadWrraper = document.querySelector(".file-upload-wrraper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// api fetch
const API_KEY = "Api_keys"

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null

  }
}

const intialInputHeight = messageInput.scrollHeight;
const chatHistory = []


// Create message element with dynamic ...classes and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};


// bot response 
const genrateBotResponde = async (incomingMessageDiv) => {
  const messageElemnet = incomingMessageDiv.querySelector(".message-text");
  chatHistory.push({
    role:"user",
    parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file}] : [])]
  });

  const requestOptions = {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents:chatHistory
    })
  }


  try {
    const response = await fetch(API_URL, requestOptions)
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message)


    //bot response dispaly
    const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*)\*\*/g, "$1").trim()
    messageElemnet.innerText = apiResponseText;
   
    // add bot response to chat history
    chatHistory.push({
      role:"model",
      parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file}] : [])]
    });
  
  } catch (error) {
    console.log(error);
    messageElemnet.innerText = error.message;
    messageElemnet.style.color = "#ff0000"

  } finally {
    incomingMessageDiv.classList.remove("thinking")
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" })
    userData.file = "";
  }
}


const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  messageInput.value = "";
  fileuploadWrraper.classList.remove("file-uploaded");



  const messageContent = `<div class="message-text"></div>
  ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;


  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" })
  setTimeout(() => {
    const messageContent = `<svg 
             class="bot-avtar"
            xmlns="http://www.w3.org/2000/svg"
            height="50px"
            viewBox="0 -960 960 960"
            width="50px"
            fill="#5f6368"
          >
            <path
              d="M272-160q-30 0-51-21t-21-51q0-21 12-39.5t32-26.5l156-62v-90q-54 63-125.5 96.5T120-320v-80q68 0 123.5-28T344-508l54-64q12-14 28-21t34-7h40q18 0 34 7t28 21l54 64q45 52 100.5 80T840-400v80q-83 0-154.5-33.5T560-450v90l156 62q20 8 32 26.5t12 39.5q0 30-21 51t-51 21H400v-20q0-26 17-43t43-17h120q9 0 14.5-5.5T600-260q0-9-5.5-14.5T580-280H460q-42 0-71 29t-29 71v20h-88Zm208-480q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"
            />
          </svg>
          <div class="message-text">
            <div class="thinking-indicator thinking">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>`;

    const incomingMessageDiv = createMessageElement(messageContent, "bot-message", ".thinking-indicator");
    chatBody.appendChild(incomingMessageDiv);
    genrateBotResponde(incomingMessageDiv);

  }, 600)
};

// Handle enter key press for sending message
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && userMessage) {
    handleOutgoingMessage(e);
    messageInput.value = ""; // Clear input after sending
  }
});


messageInput.addEventListener("input", () => {
  messageInput.style.height = `${intialInputHeight}px`;
  messageInput.style.height =` ${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > intialInputHeight ? "15px" : "32px" 
})

// // accidental message handler
// messageInput.addEventListener("blur", () => {
//   messageInput.value = "";
// });
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0]
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fileuploadWrraper.querySelector("img").src = e.target.result
    fileuploadWrraper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];

    userData.file = {
      data: base64String,
      mime_type: file.type
    }
    fileInput.value = '';
  }
  reader.readAsDataURL(file);

})


//file upload cancel button
fileCancelButton.addEventListener("click", () => {
  userData.file = {};
  fileuploadWrraper.classList.remove("file-uploaded")
})
 
const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
   const { selectionStart: start, selectionEnd: end} = messageInput;
   messageInput.setRangeText(emoji.native, start, end, "end");
   messageInput.focus();
  },
  onClickOutside: (e) => {
     if (e.target.id === "emoji-picker") {
       document.body.classList.toggle("show-emoji-picker")
     } else {
      document.body.classList.remove("show-emoji-picker")

     }
  }
})
 
document.querySelector(".chat-form").appendChild(picker)

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());

chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"))


closeChatbot.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot")
})
