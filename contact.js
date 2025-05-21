import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLOEjRfXigGXljIiANe22x_SXRQDQKmbs",
  authDomain: "my-gob.firebaseapp.com",
  projectId: "my-gob",
  storageBucket: "my-gob.appspot.com",
  messagingSenderId: "464127979375",
  appId: "1:464127979375:web:dccc4c8ee64738cbac029a",
  measurementId: "G-W2XBV7XH66"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  getDoc(userRef).then(docSnap => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.role !== "admin") {
        document.getElementById("messages-container").classList.add("hidden");
      } else {
        loadMessages();
      }
    } else {
      document.getElementById("messages-container").classList.add("hidden");
    }
  });

  document.getElementById("send-btn").addEventListener("click", async () => {
    const textarea = document.getElementById("message-input");
    const text = textarea.value.trim();
    if (text === "") {
      alert("الرجاء كتابة رسالة.");
      return;
    }

    try {
      await addDoc(collection(db, "contact-messages"), {
        text: text,
        timestamp: Timestamp.now(),
        uid: user.uid
      });
      textarea.value = "";
      alert("تم إرسال الرسالة.");
    } catch (error) {
      alert("خطأ في الإرسال: " + error.message);
    }
  });
});

function loadMessages() {
  const messagesContainer = document.getElementById("messages-list");
  const q = query(collection(db, "contact-messages"), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const messageDiv = document.createElement("div");
      messageDiv.className = "message";
      const time = data.timestamp?.toDate?.() || new Date();
      messageDiv.textContent = time.toLocaleString() + " — " + data.text;
      messagesContainer.appendChild(messageDiv);
    });
  });
}
