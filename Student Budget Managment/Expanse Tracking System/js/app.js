// ==================================
// FINTRACK 2026
// ==================================

// Load Transactions
let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];


// ==================================
// SAVE DATA
// ==================================

function saveData() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}


// ==================================
// CURRENCY FORMAT
// ==================================

function formatMoney(amount) {
    return "Rs. " + Number(amount).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


// ==================================
// ADD TRANSACTION
// ==================================

// ==================================
// MODERN TRANSACTION MANAGEMENT
// ==================================

let editingId = null;

const modal = document.getElementById("transactionModal");

const form = document.getElementById("transactionForm");


// OPEN MODAL

function addTransaction() {

    editingId = null;

    form.reset();

    document.getElementById("modalTitle").textContent =
        "Add Transaction";

    document.getElementById("transactionDate").value =
        new Date().toISOString().split("T")[0];

    document.getElementById("transactionType").value = "expense";

    document.querySelectorAll(".type-btn").forEach(btn => {
        btn.classList.toggle(
            "active",
            btn.dataset.type === "expense"
        );
    });

    modal.classList.add("show");

}


// CLOSE MODAL

function closeModal() {
    modal.classList.remove("show");
    editingId = null;
}


// TYPE SELECTION

document.querySelectorAll(".type-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".type-btn").forEach(b =>
            b.classList.remove("active")
        );

        btn.classList.add("active");

        document.getElementById("transactionType").value =
            btn.dataset.type;

    });

});


// SAVE TRANSACTION

form.addEventListener("submit", function(e) {

    e.preventDefault();

    const title = document.getElementById("transactionTitle").value.trim();

    const amount = Number(
        document.getElementById("transactionAmount").value
    );

    const category = document.getElementById("transactionCategory").value;

    const date = document.getElementById("transactionDate").value;

    const type = document.getElementById("transactionType").value;

    if (!title || !category || !date || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter valid transaction details.");
        return;
    }

    if (editingId !== null) {

        transactions = transactions.map(item => {

            if (item.id === editingId) {

                return {
                    ...item,
                    title,
                    amount,
                    category,
                    date,
                    type
                };

            }

            return item;

        });

    } else {

        transactions.unshift({

            id: Date.now(),

            title,
            amount,
            category,
            date,
            type

        });

    }

    saveData();

    updateDashboard();

    closeModal();

    alert("Transaction saved successfully!");

});


// EDIT TRANSACTION

function editTransaction(id) {

    const item = transactions.find(t => t.id === id);

    if (!item) return;

    editingId = id;

    document.getElementById("modalTitle").textContent =
        "Edit Transaction";

    document.getElementById("transactionTitle").value = item.title;

    document.getElementById("transactionAmount").value = item.amount;

    document.getElementById("transactionCategory").value = item.category;

    document.getElementById("transactionDate").value = item.date;

    document.getElementById("transactionType").value = item.type;

    document.querySelectorAll(".type-btn").forEach(btn => {

        btn.classList.toggle(
            "active",
            btn.dataset.type === item.type
        );

    });

    modal.classList.add("show");

}

// ==================================
// DASHBOARD CALCULATION
// ==================================

function updateDashboard() {

    let totalIncome = 0;

    let totalExpense = 0;

    transactions.forEach(item => {

        if (item.type === "income") {

            totalIncome += item.amount;

        } else {

            totalExpense += item.amount;

        }

    });

    let balance = totalIncome - totalExpense;

    let savings = balance;

    document.getElementById("income").textContent =
        formatMoney(totalIncome);

    document.getElementById("expense").textContent =
        formatMoney(totalExpense);

    document.getElementById("balance").textContent =
        formatMoney(balance);

    document.getElementById("savings").textContent =
        formatMoney(savings);

    displayTransactions();

    updateCharts();

}


// ==================================
// DISPLAY TRANSACTIONS
// ==================================

// ==================================
// ADVANCED SEARCH & FILTER
// ==================================

function displayTransactions() {

    const list = document.getElementById("transactionList");

    const search = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    const category = document.getElementById("categoryFilter").value;

    const type = document.getElementById("typeFilter").value;

    const startDate = document.getElementById("startDate").value;

    const endDate = document.getElementById("endDate").value;

    let filtered = transactions.filter(item => {

        const matchesSearch =
            item.title.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search);

        const matchesCategory =
            !category || item.category === category;

        const matchesType =
            !type || item.type === type;

        const matchesStart =
            !startDate || item.date >= startDate;

        const matchesEnd =
            !endDate || item.date <= endDate;

        return matchesSearch &&
            matchesCategory &&
            matchesType &&
            matchesStart &&
            matchesEnd;

    });

    if (filtered.length === 0) {

        list.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:30px">
                    No matching transactions found.
                </td>
            </tr>
        `;

        return;
    }

    list.innerHTML = filtered.map(item => `

        <tr>

            <td>${escapeHTML(item.title)}</td>

            <td>${escapeHTML(item.category)}</td>

            <td>${escapeHTML(item.date)}</td>

            <td style="color:${item.type === "income" ? "#10b981" : "#ef4444"}">
                ${item.type.toUpperCase()}
            </td>

            <td>
                ${item.type === "income" ? "+" : "-"}
                ${formatMoney(item.amount)}

                <button onclick="editTransaction(${item.id})"
                    style="color:#635bff;border:none;background:none;cursor:pointer;margin-left:10px">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button onclick="deleteTransaction(${item.id})"
                    style="color:#ef4444;border:none;background:none;cursor:pointer;margin-left:10px">
                    <i class="fa-solid fa-trash"></i>
                </button>

            </td>

        </tr>

    `).join("");

}


// FILTER EVENTS

document.getElementById("searchInput")
    .addEventListener("input", displayTransactions);

document.getElementById("categoryFilter")
    .addEventListener("change", displayTransactions);

document.getElementById("typeFilter")
    .addEventListener("change", displayTransactions);

document.getElementById("startDate")
    .addEventListener("change", displayTransactions);

document.getElementById("endDate")
    .addEventListener("change", displayTransactions);


// RESET FILTERS

function resetFilters() {

    document.getElementById("searchInput").value = "";

    document.getElementById("categoryFilter").value = "";

    document.getElementById("typeFilter").value = "";

    document.getElementById("startDate").value = "";

    document.getElementById("endDate").value = "";

    displayTransactions();

}


// ==================================
// SAFE HTML DISPLAY
// ==================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

}


// ==================================
// DELETE TRANSACTION
// ==================================

function deleteTransaction(id) {

    let confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) return;

    transactions = transactions.filter(
        item => item.id !== id
    );

    saveData();

    updateDashboard();

}


// ==================================
// DARK MODE
// ==================================

function toggleTheme() {

    document.body.classList.toggle("dark");

    let isDark = document.body.classList.contains("dark");

    localStorage.setItem("darkMode", isDark);

    document.querySelector(".theme-btn").innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';

}


// LOAD THEME
if (localStorage.getItem("darkMode") === "true") {

    document.body.classList.add("dark");

    document.querySelector(".theme-btn").innerHTML =
        '<i class="fa-solid fa-sun"></i>';

}


// ==================================
// CHART.JS
// ==================================

let overviewChart;

let categoryChart;


function updateCharts() {

    if (typeof Chart === "undefined") return;

    let monthlyIncome = new Array(12).fill(0);

    let monthlyExpense = new Array(12).fill(0);

    transactions.forEach(item => {

        let date = new Date(item.date + "T00:00:00");

        if (date.getFullYear() !== new Date().getFullYear()) return;

        let month = date.getMonth();

        if (item.type === "income") {

            monthlyIncome[month] += item.amount;

        } else {

            monthlyExpense[month] += item.amount;

        }

    });


    // Overview Chart

    if (overviewChart) {

        overviewChart.destroy();

    }

    let overviewCanvas = document.getElementById("overviewChart");

    overviewChart = new Chart(overviewCanvas, {

        type: "bar",

        data: {

            labels: [
                "Jan", "Feb", "Mar",
                "Apr", "May", "Jun",
                "Jul", "Aug", "Sep",
                "Oct", "Nov", "Dec"
            ],

            datasets: [

                {
                    label: "Income",
                    data: monthlyIncome,
                    backgroundColor: "#10b981",
                    borderRadius: 6
                },

                {
                    label: "Expenses",
                    data: monthlyExpense,
                    backgroundColor: "#ef4444",
                    borderRadius: 6
                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }

        }

    });


    // Category Chart

    let categories = {};

    transactions.forEach(item => {

        if (item.type === "expense") {

            categories[item.category] =
                (categories[item.category] || 0) + item.amount;

        }

    });


    if (categoryChart) {

        categoryChart.destroy();

    }

    let categoryCanvas = document.getElementById("categoryChart");

    categoryChart = new Chart(categoryCanvas, {

        type: "doughnut",

        data: {

            labels: Object.keys(categories),

            datasets: [{

                data: Object.values(categories),

                backgroundColor: [
                    "#635bff",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#06b6d4",
                    "#8b5cf6"
                ],

                borderWidth: 0

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    position: "bottom"
                }

            }

        }

    });

}


// ==================================
// INITIALIZE APPLICATION
// ==================================

updateDashboard();

console.log("FinTrack 2026 Started Successfully!");
