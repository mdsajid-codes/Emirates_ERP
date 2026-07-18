package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsClientNoteRequest {

    @NotNull(message = "Client ID is required")
    private Long clientId;

    private Long actionId;

    private TaskPriority notesPriority;

    @NotBlank(message = "Note body is required")
    private String noteBody;

    private List<Long> notifyPeopleIds;

    private Boolean remindMe;

    private Long createdById;
}
