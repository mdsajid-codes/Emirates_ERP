package com.example.multi_tanent.ats.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Base64;

@Converter
@Component
public class AttributeEncryptor implements AttributeConverter<String, String> {

    private static final String AES = "AES";

    // Holds the resolved key; updated by Spring before any HTTP request reaches a service.
    private static volatile String staticSecretKey = "GTRServiceKey2026Encryption32Chr";

    @org.springframework.beans.factory.annotation.Autowired
    public void setSecretKey(@Value("${app.encryption.key:GTRServiceKey2026Encryption32Chr}") String secretKey) {
        staticSecretKey = secretKey;
    }

    /** Builds a Key from whatever secret is currently configured. */
    private static Key buildKey() {
        byte[] keyBytes = staticSecretKey.getBytes();
        byte[] secretBytes = new byte[32];
        System.arraycopy(keyBytes, 0, secretBytes, 0, Math.min(keyBytes.length, 32));
        return new SecretKeySpec(secretBytes, AES);
    }

    // No-arg constructor required by JPA — no shared Cipher stored anymore.
    public AttributeEncryptor() {
        // intentionally empty; Cipher is created fresh per call (thread-safe)
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            // Create a fresh Cipher per call — Cipher is NOT thread-safe
            Cipher cipher = Cipher.getInstance(AES);
            cipher.init(Cipher.ENCRYPT_MODE, buildKey());
            byte[] encrypted = cipher.doFinal(attribute.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to encrypt attribute: " + e.getMessage(), e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            // Create a fresh Cipher per call — Cipher is NOT thread-safe
            Cipher cipher = Cipher.getInstance(AES);
            cipher.init(Cipher.DECRYPT_MODE, buildKey());
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(dbData));
            return new String(decrypted);
        } catch (Exception e) {
            // In case existing value is stored in plaintext or decryption fails
            return dbData;
        }
    }
}
