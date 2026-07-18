# GTRService Frontend

This is the frontend repository for the GTRService application, built with React and Vite.

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (Detailed version if known, e.g., v18+)
*   npm (Node Package Manager)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd frontend
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

---

## 📂 Project Structure

The project follows a modular structure where major features are grouped into their own directories.

```bash
frontend/
├── dist/                   # Production build output
├── public/                 # Static assets (favicon, etc.)
├── src/
│   ├── accounting/         # Accounting & Finance module
│   ├── assets/             # Static images and global assets
│   ├── company/            # Company profile & details
│   ├── components/         # Shared/Reusable UI components
│   │   ├── base/           # Atomic components (buttons, inputs)
│   │   ├── DashboardLayout.jsx # Main layout for authenticated users
│   │   └── Navbar.jsx      # Navigation bar component
│   ├── context/            # React Context Providers for global state
│   ├── crm/                # Customer Relationship Management module
│   ├── hrmsSettings/       # HRMS configuration & settings
│   ├── manageCompany/      # Administrative company management
│   ├── material/           # Material handling & inventory
│   ├── pages/              # General usage pages & route views
│   ├── pos/                # Point of Sale (POS) system components
│   ├── production/         # Manufacturing & Production workflows
│   ├── purchase/           # Purchase Orders & Vendor management
│   ├── sales/              # Sales Orders & Invoicing
│   ├── warehouse/          # Warehouse Management System (WMS)
│   │   ├── components/     # Warehouse-specific components
│   │   └── pages/          # Warehouse-specific pages
│   ├── App.jsx             # Main App component & Router configuration
│   ├── main.jsx            # Application Entry Point
│   └── index.css           # Global styles (Tailwind imports)
├── .env                    # Environment variables
├── package.json            # Project dependencies & scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite configuration
```

## 🧩 Key Modules Description

### **Core Components (`src/components/`)**
Contains the building blocks of the UI.
-   **Layouts**: `DashboardLayout.jsx`, `CompanyHubLayout.jsx` define the page structure.
-   **Navigation**: `Navbar.jsx`, `AuthNavbar.jsx`.
-   **Shared**: Button, FeatureCard, Pagination, etc.

### **Warehouse Module (`src/warehouse/`)**
Designed for the Warehouse team.
-   **`components/`**: Reusable widgets specific to warehouse operations (e.g., Stock cards, Inventory lists).
-   **`pages/`**: Full-page views for warehouse tasks (e.g., Stock Entry, Dispatch).

### **Production (`src/production/`)**
Handles the manufacturing process, tracking raw materials to finished goods.

### **HRMS & Payroll (`src/hrmsSettings/`, `src/components/Hrpages`)**
Manages employee data, attendance, leave, and payroll processing.

### **Sales & Purchase (`src/sales/`, `src/purchase/`)**
Modules for handling business transactions, orders, and billing.

---

## 🛠 Tech Stack

*   **Framework**: React
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS, Lucide React Icons
*   **State Management**: React Context API
*   **Routing**: React Router (implied via App.jsx)

## 🤝 Contribution Guidelines

1.  Create a new branch for your feature (`git checkout -b feature/AmazingFeature`).
2.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
3.  Push to the branch (`git push origin feature/AmazingFeature`).
4.  Open a Pull Request.

---
---

# 🏭 Warehouse Module Developer Guide

**Target Audience:** Warehouse Module Developer

## 🚫 Constraints (Important)
Since you may not have access to the full codebase or backend:
1.  **Mock Data**: You must use **local mock data** (JSON arrays) for all tables and lists. Do not try to call live APIs unless provided with a specific endpoint.
2.  **No External CSS**: strict usage of **Tailwind CSS** only.
3.  **Scoped Work**: Do not modify files outside of `src/warehouse/` unless explicitly instructed.

## 📦 Detailed Warehouse Structure

Your workspace is strictly `src/warehouse/`.

```bash
frontend/src/warehouse/
├── components/     # 🧩 Components specific only to Warehouse
│   ├── StockCard.jsx
│   ├── InventoryTable.jsx
│   └── GRNForm.jsx
│
├── pages/          # 📄 Full Pages / Route Views
│   ├── WarehouseDashboard.jsx  # Main Landing Dashboard
│   ├── WarehouseModule.jsx     # Module Entry/Layout
│   ├── StockEntry.jsx          # Page for entering new stock
│   └── DispatchOrder.jsx       # Page for dispatching items
│
├── hooks/          # 🎣 Warehouse-specific logic hooks
│   └── useInventory.js
│
├── utils/          # 🛠 Helper functions
│   └── stockCalculations.js
│
└── data/           # 📝 Mock Data (JSON files)
    └── mockStockData.js
```

### 1. Expected Core Features
*   **Dashboard**: A high-level view showing Total Stock, Recent Transactions, and Pending Dispatches.
*   **Stock Entry (Inbound)**: Forms to add new items to the inventory.
*   **Dispatch (Outbound)**: Workflows to release items from the warehouse.
*   **Reports**: Tables showing daily/weekly movements.

### 2. Component Development Rules
*   **Is it a full screen?** → Place it in `src/warehouse/pages/`.
*   **Is it a reusable widget used ONLY in Warehouse?** → Place it in `src/warehouse/components/`.
*   **Is it a generic UI element (Button, Input)?** → Check `src/components/base/`. If it doesn't exist, discuss with the lead.

### 3. Code Style & Template

#### Functional Components & Hooks
```jsx
// src/warehouse/pages/StockEntry.jsx
import React, { useState } from 'react';
import { Button, Input } from '../../components/base'; // Import global UI if available

const StockEntry = () => {
    // State for form
    const [formData, setFormData] = useState({ itemName: '', quantity: 0 });

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">New Stock Entry</h2>
            
            <div className="grid grid-cols-2 gap-4">
                {/* Use Tailwind for layout */}
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">Item Name</label>
                    <input 
                        name="itemName"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="mt-6">
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                    Submit Stock
                </button>
            </div>
        </div>
    );
};

export default StockEntry;
```

#### Data Handling (Mocking)
Create a `data.js` file in your folder to mimic API responses.

```javascript
// src/warehouse/data/mockData.js
export const MOCK_INVENTORY = [
    { id: 101, name: "Cotton Fabric", qty: 500, unit: "Meters", status: "In Stock" },
    { id: 102, name: "Polyester Thread", qty: 20, unit: "Boxes", status: "Low Stock" },
];
```

## 📝 Deliverables Checklist

- [ ] All new files are inside `src/warehouse/` (or strictly approved global paths).
- [ ] No strict dependencies on a local backend server (UI loads with mock data).
- [ ] `npm run dev` starts without errors.
- [ ] Responsive design checks passed (Tablet/Desktop).
