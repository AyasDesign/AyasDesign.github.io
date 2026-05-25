// admin.js (Ամբողջությամբ փոխարինիր սրանով)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7Efxp8UCC5iz3uP_xgX_rq6D_yu2W_rM",
  authDomain: "portfolio-dd163.firebaseapp.com",
  projectId: "portfolio-dd163",
  firestoreBucket: "portfolio-dd163.appspot.com" // Firestore-ի համար Storage պետք չէ
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const adminForm = document.getElementById('adminForm');
const uploadStatus = document.getElementById('uploadStatus');
const publishBtn = document.getElementById('publishBtn');

// Ֆունկցիա, որը նկարը դարձնում է տեքստ (Base64)
const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = (error) => reject(error);
    });
};

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
        uploadStatus.innerText = "Հրապարակվում է...";

        // Նկարը փոխարինում ենք Base64 տեքստի
        const base64Image = await convertToBase64(file);

        // Ուղղակի գրում ենք Firestore բազայի մեջ (առանց Storage-ի)
        await addDoc(collection(db, "portfolio"), {
            image: base64Image, // Սա արդեն տեքստ է
            price: Number(price),
            bio: bio,
            createdAt: serverTimestamp()
        });

        uploadStatus.innerText = "✓ Հաջողությամբ հրապարակվեց:";
        adminForm.reset();

    } catch (error) {
        console.error(error);
        uploadStatus.innerText = "❌ Սխալ տեղի ունեցավ:";
    } finally {
        publishBtn.disabled = false;
    }
});
