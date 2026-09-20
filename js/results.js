// Google Sheets Web App URL
// Skriptas: "Kalbos Upė – Rezultatai" (kalbosupe@gmail.com)
// Atnaujinta: 2026-09-20
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwOy1CBkIqVguiL__uFFbiQbxHHpHsT4AQy8paoHH8sRCGYJ4dHQR1ys1_Cgi7VG18h2Q/exec';

// Funkcija vardui įvesti prieš užduotį
function showNamePrompt() {
    const studentName = localStorage.getItem('studentName');
    
    if (!studentName) {
        const name = prompt('Įvesk savo vardą:');
        if (name && name.trim() !== '') {
            localStorage.setItem('studentName', name.trim());
            return name.trim();
        } else {
            alert('Prašome įvesti vardą, kad galėtumėte pradėti užduotį.');
            return showNamePrompt();
        }
    }
    
    return studentName;
}

// Funkcija rezultatams siųsti į Google Sheets
function sendResultToSheet(taskName, score) {
    const studentName = localStorage.getItem('studentName') || 'Nežinomas';
    const timestamp = new Date().toLocaleString('lt-LT');
    
    const data = {
        name: studentName,
        task: taskName,
        score: score,
        timestamp: timestamp
    };
    
    console.log('Siunčiamas rezultatas:', data);
    
    fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        console.log('✅ Rezultatas išsiųstas į Google Sheets');
    })
    .catch(error => {
        console.error('❌ Klaida siunčiant rezultatą:', error);
    });
}

// Funkcija vardui pakeisti
function changeName() {
    localStorage.removeItem('studentName');
    const newName = showNamePrompt();
    alert(`Vardas pakeistas į: ${newName}`);
    location.reload();
}

// Automatinis vardo paklausimas, kai užkraunamas puslapis
window.addEventListener('DOMContentLoaded', () => {
    const studentName = showNamePrompt();
    const displayElement = document.getElementById('studentNameDisplay');
    if (displayElement) {
        displayElement.textContent = studentName;
    }
});
