package com.example.multi_tanent.master.dto;

import com.example.multi_tanent.master.entity.MasterUser;
import com.example.multi_tanent.master.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MasterUserResponse {
    private Long id;
    private String username;
    private Set<Role> roles;

    public static MasterUserResponse fromEntity(MasterUser user) {
        return new MasterUserResponse(
                user.getId(),
                user.getUsername(),
                user.getRoles());
    }
}