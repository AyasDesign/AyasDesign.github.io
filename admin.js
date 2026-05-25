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
const fileInput = document.getElementById('imgFile');
const priceInput = document.getElementById('itemPrice');
const bioInput = document.getElementById('itemBio');
const uploadStatus = document.getElementById('uploadStatus');
const publishBtn = document.getElementById('publishBtn');
const cancelBtn = document.getElementById('cancelBtn');
const adminPortfolioGrid = document.getElementById('adminPortfolioGrid');

let editMode = false;
let currentEditId = null;
let currentExistingImg = ""; // Պահում ենք հին նկարը, եթե նորը չընտրվի

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

// ՖՈՐՄԱՅԻ ՍԱԲՄԻԹ (Եվ՛ Ավելացնելու, և՛ Խմբագրելու համար)
adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const price = priceInput.value;
    const bio = bioInput.value;
    const file = fileInput.files[0];

    try {
        publishBtn.disabled = true;
        
        if (editMode) {
            // --- ԽՄԲԱԳՐՄԱՆ ՌԵԺԻՄ ---
            uploadStatus.innerText = "Փոփոխությունները պահպանվում են...";
            
            let finalImage = currentExistingImg; // Default թողնում ենք հին նկարը
            
            if (file) {
                // Եթե օգտատերը նոր նկար է ընտրել, սեղմում ենք այն
                finalImage = await compressImage(file);
            }

            await updateDoc(doc(db, "portfolio", currentEditId), {
                image: finalImage,
                price: Number(price),
                bio: bio
            });

            uploadStatus.innerText = "✓ Փոփոխությունը հաջողությամբ պահպանվեց:";
            resetForm();
        } else {
            // --- ՆՈՐ ԱՊՐԱՆՔԻ ԱՎԵԼԱՑՈՒՄ ---
            if (!file) {
                alert("Խնդրում ենք նկար ընտրել:");
                publishBtn.disabled = false;
                return;
            }
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
        }
    } catch (error) {
        console.error(error);
        uploadStatus.innerText = "❌ Սխալ տեղի ունեցավ:";
    } finally {
        publishBtn.disabled = false;
    }
});

// Իրական ժամանակում բեռնում ենք քարտերը Ադմինի էջում
const q = query(collection(db, "portfolio"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    adminPortfolioGrid.innerHTML = "";
    
    snapshot.forEach((documentSnapshot) => {
        const data = documentSnapshot.data();
        const docId = documentSnapshot.id;

        const card = document.createElement('div');
        card.style.border = "1px solid #e2e8f0";
        card.style.padding = "15px";
        card.style.borderRadius = "12px";
        card.style.background = "#fff";
        
        card.innerHTML = `
            <img src="${data.image}" style="width:100%; height:180px; object-fit:cover; border-radius:8px;">
            <p><strong>Գին:</strong> ${data.price} AMD</p>
            <p><strong>Bio:</strong> ${data.bio.substring(0, 50)}...</p>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button class="btn-edit" style="background:#eab308; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; flex:1;">✏️ Edit</button>
                <button class="btn-delete" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">❌ Ջնջել</button>
            </div>
        `;

        // Ջնջել
        card.querySelector('.btn-delete').addEventListener('click', async () => {
            if (confirm("Վստա՞հ ես, որ ուզում ես ջնջել այս քարտը։")) {
                await deleteDoc(doc(db, "portfolio", docId));
            }
        });

        // Խմբագրել (Տվյալները ուղարկում ենք վերևի ֆորմա)
        card.querySelector('.btn-edit').addEventListener('click', () => {
            editMode = true;
            currentEditId = docId;
            currentExistingImg = data.image; // Հիշում ենք հին նկարը
            
            // Լցնում ենք ինպուտների մեջ
            priceInput.value = data.price;
            bioInput.value = data.bio;
            fileInput.required = false; // Խմբագրելիս նոր նկարն պարտադիր չէ
            
            // Փոխում ենք կոճակների տեսքը
            publishBtn.innerText = "💾 Պահպանել Փոփոխությունը";
            publishBtn.style.background = "#22c55e";
            cancelBtn.style.display = "inline-block";
            
            // Էջը սլայդ անել դեպի ֆորման (վերև)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        adminPortfolioGrid.appendChild(card);
    });
});

// Չեղարկելու ֆունկցիա
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    editMode = false;
    currentEditId = null;
    currentExistingImg = "";
    adminForm.reset();
    publishBtn.innerText = "Հրապարակել";
    publishBtn.style.background = ""; // հետ է գնում default գույնին
    cancelBtn.style.display = "none";
}
