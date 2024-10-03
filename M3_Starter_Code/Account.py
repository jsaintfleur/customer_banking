class Account:
    """Account class for managing account balance and interest.
    
    Attributes:
        balance (float): The current balance of the account.
        interest (float): The interest earned on the account.
    """
    
    def __init__(self, balance, interest):
        """Initialize Account with balance and interest.
        
        Args:
            balance (float): Initial balance for the account.
            interest (float): Initial interest for the account.
        """
        self.set_balance(balance)  # Initialize balance using the setter method to ensure validation.
        self.set_interest(interest)  # Initialize interest using the setter method to ensure validation.

    def set_balance(self, balance):
        """Sets the balance for the account, ensuring it is non-negative.
        
        Args:
            balance (float): The new balance for the account.
        
        Raises:
            ValueError: If the balance is negative.
        """
        if balance < 0:  # Check if the balance is negative before setting.
            raise ValueError("Balance cannot be negative.")  # Raise an error if balance is invalid.
        self.balance = balance  # Set the balance.

    def get_balance(self):
        """Gets the current balance of the account.
        
        Returns:
            float: The current balance.
        """
        return self.balance  # Return the current balance.

    def set_interest(self, interest):
        """Sets the interest earned for the account, ensuring it is non-negative.
        
        Args:
            interest (float): The new interest earned.
        
        Raises:
            ValueError: If the interest is negative.
        """
        if interest < 0:  # Check if the interest is negative before setting.
            raise ValueError("Interest cannot be negative.")  # Raise an error if interest is invalid.
        self.interest = interest  # Set the interest.

    def get_interest(self):
        """Gets the current interest earned on the account.
        
        Returns:
            float: The current interest earned.
        """
        return self.interest  # Return the current interest earned.
