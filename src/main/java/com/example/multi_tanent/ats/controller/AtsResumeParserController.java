package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.ParsedResumeDTO;
import com.example.multi_tanent.ats.services.ResumeParsingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ats/resume")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsResumeParserController {

    private final ResumeParsingService resumeParsingService;

    @PostMapping("/parse")
    public ResponseEntity<ParsedResumeDTO> parse(@RequestParam("file") MultipartFile file) {
        try {
            ParsedResumeDTO result = resumeParsingService.parseResume(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            throw new IllegalArgumentException("Failed to parse resume: " + e.getMessage());
        }
    }
}
