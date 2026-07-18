package com.example.multi_tanent.tenant.base.dto;

import com.example.multi_tanent.master.enums.Role;
import com.example.multi_tanent.spersusers.dto.LocationResponse;
import com.example.multi_tanent.spersusers.enitity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Set<Role> roles;
    private Boolean isActive;
    private Boolean isLocked;
    private Long storeId;
    private String storeName;
    private LocationResponse location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRoles(),
                user.getIsActive(),
                user.getIsLocked(),
                user.getStore() != null ? user.getStore().getId() : null,
                user.getStore() != null ? user.getStore().getName() : null,
                user.getLocation() != null ? LocationResponse.fromEntity(user.getLocation()) : null,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}