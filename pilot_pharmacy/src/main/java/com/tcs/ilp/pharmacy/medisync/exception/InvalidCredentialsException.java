package com.tcs.ilp.pharmacy.medisync.exception;

public class InvalidCredentialsException extends UnauthorizedException {
    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
}