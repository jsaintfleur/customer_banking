from savings_account import create_savings_account  # Import function to handle savings accounts
from cd_account import create_cd_account  # Import function to handle CD accounts

def main():
    """Main function to handle user input, calculate interest, and display results."""
    
    try:
        # Get user input for savings account details
        savings_balance = float(input("Enter the savings account balance: "))  # Ensure input is cast to float
        savings_interest = float(input("Enter the annual interest rate (APR) for the savings account: "))  # Interest rate as float
        savings_maturity = int(input("Enter the number of months for the savings account: "))  # Maturity as integer

        # Calculate interest and updated balance for savings account
        updated_savings_balance, interest_earned_savings = create_savings_account(savings_balance, savings_interest, savings_maturity)

        # Display the results for the savings account
        print(f"Savings Account: Interest earned = ${interest_earned_savings:,.2f}")  # Format to two decimal places and add thousand separators
        print(f"Savings Account: Updated balance after {savings_maturity} months = ${updated_savings_balance:,.2f}\n")  # Thousand separators added

        # Get user input for CD account details
        cd_balance = float(input("Enter the CD account balance: "))  # Ensure input is cast to float
        cd_interest = float(input("Enter the annual interest rate (APR) for the CD account: "))  # Interest rate as float
        cd_maturity = int(input("Enter the number of months for the CD account: "))  # Maturity as integer

        # Calculate interest and updated balance for CD account
        updated_cd_balance, interest_earned_cd = create_cd_account(cd_balance, cd_interest, cd_maturity)

        # Display the results for the CD account
        print(f"CD Account: Interest earned = ${interest_earned_cd:,.2f}")  # Format to two decimal places and add thousand separators
        print(f"CD Account: Updated balance after {cd_maturity} months = ${updated_cd_balance:,.2f}")  # Thousand separators added

    except ValueError as e:
        # Handle invalid input values (e.g., non-numeric or negative inputs)
        print(f"Error: {e}")

# Call the main function to run the program when the script is executed
if __name__ == "__main__":
    main()
