package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorNoteRequest {

    @Size(max = 300)
    private String noteTitle;

    private String noteBody;

    private Long actionId;

    private TaskPriority notesPriority;

    @Size(max = 500)
    private String noteHeader;

    private Boolean remindMe;

    private List<Long> notifyPeopleIds;

    private Boolean isPinned;
}
