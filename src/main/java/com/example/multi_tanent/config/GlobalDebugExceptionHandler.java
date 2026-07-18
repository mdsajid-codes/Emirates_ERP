package com.example.multi_tanent.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
    @lombok.extern.slf4j.Slf4j
public class GlobalDebugExceptionHandler {
 
    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleTypeMismatch(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex) {
        Map<String, String> response = new HashMap<>();
        Class<?> requiredType = ex.getRequiredType();
        String typeName = requiredType != null ? requiredType.getSimpleName() : "unknown";
        response.put("message", String.format("Parameter '%s' should be of type %s", ex.getName(), typeName));
        response.put("error", "Bad Request");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());
        response.put("error", "Bad Request");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(org.springframework.dao.DataIntegrityViolationException ex) {
        Map<String, String> response = new HashMap<>();
        String msg = ex.getMostSpecificCause().getMessage();
        if (msg.contains("Duplicate entry")) {
            if (msg.contains("chart_of_accounts") || msg.contains("account_code")) {
                response.put("message", "An account with this unique Account Code already exists.");
            } else {
                response.put("message", "A record with this unique identifier (Plate/VIN/Engine No/Code) already exists.");
            }
        } else {
            response.put("message", "Database integrity violation: " + msg);
        }
        response.put("error", "Conflict");
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(org.springframework.web.server.ResponseStatusException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getReason());
        response.put("error", ex.getStatusCode().toString());
        return new ResponseEntity<>(response, ex.getStatusCode());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        log.error("Unhandled Exception: {} - {}", ex.getClass().getName(), ex.getMessage(), ex);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());
        response.put("error", "Internal Server Error");
        response.put("type", ex.getClass().getName());
        
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        ex.printStackTrace(pw);
        response.put("trace", sw.toString());

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
