class UserAuth {
  constructor() {
    this.currentUser = null;
    this.initializeAuth();
  }

  initializeAuth() {
    // Check if user is already logged in
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      this.currentUser = JSON.parse(loggedInUser);
    }
    this.createAuthUI();
  }

  createAuthUI() {
    // Create auth container
    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
    
    // Add to DOM before the main container
    const mainContainer = document.querySelector('.container');
    document.body.insertBefore(authContainer, mainContainer);
    
    this.updateAuthUI();
  }

  updateAuthUI() {
    const authContainer = document.querySelector('.auth-container');
    if (this.currentUser) {
      authContainer.innerHTML = `
        <div class="user-info">
          <div class="user-welcome">
            <div class="user-avatar">${this.currentUser.username.charAt(0).toUpperCase()}</div>
            <span>Welcome back, <strong>${this.currentUser.username}</strong></span>
          </div>
          <button class="btn-logout" onclick="userAuth.logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      `;
      document.querySelector('.container').style.display = 'block';
    } else {
      authContainer.innerHTML = `
        <div class="auth-card">
          <div class="auth-header">
            <h1 style="color:rgb(0, 149, 255)">Budget Tracker</h1>
            <p style="color: blue"> Track your finances with ease</p>
          </div>
          
          <div class="auth-tabs">
            <button class="auth-tab active" data-tab="login">Login</button>
            <button class="auth-tab" data-tab="register">Register</button>
          </div>

          <div class="auth-forms">
            <form id="loginForm" class="auth-form active" onsubmit="userAuth.login(event)">
              <div class="form-group">
                <label for="loginUsername">
                  <i class="fas fa-user"></i>
                  <span>Username</span>
                </label>
                <input type="text" id="loginUsername" required placeholder="Enter your username">
              </div>
              <div class="form-group">
                <label for="loginPassword">
                  <i class="fas fa-lock"></i>
                  <span>Password</span>
                </label>
                <div class="password-input">
                  <input type="password" id="loginPassword" required placeholder="Enter your password">
                  <button type="button" class="toggle-password">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </div>
              <button type="submit" class="btn-submit">
                <span>Login</span>
                <i class="fas fa-arrow-right"></i>
              </button>
            </form>

            <form id="registerForm" class="auth-form" onsubmit="userAuth.register(event)">
              <div class="form-group">
                <label for="registerUsername">
                  <i class="fas fa-user"></i>
                  <span>Username</span>
                </label>
                <input type="text" id="registerUsername" required placeholder="Choose a username">
              </div>
              <div class="form-group">
                <label for="registerPassword">
                  <i class="fas fa-lock"></i>
                  <span>Password</span>
                </label>
                <div class="password-input">
                  <input type="password" id="registerPassword" required placeholder="Choose a password">
                  <button type="button" class="toggle-password">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </div>
              <button type="submit" class="btn-submit">
                <span>Create Account</span>
                <i class="fas fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </div>
      `;

      // Set up tab switching
      const tabs = authContainer.querySelectorAll('.auth-tab');
      const forms = authContainer.querySelectorAll('.auth-form');
      
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const targetForm = tab.dataset.tab;
          
          // Update active tab
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          // Update active form
          forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${targetForm}Form`) {
              form.classList.add('active');
            }
          });
        });
      });

      // Set up password visibility toggle
      const toggleBtns = authContainer.querySelectorAll('.toggle-password');
      toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const input = btn.parentElement.querySelector('input');
          const icon = btn.querySelector('i');
          
          if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          }
        });
      });

      document.querySelector('.container').style.display = 'none';
    }
  }

  login(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];
    
    if (user && user.password === this.hashPassword(password)) {
      this.currentUser = { username };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      this.updateAuthUI();
      budgetTracker.loadUserData(username);
      this.showNotification('Login successful!', 'success');
    } else {
      this.showNotification('Invalid username or password', 'error');
    }
  }

  register(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username]) {
      this.showNotification('Username already exists', 'error');
      return;
    }
    
    users[username] = {
      password: this.hashPassword(password),
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    this.showNotification('Registration successful! Please login.', 'success');
    document.getElementById('registerForm').reset();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.updateAuthUI();
    budgetTracker.clearData();
    this.showNotification('Logged out successfully', 'success');
  }

  hashPassword(password) {
    // Simple hash function for demo purposes
    // In production, use a proper cryptographic hash function
    return btoa(password);
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  static addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .logo-container {
        width: 64px;
        height: 64px;
        margin: 0 auto 1rem;
      }

      .auth-logo {
        width: 100%;
        height: 100%;
        color: white; /* Logo will always be white in the header */
      }

      [data-theme='light'] .auth-card {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      [data-theme='dark'] .auth-card {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }

      .auth-container {
        max-width: 400px;
        margin: 2rem auto;
        padding: 0 1rem;
      }

      .auth-card {
        background: var(--card-background);
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .auth-header {
        padding: 2rem;
        text-align: center;
        background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
        color: white;
      }

      .auth-logo {
        width: 64px;
        height: 64px;
        margin-bottom: 1rem;
        filter: brightness(0) invert(1);
      }

      .auth-header h1 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }

      .auth-header p {
        opacity: 0.8;
      }

      .auth-tabs {
        display: flex;
        border-bottom: 1px solid var(--border-color);
      }

      .auth-tab {
        flex: 1;
        padding: 1rem;
        border: none;
        background: none;
        color: var(--text-color);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .auth-tab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
      }

      .auth-forms {
        padding: 2rem;
      }

      .auth-form {
        display: none;
      }

      .auth-form.active {
        display: block;
        animation: fadeIn 0.3s ease;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        color: var(--text-color-light);
      }

      .form-group input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--input-background);
        color: var(--text-color);
        transition: all 0.3s ease;
      }

      .form-group input:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px var(--primary-color-light);
      }

      .password-input {
        position: relative;
      }

      .toggle-password {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--text-color-light);
        cursor: pointer;
        padding: 0;
      }

      .btn-submit {
        width: 100%;
        padding: 0.75rem;
        border: none;
        border-radius: 8px;
        background: var(--primary-color);
        color: white;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
      }

      .btn-submit:hover {
        background: var(--primary-color-dark);
      }

      .user-info {
        background: var(--card-background);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
      }

      .user-welcome {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        background: var(--primary-color);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      .btn-logout {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: none;
        color: var(--text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
      }

      .btn-logout:hover {
        background: var(--danger-color);
        border-color: var(--danger-color);
        color: white;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

class BudgetTracker {
  constructor() {
    this.budget = 0;
    this.expenses = [];
    this.incomes = [];
    this.currentDate = new Date();
    this.expenseChartInstance = null;
    this.incomeChartInstance = null;
    this.selectedDate = new Date();

    this.initializeElements();
    this.setupEventListeners();
    this.initializeCurrencyConverter();
    this.updateUI();
    this.initializeThemeToggle();
    this.initializeCalendar();
  }

  initializeElements() {
    // Budget elements
    this.budgetInput = document.getElementById("budgetAmount");
    this.setBudgetBtn = document.getElementById("setBudget");
    this.currentBudgetEl = document.getElementById("currentBudget");
    this.remainingBudgetEl = document.getElementById("remainingBudget");

    // Expense elements
    this.expenseForm = document.getElementById("expenseForm");
    this.expenseList = document.getElementById("expenseList");

    // Currency converter elements
    this.fromCurrency = document.getElementById("fromCurrency");
    this.toCurrency = document.getElementById("toCurrency");
    this.convertAmount = document.getElementById("amount");
    this.convertBtn = document.getElementById("convertCurrency");
    this.conversionResult = document.getElementById("conversionResult");

    // Calendar elements
    this.calendarGrid = document.getElementById("calendarGrid");
    this.currentMonthEl = document.getElementById("currentMonth");
    this.prevMonthBtn = document.getElementById("prevMonth");
    this.nextMonthBtn = document.getElementById("nextMonth");
    this.dailySummary = document.getElementById("dailySummary");

    // Get chart elements from existing HTML
    this.expenseChart = document.getElementById("expenseChart");
    this.incomeChart = document.getElementById("incomeChart");

    // Initialize transaction summary if not exists
    if (!document.getElementById("transactionSummary")) {
      const summaryContainer = document.createElement("div");
      summaryContainer.className = "card";
      summaryContainer.innerHTML = `
            <div class="card-header">
                <h2>Transaction Summary</h2>
            </div>
            <div class="summary-content">
                <div class="summary-row">
                    <span>Total Income:</span>
                    <span id="totalIncome" class="income">$0.00</span>
                </div>
                <div class="summary-row">
                    <span>Total Expenses:</span>
                    <span id="totalExpenses" class="expense">$0.00</span>
                </div>
                <div class="summary-row net-amount">
                    <span>Net Balance:</span>
                    <span id="netAmount">$0.00</span>
                </div>
            </div>
        `;
      document.querySelector(".dashboard").appendChild(summaryContainer);
    }

    // Initialize date picker
    this.expenseDatePicker = flatpickr("#expenseDate", {
      defaultDate: "today",
      dateFormat: "Y-m-d",
      onChange: (selectedDates) => {
        this.selectedDate = selectedDates[0];
      },
    });
  }

  setupEventListeners() {
    this.setBudgetBtn.addEventListener("click", () => this.setBudget());
    this.expenseForm.addEventListener("submit", (e) =>
      this.handleTransaction(e)
    );
    this.convertBtn.addEventListener("click", () => this.convertCurrency());
    this.prevMonthBtn.addEventListener("click", () => this.changeMonth(-1));
    this.nextMonthBtn.addEventListener("click", () => this.changeMonth(1));

    const transactionType = document.getElementById("transactionType");
    const categorySelect = document.getElementById("expenseCategory");

    transactionType.addEventListener("change", () => {
      const isIncome = transactionType.value === "income";
      categorySelect.innerHTML = isIncome
        ? this.getIncomeCategories()
        : this.getExpenseCategories();
    });
  }

  getIncomeCategories() {
    return `
                <option value="salary">Salary</option>
                <option value="freelance">Freelance</option>
                <option value="investments">Investments</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
            `;
  }

  getExpenseCategories() {
    return `
                <option value="groceries">Groceries</option>
                <option value="utilities">Utilities</option>
                <option value="rent">Rent</option>
                <option value="entertainment">Entertainment</option>
                <option value="transport">Transport</option>
                <option value="medical">Medical</option>
                <option value="food">Food</option>
                <option value="fashion">Fashion</option>
                <option value="other">Other</option>
            `;
  }

  setBudget() {
    const amount = parseFloat(this.budgetInput.value);
    if (amount > 0) {
      this.budget = amount;
      this.saveToLocalStorage();
      this.updateUI();
      this.showNotification("Budget updated successfully!", "success");
    }
  }

  handleTransaction(e) {
    e.preventDefault();
    const transactionType = document.getElementById("transactionType").value;
    const title = document.getElementById("expenseTitle").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const category = document.getElementById("expenseCategory").value;
    const date = this.selectedDate || new Date();

    if (title && amount > 0) {
      const transaction = {
        id: Date.now(),
        title,
        amount,
        category,
        date: date.toISOString(),
        type: transactionType,
      };

      if (transactionType === "income") {
        this.incomes.push(transaction);
      } else {
        this.expenses.push(transaction);
      }

      this.saveToLocalStorage();
      this.updateUI();
      this.renderCalendar();
      this.expenseForm.reset();
      document.getElementById("transactionType").value = "expense";
      document.getElementById("expenseCategory").innerHTML =
        this.getExpenseCategories();
      this.showNotification(
        `${
          transactionType === "income" ? "Income" : "Expense"
        } added successfully!`,
        "success"
      );
    }
  }

  deleteTransaction(type, id) {
    const array = type === "income" ? this.incomes : this.expenses;
    const index = array.findIndex((t) => t.id === id);

    if (index !== -1) {
      array.splice(index, 1);
      this.saveToLocalStorage();
      this.updateUI();
      this.renderCalendar();
      this.showNotification("Transaction deleted successfully!", "success");
    }
  }

  updateUI() {
    const totalExpenses = this.calculateTotalExpenses();
    const totalIncome = this.calculateTotalIncome();
    const netAmount = totalIncome - totalExpenses;

    // Update budget display
    this.currentBudgetEl.textContent = this.formatCurrency(this.budget);
    if (this.budget > 0) {
      const remaining = this.budget - totalExpenses;
      this.remainingBudgetEl.textContent = this.formatCurrency(remaining);
      this.remainingBudgetEl.style.color =
        remaining >= 0 ? "var(--success-color)" : "var(--danger-color)";
    } else {
      this.remainingBudgetEl.textContent = "No budget set";
      this.remainingBudgetEl.style.color = "var(--text-color)";
    }

    // Update transaction summary
    document.getElementById("totalIncome").textContent =
      this.formatCurrency(totalIncome);
    document.getElementById("totalExpenses").textContent =
      this.formatCurrency(totalExpenses);
    const netAmountEl = document.getElementById("netAmount");
    netAmountEl.textContent = this.formatCurrency(netAmount);
    netAmountEl.style.color =
      netAmount >= 0 ? "var(--success-color)" : "var(--danger-color)";

    // Update lists and charts
    this.updateTransactionList();
    this.updateCharts();
  }

  calculateTotalExpenses() {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  calculateTotalIncome() {
    return this.incomes.reduce((total, income) => total + income.amount, 0);
  }

  updateCharts() {
    if (this.expenseChartInstance) {
      this.expenseChartInstance.destroy();
    }
    if (this.incomeChartInstance) {
      this.incomeChartInstance.destroy();
    }

    this.expenseChartInstance = this.createChart(
      this.expenseChart,
      this.expenses,
      "Expense Distribution"
    );
    this.incomeChartInstance = this.createChart(
      this.incomeChart,
      this.incomes,
      "Income Distribution"
    );
  }

  createChart(canvas, transactions, title) {
    const categoryTotals = {};
    transactions.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    return new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [
          {
            data: Object.values(categoryTotals),
            backgroundColor: [
              "#3b82f6",
              "#10b981",
              "#f59e0b",
              "#ef4444",
              "#8b5cf6",
              "#ec4899",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }

  async initializeCurrencyConverter() {
    try {
      const response = await fetch("https://api.frankfurter.app/currencies");
      const currencies = await response.json();

      Object.entries(currencies).forEach(([code, name]) => {
        const option1 = new Option(`${code} - ${name}`, code);
        const option2 = new Option(`${code} - ${name}`, code);
        this.fromCurrency.add(option1);
        this.toCurrency.add(option2);
      });

      this.fromCurrency.value = "USD";
      this.toCurrency.value = "EUR";
    } catch (error) {
      console.error("Error loading currencies:", error);
      this.showNotification(
        "Error loading currencies. Please try again later.",
        "error"
      );
    }
  }

  async convertCurrency() {
    try {
      const amount = parseFloat(this.convertAmount.value);
      const from = this.fromCurrency.value;
      const to = this.toCurrency.value;

      if (!amount || isNaN(amount)) {
        this.showNotification("Please enter a valid amount", "error");
        return;
      }

      if (from === to) {
        this.conversionResult.textContent = `${amount.toFixed(2)} ${to}`;
        return;
      }

      const response = await fetch(
        `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`
      );

      if (!response.ok) {
        throw new Error("Currency conversion failed");
      }

      const data = await response.json();

      if (data.rates && data.rates[to]) {
        const result = data.rates[to];
        this.conversionResult.textContent = `${result.toFixed(2)} ${to}`;
        this.showNotification("Currency converted successfully!", "success");
      } else {
        throw new Error("Invalid conversion rate received");
      }
    } catch (error) {
      console.error("Error converting currency:", error);
      this.showNotification(
        "Error converting currency. Please try again.",
        "error"
      );
      this.conversionResult.textContent = "Error";
    }
  }

  initializeCalendar() {
    this.renderCalendar();
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    this.currentMonthEl.textContent = new Date(year, month).toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );

    this.calendarGrid.innerHTML = "";

    // Add weekday headers
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach((day) => {
      const dayEl = document.createElement("div");
      dayEl.className = "calendar-day header";
      dayEl.textContent = day;
      this.calendarGrid.appendChild(dayEl);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add blank cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
      const blankDay = document.createElement("div");
      blankDay.className = "calendar-day blank";
      this.calendarGrid.appendChild(blankDay);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement("div");
      dayEl.className = "calendar-day";
      dayEl.textContent = day;

      const currentDate = new Date(year, month, day);
      const dateStr = this.formatDate(currentDate);
      const { expenses, incomes } = this.getDayTransactions(dateStr);

      if (expenses.length > 0 || incomes.length > 0) {
        dayEl.classList.add("has-transactions");

        const expenseTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const incomeTotal = incomes.reduce((sum, inc) => sum + inc.amount, 0);

        if (expenseTotal > 0 || incomeTotal > 0) {
          const transactionInfo = document.createElement("div");
          transactionInfo.className = "day-transactions";

          if (incomeTotal > 0) {
            transactionInfo.innerHTML += `<div class="income">+${this.formatCurrency(
              incomeTotal
            )}</div>`;
          }
          if (expenseTotal > 0) {
            transactionInfo.innerHTML += `<div class="expense">-${this.formatCurrency(
              expenseTotal
            )}</div>`;
          }

          dayEl.appendChild(transactionInfo);
        }
      }

      dayEl.addEventListener("click", () => this.showDailySummary(dateStr));
      this.calendarGrid.appendChild(dayEl);
    }
  }

  changeMonth(delta) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.renderCalendar();
  }

  formatDate(date) {
    return new Date(date).toISOString().split("T")[0];
  }

  formatDisplayDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  getDayTransactions(dateStr) {
    const expenses = this.expenses.filter(
      (expense) => this.formatDate(new Date(expense.date)) === dateStr
    );
    const incomes = this.incomes.filter(
      (income) => this.formatDate(new Date(income.date)) === dateStr
    );
    return { expenses, incomes };
  }

  showDailySummary(dateStr) {
    const { expenses, incomes } = this.getDayTransactions(dateStr);
    const expenseTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const incomeTotal = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const netAmount = incomeTotal - expenseTotal;
    const formattedDate = this.formatDisplayDate(dateStr);

    this.dailySummary.innerHTML = `
                <h3>Transactions for ${formattedDate}</h3>
                ${
                  incomes.length > 0
                    ? `
                    <div class="transaction-section">
                        <h4>Income</h4>
                        <div class="transaction-list">
                            ${incomes
                              .map(
                                (income) => `
                                <div class="transaction-item income">
                                    <div>
                                        <strong>${income.title}</strong>
                                        <p>${income.category}</p>
                                    </div>
                                    <div>+${this.formatCurrency(
                                      income.amount
                                    )}</div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                        <div class="transaction-item total">
                            <strong>Total Income:</strong>
                            <div class="income">+${this.formatCurrency(
                              incomeTotal
                            )}</div>
                        </div>
                    </div>
                `
                    : ""
                }
                ${
                  expenses.length > 0
                    ? `
                    <div class="transaction-section">
                        <h4>Expenses</h4>
                        <div class="transaction-list">
                            ${expenses
                              .map(
                                (expense) => `
                                <div class="transaction-item expense">
                                    <div>
                                        <strong>${expense.title}</strong>
                                        <p>${expense.category}</p>
                                    </div>
                                    <div>-${this.formatCurrency(
                                      expense.amount
                                    )}</div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                        <div class="transaction-item total">
                            <strong>Total Expenses:</strong>
                            <div class="expense">-${this.formatCurrency(
                              expenseTotal
                            )}</div>
                        </div>
                    </div>
                `
                    : ""
                }
                ${
                  incomes.length > 0 || expenses.length > 0
                    ? `
                    <div class="transaction-item net-total">
                        <strong>Net Amount:</strong>
                        <div class="${netAmount >= 0 ? "income" : "expense"}">
                            ${netAmount >= 0 ? "+" : "-"}${this.formatCurrency(
                        Math.abs(netAmount)
                      )}
                        </div>
                    </div>
                `
                    : "<p>No transactions recorded for this day.</p>"
                }
            `;
  }

  updateTransactionList() {
    const transactionList = document.getElementById("expenseList");
    transactionList.innerHTML = "";

    // Combine and sort transactions
    const allTransactions = [...this.expenses, ...this.incomes].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    allTransactions.forEach((transaction) => {
      const transactionEl = document.createElement("div");
      transactionEl.className = `transaction-item ${transaction.type}`;
      transactionEl.innerHTML = `
                    <div>
                        <strong>${transaction.title}</strong>
                        <p>${transaction.category}</p>
                        <small>${new Date(
                          transaction.date
                        ).toLocaleDateString()}</small>
                    </div>
                    <div>
                        <span class="${transaction.type}">
                            ${
                              transaction.type === "income" ? "+" : "-"
                            }${this.formatCurrency(transaction.amount)}
                        </span>
                        <button class="btn btn-danger" onclick="budgetTracker.deleteTransaction('${
                          transaction.type
                        }', ${transaction.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
      transactionList.appendChild(transactionEl);
    });
  }

  saveToLocalStorage() {
    if (!userAuth.currentUser) return;
    
    const username = userAuth.currentUser.username;
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    userData[username] = {
      budget: this.budget,
      expenses: this.expenses,
      incomes: this.incomes,
      theme: document.body.getAttribute('data-theme')
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  loadUserData(username) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userSettings = userData[username] || {
      budget: 0,
      expenses: [],
      incomes: [],
      theme: 'dark'
    };
    this.clearData();
    
    // Load user's data
    this.budget = userSettings.budget;
    this.expenses = userSettings.expenses;
    this.incomes = userSettings.incomes;
    document.body.setAttribute('data-theme', userSettings.theme);
    
    // Update UI with new data
    this.updateUI();
    this.renderCalendar();
  }

  clearData() {
    // Reset all data
    this.budget = 0;
    this.expenses = [];
    this.incomes = [];
    
    // Reset date to current
    this.currentDate = new Date();
    this.selectedDate = new Date();
    
    // Reset calendar
    this.renderCalendar();
    this.dailySummary.innerHTML = ''; // Clear daily summary
    
    // Reset charts
    if (this.expenseChartInstance) {
      this.expenseChartInstance.destroy();
    }
    if (this.incomeChartInstance) {
      this.incomeChartInstance.destroy();
    }
    this.expenseChartInstance = null;
    this.incomeChartInstance = null;
    
    // Reset form
    this.expenseForm.reset();
    document.getElementById('transactionType').value = 'expense';
    document.getElementById('expenseCategory').innerHTML = this.getExpenseCategories();
    
    // Reset UI
    this.updateUI();
  }

  loadFromLocalStorage() {
    try {
      const data = JSON.parse(localStorage.getItem("budgetTrackerData"));
      if (data) {
        this.budget = data.budget || 0;
        this.expenses = data.expenses || [];
        this.incomes = data.incomes || [];
        document.body.setAttribute("data-theme", data.theme || "dark");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      this.budget = 0;
      this.expenses = [];
      this.incomes = [];
    }
  }

  exportData() {
    const data = {
      budget: this.budget,
      expenses: this.expenses,
      incomes: this.incomes,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-tracker-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  initializeThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", savedTheme);
    this.updateThemeToggleIcon(savedTheme);

    themeToggle.addEventListener("click", () => {
      const currentTheme = document.body.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";
      document.body.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      this.updateThemeToggleIcon(newTheme);
    });
  }

  updateThemeToggleIcon(theme) {
    const icon = document.querySelector(".theme-toggle i");
    icon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  static addStyles() {
    const style = document.createElement("style");
    style.textContent = `
                .charts-container {
                    margin: 2rem 0;
                }

                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    padding: 1rem;
                }

                .chart-wrapper {
                    height: 300px;
                    position: relative;
                }

                .chart-wrapper h3 {
                    text-align: center;
                    margin-bottom: 1rem;
                }

                .transaction-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .transaction-item.income {
                    border-left: 4px solid var(--success-color);
                }

                .transaction-item.expense {
                    border-left: 4px solid var(--danger-color);
                }

                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 10px 20px;
                    border-radius: 4px;
                    color: white;
                    z-index: 1000;
                    animation: slideIn 0.3s ease-out;
                }

                .notification.success {
                    background-color: var(--success-color);
                }

                .notification.error {
                    background-color: var(--danger-color);
                }

                .notification.warning {
                    background-color: #f59e0b;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .calendar-day {
                    position: relative;
                    min-height: 80px;
                    padding: 5px;
                    border: 1px solid var(--border-color);
                    cursor: pointer;
                }

                .calendar-day.header {
                    background-color: var(--primary-color);
                    color: white;
                    text-align: center;
                    font-weight: bold;
                }

                .calendar-day.blank {
                    background-color: var(--background-color-light);
                }

                .calendar-day.has-transactions {
                    background-color: var(--background-color-light);
                }

                .day-transactions {
                    font-size: 0.8em;
                    margin-top: 5px;
                }

                .day-transactions .income {
                    color: var(--success-color);
                }

                .day-transactions .expense {
                    color: var(--danger-color);
                }
            `;
    document.head.appendChild(style);
  }
}

UserAuth.addStyles();
const userAuth = new UserAuth();
// Initialize the budget tracker
BudgetTracker.addStyles();
const budgetTracker = new BudgetTracker();
