import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7Efxp8UCC5iz3uP_xgX_rq6D_yu2W_rM",
  authDomain: "portfolio-dd163.firebaseapp.com",
  projectId: "portfolio-dd163",
  storageBucket: "portfolio-dd163.firebasestorage.app",
  messagingSenderId: "1018154217973",
  appId: "1:1018154217973:web:adcc4fb34ac023cbfa30bc",
  measurementId: "G-C4Y2V2J8XS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const adminForm = document.getElementById('adminForm');
const uploadStatus = document.getElementById('uploadStatus');
const publishBtn = document.getElementById('publishBtn');

adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('imgFile');
    const price = document.getElementById('itemPrice').value;
    const bio = document.getElementById('itemBio').value;
    const file = fileInput.files[0];

    if (!file) {
        alert("Խնդրում ենք նկար ընտրել:");
        return;
    }

    try {
        publishBtn.disabled = true;
        uploadStatus.innerText = "Նկարը հրապարակվում է... խնդրում ենք սպասել:";

        const uniqueFileName = Date.now() + "_" + file.name;
        const storageRef = ref(storage, 'portfolio_images/' + uniqueFileName);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        await addDoc(collection(db, "portfolio"), {
            image: downloadURL,
            price: Number(price),
            bio: bio,
            createdAt: serverTimestamp()
        });

        uploadStatus.innerText = "✓ Հաջողությամբ հրապարակվեց:";
        adminForm.reset();

    } catch (error) {
        console.error(error);
        uploadStatus.innerText = "❌ Սխալ տեղի ունեցավ: Ստուգեք Firebase Rules-ը:";
    } finally {
        publishBtn.disabled = false;
    }
});