package com.example.multi_tanent.accounts.exception;

public class InsufficientBalanceException extends RuntimeException {

    public InsufficientBalanceException(String message) {
        super(message);
    }

    public InsufficientBalanceException(String accountNumber, String requestedAmount, String availableBalance) {
        super(String.format("Insufficient balance in account %s. Requested: %s, Available: %s",
                accountNumber, requestedAmount, availableBalance));
    }
}
