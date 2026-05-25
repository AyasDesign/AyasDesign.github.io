import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const portfolioGrid = document.getElementById('portfolioGrid');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const modalCaption = document.getElementById('modalCaption');
const closeBtn = document.querySelector('.close-btn');
const adminAuthBtn = document.getElementById('adminAuthBtn');

// --- ԳԱՂՏՆԱԲԱՌԻ ՊԱՇՏՊԱՆՈՒԹՅՈՒՆ (G809h) ---
adminAuthBtn.addEventListener('click', () => {
    const password = prompt("Մուտքագրեք Admin կոդը՝ էջ անցնելու համար:");
    if (password === "G809h") {
        window.location.href = "admin.html"; // Տանում է ադմինի էջ
    } else if (password !== null) {
        alert("Սխալ կոդ! Մուտքը մերժված է:");
    }
});

// Տվյալների բեռնում բազայից
const q = query(collection(db, "portfolio"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    portfolioGrid.innerHTML = ""; 
    
    if (snapshot.empty) {
        portfolioGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #94a3b8;'>Պորտֆոլիոն դեռ դատարկ է։</p>";
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${data.image}" alt="Aya's Design">
            <div class="card-info">
                <p class="card-price">${Number(data.price).toLocaleString()} AMD</p>
                <p class="card-bio">${data.bio.substring(0, 75)}${data.bio.length > 75 ? '...' : ''}</p>
            </div>
        `;
        
        // IMAGE MODAL EFFECT (Սեղմելուց մեծանալը)
        card.addEventListener('click', () => {
            modal.style.display = "flex";
            modalImg.src = data.image;
            modalCaption.innerHTML = `<span style="color: #4f46e5; font-weight: bold; font-size: 1.3rem;">${Number(data.price).toLocaleString()} AMD</span><br><br>${data.bio}`;
        });

        portfolioGrid.appendChild(card);
    });
});

// Փակել Մոդալը
closeBtn.addEventListener('click', () => modal.style.display = "none");
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = "none";
});