import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7Efxp8UCC5iz3uP_xgX_rq6D_yu2W_rM",
  authDomain: "portfolio-dd163.firebaseapp.com",
  projectId: "portfolio-dd163"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const adminForm = document.getElementById('adminForm');
const uploadStatus = document.getElementById('uploadStatus');
const publishBtn = document.getElementById('publishBtn');

// Ֆունկցիա՝ նկարը սեղմելու և չափսը փոքրացնելու համար (որպեսզի 1MB-ից չանցնի)
const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200; // Առավելագույն լայնությունը
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Սեղմում ենք որակը մինչև 0.7 (70%), որը տեսողական չի երևում, բայց չափսը շատ է փոքրացնում
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(dataUrl);
            };
        };
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
        uploadStatus.innerText = "Նկարը մշակվում և հրապարակվում է...";

        // Սեղմում ենք նկարը նախքան ուղարկելը
        const compressedBase64 = await compressImage(file);

        // Ուղարկում ենք Firestore
        await addDoc(collection(db, "portfolio"), {
            image: compressedBase64,
            price: Number(price),
            bio: bio,
            createdAt: serverTimestamp()
        });

        uploadStatus.innerText = "✓ Հաջողությամբ հրապարակվեց:";
        adminForm.reset();

    } catch (error) {
        console.error("Սխալ:", error);
        if (error.message.includes("longer than 1048487 bytes")) {
            uploadStatus.innerText = "❌ Նկարը նույնիսկ սեղմելուց հետո շատ մեծ է։ Փորձեք ուրիշ նկար։";
        } else {
            uploadStatus.innerText = "❌ Սխալ տեղի ունեցավ հրապարակելիս։";
        }
    } finally {
        publishBtn.disabled = false;
    }
});
