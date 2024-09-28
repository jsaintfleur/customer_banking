class Account:
    """Creating an Account class with methods to manage balance and interest"""
    
    def __init__(self, balance, interest):
        self.balance = balance
        self.interest = interest

    # This method sets the balance of the account.
    def set_balance(self, balance):
        """Sets the balance for the account."""
        self.balance = balance

    # This method returns the balance of the account.
    def get_balance(self):
        """Gets the current balance of the account."""
        return self.balance

    # This method sets the interest earned for the account.
    def set_interest(self, interest):
        """Sets the interest earned for the account."""
        self.interest = interest

    # This method returns the interest earned.
    def get_interest(self):
        """Gets the current interest earned on the account."""
        return self.interest