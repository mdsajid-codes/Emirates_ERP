package com.example.multi_tanent.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.*;

@Component
public class JwtUtil {
  private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

  @Value("${jwt.secret}")
  private String secret;

  @Value("${jwt.expiration.ms:86400000}") // Default to 1 day (in milliseconds)
  private long expirationMs;

  private Key key;

  @PostConstruct
  public void init() {
    // A strong secret key is crucial for security.
    // It should be at least 256 bits (32 characters) long for HS256 algorithm.
    if (secret == null || secret.getBytes().length < 32) {
      log.error("JWT secret is not configured or is too short. It must be at least 32 bytes long.");
      throw new IllegalArgumentException("JWT secret key must be at least 256 bits (32 characters) long.");
    }
    this.key = Keys.hmacShaKeyFor(secret.getBytes());
  }

  public String generateToken(String username, String tenantId, Collection<String> roles) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + expirationMs);

    return Jwts.builder()
      .setSubject(username)
      .claim("tenantId", tenantId)
      .claim("roles", roles)
      .setIssuedAt(now)
      .setExpiration(expiryDate)
      .signWith(key, SignatureAlgorithm.HS256)
      .compact();
  }

  public Jws<Claims> parse(String token) {
    try {
      return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    } catch (JwtException e) {
      // The JJWT library throws specific subclasses of JwtException.
      // Logging here helps in debugging, but we re-throw to let the caller handle the auth failure.
      log.debug("Invalid JWT token: {}", e.getMessage());
      throw e;
    }
  }
}
