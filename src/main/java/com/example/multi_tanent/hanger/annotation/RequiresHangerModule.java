package com.example.multi_tanent.hanger.annotation;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Apply this annotation on any hanger controller method or class
 * to enforce that the current tenant has the HANGER_MANUFACTURING module
 * enabled.
 * Returns 403 Forbidden for all other tenants.
 */
@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("@hangerModuleGuard.check()")
public @interface RequiresHangerModule {
}
