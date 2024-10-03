from Account import Account  # Import the Account class from the Account module

def create_cd_account(balance, interest_rate, months):
    """Create a CD account, calculate interest earned, and update the balance.
    
    Args:
        balance (float): The initial balance of the CD account.
        interest_rate (float): The annual percentage rate (APR) for the CD account.
        months (int): The number of months for which interest will be calculated.
    
    Returns:
        tuple: A tuple containing the updated balance and the interest earned.
    
    Raises:
        ValueError: If any input is invalid (e.g., negative values).
    """
    if balance < 0 or interest_rate < 0 or months < 0:  # Validate that inputs are non-negative
        raise ValueError("Balance, interest rate, and months must be non-negative.")
    
    # Create an instance of the Account class with the initial balance and 0 interest
    cd_account = Account(balance, 0)
    
    # Calculate the interest earned using simple interest formula
    interest_earned = balance * (interest_rate / 100) * (months / 12)
    
    # Update the balance by adding the interest earned
    updated_balance = balance + interest_earned
    
    # Update the account instance with the new balance and interest earned
    cd_account.set_balance(updated_balance)
    cd_account.set_interest(interest_earned)
    
    # Return the updated balance and the interest earned
    return updated_balance, interest_earned
