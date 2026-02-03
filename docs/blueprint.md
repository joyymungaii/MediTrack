# **App Name**: MediTrack Pro

## Core Features:

- Customer Home Page: Display pharmacy overview, mission statement, and featured medicines.
- Medicine Catalog: Show medicine name, image, description, price, and stock status, dynamically updated from Firestore.
- Search and Filter: Enable users to search and filter medicines by name, type, or category.
- Cart and Order System: Allow users to add medicines to a cart, confirm orders, and select delivery options.
- Secure User Authentication: Implement secure user authentication using Firebase Authentication (email/password and Google login).
- Prescription Upload: Provide a section for users to upload prescriptions (image or PDF) for verification before purchasing controlled drugs.
- AI Symptom Checker: An AI tool which recommends appropriate medicine using a placeholder chatbot based on the user-entered symptoms. Utilizes AI reasoning to suggest treatments.
- Admin Medicine Management: Enable CRUD (Create, Read, Update, Delete) operations for medicines in Firestore through the admin panel.
- Order Management: View, update, and mark deliveries as complete through the admin panel.
- Prescription Verification: Page to approve or reject uploaded prescriptions in the admin panel.
- Patient Follow-Up: Track recovery and gather feedback via the admin panel.
- AI Assisted Recommendation: A tool for pharmacists which suggests medicines based on entered symptoms (mock AI model).

## Style Guidelines:

- Primary color: Calm blue (#64B5F6) to convey trust and professionalism.
- Background color: Very light blue (#E3F2FD) for a clean, calming backdrop.
- Accent color: Green (#81C784) for positive actions and highlights.
- Body font: 'PT Sans', a modern, readable humanist sans-serif.
- Headline font: 'PT Sans', matching body font for a consistent, readable experience.
- Use clear, modern icons for inventory, orders, and messages; use a consistent style.
- Design a clean and professional layout with a navbar, footer, and sidebar (for the admin panel).
- Implement subtle transitions and feedback animations for a polished user experience.