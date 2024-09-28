# Customer Banking System

The **Customer Banking System** is a Python-based application designed to help users calculate and track interest earned on both savings and Certificate of Deposit (CD) accounts. This program allows users to input account details, such as balance, interest rate, and duration, and provides updated balances and interest earned over time.

As a financial analyst, I designed this system to streamline interest calculations, making financial management more efficient for users. This tool enables users to make informed decisions about their savings and investments by providing clear insights into how their money grows over time.

---

## Overview

The **Customer Banking System** focuses on two key types of financial products: savings accounts and CD accounts. With this tool, users can:

- Calculate interest earned on their savings.
- Project the growth of their Certificate of Deposit (CD) balances.
- View updated balances after a specific period (in months) based on the input interest rate.

This program leverages **Python** and its **Object-Oriented Programming (OOP)** paradigm to model account behavior and handle the logic for calculating interest. It provides a simple, intuitive way to manage multiple accounts and forecast financial growth.

---

## Technologies Used

- **Python**: The core programming language for this project.
- **Object-Oriented Programming (OOP)**: Used for managing account balance and interest with classes and methods.
- **Git**: Version control for managing code changes.
- **GitHub**: Repository hosting platform for the project.

---

## Key Features

- **Accurate Interest Calculation**: The system calculates interest based on the Annual Percentage Rate (APR) and the number of months provided by the user.
- **Balance Updates**: It automatically updates the account balance by adding the interest earned over the specified time period.
- **Simple Input and Output**: Users provide account details, and the system returns both the interest earned and the updated balance, formatted to two decimal places for easy reading.
- **Modular Design**: The application is split into multiple components to allow for easy expansion and maintenance.

---

## Project Structure

The project is organized into several modules to ensure clarity and maintainability:

- **[`Account.py`](https://github.com/jsaintfleur/customer_banking/blob/main/M3_Starter_Code/Account.py)**: Defines the core `Account` class, responsible for managing balances and interest. This class serves as the foundation for both savings and CD accounts.
  
- **[`savings_account.py`](https://github.com/jsaintfleur/customer_banking/blob/main/M3_Starter_Code/savings_account.py)**: Implements the logic for handling savings accounts. It includes a function that calculates interest earned, updates the balance, and returns the updated figures.

- **[`cd_account.py`](https://github.com/jsaintfleur/customer_banking/blob/main/M3_Starter_Code/cd_account.py)**: Similar to the savings account module, this file handles Certificate of Deposit (CD) accounts, using a function to calculate interest and update the balance over a user-specified period.

- **[`customer_banking.py`](https://github.com/jsaintfleur/customer_banking/blob/main/M3_Starter_Code/customer_banking.py)**: The main entry point for the application. It prompts users for their account details, calculates the interest and balance updates for both savings and CD accounts, and outputs the results.

---

## Usage Instructions

### Savings Account Interest Calculation

To calculate interest on a savings account:

1. Open the [`savings_account.py`](https://github.com/jsaintfleur/customer_banking/blob/main/M3_Starter_Code/savings_account.py) file.
2. Provide the initial balance, annual interest rate (APR), and the number of months the account will accumulate interest.
3. The program will:
   - Calculate the interest earned using the formula:
     ```python
     interest = balance * (apr / 100) * (months / 12)
     ```
   - Update the balance by adding the interest earned.
   - Return the updated balance and interest earned.

### CD Account Interest Calculation

To calculate interest on a CD account:

1. Open the [`cd_account.py`](https://github.com/jsaintfleur/customer_banking/blob/main/M3_Starter_Code/cd_account.py) file.
2. Provide the CD account balance, APR, and the number of months.
3. The program will:
   - Calculate the interest earned using the same formula as for savings accounts.
   - Update the CD account balance by adding the interest earned.
   - Return the updated balance and interest earned.

### Running the Main Program

To run the full banking system and calculate interest for both savings and CD accounts:

1. Open the [`customer_banking.py`](https://github.com/jsaintfleur/customer_banking/blob/main/M3_Starter_Code/customer_banking.py) file.
2. Run the program, and follow the prompts to input your savings and CD account details.
3. The system will output the interest earned and the updated balances for both accounts.

---

## Example

Below is an example of how the system works when calculating interest for a savings account and a CD account:

```bash
Enter the savings account balance: 1000
Enter the annual interest rate (APR) for the savings account: 5
Enter the number of months for the savings account: 12
Savings Account: Interest earned = $50.00
Savings Account: Updated balance after 12 months = $1050.00

Enter the CD account balance: 2000
Enter the annual interest rate (APR) for the CD account: 3
Enter the number of months for the CD account: 24
CD Account: Interest earned = $120.00
CD Account: Updated balance after 24 months = $2120.00
```

