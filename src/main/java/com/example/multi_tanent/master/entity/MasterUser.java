package com.example.multi_tanent.master.entity;

import com.example.multi_tanent.master.enums.Role;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;

import java.util.Set;

@Entity
@Table(name = "master_users")
@Data
public class MasterUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    @Enumerated(EnumType.STRING)
    private Set<Role> roles;
}