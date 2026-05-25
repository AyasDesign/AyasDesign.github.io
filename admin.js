import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const adminPortfolioGrid = document.getElementById('adminPortfolioGrid');

// Ֆունկցիա՝ նկարը սեղմելու համար
const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
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
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
};

// Ավելացնել նոր քարտ
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
        const compressedBase64 = await compressImage(file);

        await addDoc(collection(db, "portfolio"), {
            image: compressedBase64,
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

// Իրական ժամանակում բեռնում ենք քարտերը Ադմինի էջում՝ Խմբագրման կոճակներով
const q = query(collection(db, "portfolio"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    adminPortfolioGrid.innerHTML = "";
    
    snapshot.forEach((documentSnapshot) => {
        const data = documentSnapshot.data();
        const docId = documentSnapshot.id; // Բազայի ID-ն՝ փոփոխելու կամ ջնջելու համար

        const card = document.createElement('div');
        card.classList.add('admin-card');
        card.innerHTML = `
            <img src="${data.image}" alt="Aya">
            <p><strong>Գին:</strong> ${data.price} AMD</p>
            <p><strong>Bio:</strong> ${data.bio.substring(0, 50)}...</p>
            <div class="admin-actions">
                <button class="btn-edit" data-id="${docId}">✏️ Edit</button>
                <button class="btn-delete" data-id="${docId}">❌ Ջնջել</button>
            </div>
        `;

        // --- ՋՆՋԵԼՈՒ ՏՐԱՄԱԲԱՆՈՒԹՅՈՒՆ ---
        card.querySelector('.btn-delete').addEventListener('click', async () => {
            if (confirm("Վստա՞հ ես, որ ուզում ես ամբողջությամբ ջնջել այս քարտը։")) {
                try {
                    await deleteDoc(doc(db, "portfolio", docId));
                    alert("✓ Քարտը ջնջվեց բազայից։");
                } catch (err) {
                    alert("Սխալ՝ ջնջելիս։");
                }
            }
        });

        // --- ԽՄԲԱԳՐԵԼՈՒ ՏՐԱՄԱԲԱՆՈՒԹՅՈՒՆ ---
        card.querySelector('.btn-edit').addEventListener('click', async () => {
            const newPrice = prompt("Մուտքագրեք նոր գինը (AMD):", data.price);
            const newBio = prompt("Մուտքագրեք նոր նկարագրությունը (Bio):", data.bio);
            
            // Հարցնում ենք՝ արդյոք նկարն էլ է ուզում փոխել
            const changeImg = confirm("Ուզո՞ւմ ես փոխել նաև նկարը։");
            let updatedData = {
                price: Number(newPrice || data.price),
                bio: newBio || data.bio
            };

            if (changeImg) {
                // Ստեղծում ենք վիրտուալ ֆայլ ընտրելու դաշտ
                const fileChooser = document.createElement('input');
                fileChooser.type = 'file';
                fileChooser.accept = 'image/*';
                fileChooser.click();

                fileChooser.onchange = async () => {
                    const newFile = fileChooser.files[0];
                    if (newFile) {
                        uploadStatus.innerText = "Նոր նկարը մշակվում է...";
                        const newCompressedBase64 = await compressImage(newFile);
                        updatedData.image = newCompressedBase64;
                        
                        await updateDoc(doc(db, "portfolio", docId), updatedData);
                        uploadStatus.innerText = "✓ Քարտը (ներառյալ նկարը) թարմացվեց:";
                    }
                };
            } else {
                // Եթե միայն տեքստերն է փոխում
                try {
                    await updateDoc(doc(db, "portfolio", docId), updatedData);
                    alert("✓ Տվյալները հաջողությամբ թարմացվեցին։");
                } catch (err) {
                    alert("Սխալ՝ թարմացնելիս։");
                }
            }
        });

        adminPortfolioGrid.appendChild(card);
    });
});
