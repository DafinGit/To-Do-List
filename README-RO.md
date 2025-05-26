Iată fișierul README.md în limba română, cu părțile tehnice și cele specifice proiectului rămase în engleză, conform cerințelor tale:

# My Daily To-Do List (Enhanced)

O aplicație web interactivă, bogată în funcționalități, pentru a-ți gestiona sarcinile zilnice. Construită cu HTML, CSS și JavaScript pur, această To-Do List oferă o experiență de utilizare fluidă, cu îmbunătățiri moderne de UI/UX și persistența datelor la nivel local.

## ✨ Features

Lista ta de sarcini vine acum cu următoarele funcționalități:

*   **Task Management (CRUD):**
    *   **Add New Tasks:** Adaugă rapid elemente To-Do noi cu un câmp de introducere intuitiv.
    *   **Mark as Complete:** Comută sarcinile ca finalizate sau nefinalizate cu un indicator vizual clar.
    *   **Delete Tasks:** Elimină sarcinile individuale nedorite cu o solicitare de confirmare.
    *   **Edit Tasks:** Fă dublu clic pe textul oricărei sarcini pentru a o edita direct pe loc.
    *   **Drag & Drop Reordering:** Rearanjează-ți cu ușurință sarcinile trăgându-le și plasându-le în pozițiile dorite.

*   **Organization & Filtering:**
    *   **Task Priorities:** Atribuie prioritate `Low`, `Medium` sau `High` sarcinilor tale pentru o mai bună organizare, cu etichete vizuale distincte.
    *   **Task Filtering:** Vizualizează sarcinile după statusul `All`, `Active` (nefinalizate) sau `Completed`.
    *   **Bulk Clear Options:** Șterge toate sarcinile `Completed` sau șterge `All` sarcinile din lista ta (cu confirmare).

*   **User Experience (UX) Enhancements:**
    *   **Local Storage Persistence:** Toate sarcinile și preferințele tale sunt salvate local în browserul tău, astfel încât rămân chiar și după ce închizi fila.
    *   **Subtle Animations:** Bucură-te de animații fluide de fade-in pentru sarcinile noi și animații grațioase de fade-out pentru ștergeri, finalizări și rearajări.
    *   **Font Awesome Icons:** Icoane moderne și clare pentru acțiunile de finalizare și ștergere, îmbunătățind atractivitatea vizuală.
    *   **Inline Input Validation:** Mesaje de eroare ușor de înțeles apar direct sub câmpul de introducere dacă încerci să adaugi o sarcină goală.
    *   **Toast Notifications:** Primește mesaje subtile, tranzitorii care confirmă acțiuni reușite (ex: "Task added successfully!", "Task deleted!").
    *   **Task Counters:** Afișare în timp real a sarcinilor totale, active și finalizate pentru o privire de ansamblu rapidă.
    *   **Light/Dark Mode Toggle:** Comută între o temă luminoasă și una întunecată cu un singur clic, iar preferința ta este reținută pentru vizitele viitoare.

## 🚀 Technologies Used

*   **HTML5:** Pentru structura markup a aplicației web.
*   **CSS3:** Pentru stilizare, aranjament (Flexbox), animații (`@keyframes`) și tematică dinamică (`CSS Custom Properties`/Variabile).
*   **JavaScript (ES6+):** Pentru toată logica interactivă, manipularea DOM, gestionarea evenimentelor, persistența datelor (`localStorage`) și funcționalitatea drag-and-drop.
*   **Font Awesome:** Pentru icoane vectoriale scalabile.

## 💻 How to Run It Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dafingit.github.io/To-Do-List/
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd my-todo-list
    ```
3.  **Open `index.html`:**
    Pur și simplu, faceți dublu clic pe fișierul `index.html` din exploratorul de fișiere. Se va deschide în browserul web implicit.

Alternativ, o puteți servi cu un server local simplu (ex: extensia `Live Server` pentru VS Code, sau `http.server` din Python):
```bash
python -m http.server 8000
# Then open your browser to http://localhost:8000


Folosiți codul cu precauție.

📸 Screenshot

Light Mode Example:

![To-Do List in Light Mode](https://raw.githubusercontent.com/DafinGit/To-Do-List/main/screenshots/light-mode.png)

Dark Mode Example:

![To-Do List in Dark Mode](https://raw.githubusercontent.com/DafinGit/To-Do-List/main/screenshots/dark-mode.png)

🛣️ Future Improvements (Ideas for Further Development)

Multi-User / Backend Integration: Trecere de la localStorage la un backend server-side cu o bază de date (ex: Node.js cu Express și MongoDB/PostgreSQL) pentru a suporta mai mulți utilizatori și o gestionare mai robustă a datelor.

Notifications API: Integrează API-ul nativ de Notificări al browserului pentru date scadente sau memento-uri.

Search Functionality: Adaugă o bară de căutare pentru a găsi rapid sarcini.

Task Attachments: Permite utilizatorilor să atașeze fișiere sau link-uri la sarcini.

Custom Color Palettes: Dincolo de modul luminos/întunecat, oferă o selecție de diferite teme de culori.

Accessibility Enhancements: Îmbunătățește în continuare navigarea cu tastatura, suportul pentru cititoare de ecran și atributele ARIA.

🤝 Contributing
Simțiți-vă liber să faceți fork acestui depozit și să contribuiți! Dacă aveți sugestii sau găsiți o eroare, vă rugăm să deschideți un issue sau să trimiteți un pull request.

📄 License
Acest proiect este open source și disponibil sub Licența MIT.

Vă mulțumim că ați explorat această aplicație To-Do List!
