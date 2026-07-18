package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.entity.Contact;
import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactDto {

  private Long id;
  private Long leadId;
  private String firstName;
  private String lastName;
  private String email;
  private String phone;
  private OffsetDateTime createdAt;
  private OffsetDateTime updatedAt;

  public static ContactDto fromEntity(Contact contact) {
    if (contact == null) {
      return null;
    }
    return new ContactDto(
        contact.getId(),
        contact.getLead() != null ? contact.getLead().getId() : null,
        contact.getFirstName(),
        contact.getLastName(),
        contact.getEmail(),
        contact.getPhone(),
        contact.getCreatedAt(),
        contact.getUpdatedAt());
  }
}
