// Google Sheets Web App URL
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzhXP3hJ6NBLOld6Gbg-tlN-Tk8BPoxx32tx9j-iKCJChVyeOpZiDyGu9g2cm6Vl0uf/exec';

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
