Lost and Found Portal
A simple Lost & Found web app where students can upload lost/found items with images and search them easily.

✨ Features:
    Upload items with title, description, contact, and image.
    Items are shown as cards with status and time.
    Search & sort items quickly.
    Update status (e.g., resolved/claimed).
    Data is saved in items.json so it persists.

🛠️ Tools & Tech:
    Frontend: HTML, CSS, JavaScript, Bootstrap 5 (CSS + JS via CDN)
    Backend: Node.js + Express.js
    Database: JSON file (for demo)
    File Storage: Local /uploads folder for images
    Version Control: Git + GitHub
    Editor: Cursor AI

🌐 API Endpoints:
    GET /health → check server status
    GET /items → fetch all items
    POST /items → add new item (with image)
    PATCH /items/:id/status → update item status
    DELETE /items/:id → delete item + image
    /uploads/... → serve uploaded images

🚀 How to Run Backend
    Go to backend/
    npm install
    npm run dev

Test:
http://localhost:3000/health
 → should return OK
Frontend
Open frontend/index.html in browser
(Use VS Code Live Server for easy reload)

📂 Project Structure
Lost and Found/
│
├── backend/
│   ├── server.js        # main backend server
│   ├── items.json       # saved items (starts empty)
│   ├── uploads/         # images go here (.gitkeep keeps it tracked)
│   └── package.json     
│
├── frontend/
│   ├── index.html       # main UI
│   ├── style.css        
│   └── script.js        
│
└── README.md

🔮 Future Improvements:
    User authentication
    Categories (books, electronics, ID cards, pets)
    Notifications (email/SMS)
    Admin dashboard
    Replace JSON with MongoDB / Firebase
    Deploy online (Render, Vercel, Heroku)

✍️ Built by students in 1 day with help from AI + teamwork.