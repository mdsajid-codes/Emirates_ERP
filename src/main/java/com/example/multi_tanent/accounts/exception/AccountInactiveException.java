package com.example.multi_tanent.accounts.exception;

public class AccountInactiveException extends RuntimeException {

    public AccountInactiveException(String accountNumber) {
        super(String.format("Account %s is inactive or frozen", accountNumber));
    }
}
