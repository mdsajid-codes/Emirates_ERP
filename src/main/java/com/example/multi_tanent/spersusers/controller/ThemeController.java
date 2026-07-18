package com.example.multi_tanent.spersusers.controller;

import com.example.multi_tanent.spersusers.dto.ThemeRequest;
import com.example.multi_tanent.spersusers.dto.ThemeResponse;
import com.example.multi_tanent.spersusers.service.ThemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/themes")
@RequiredArgsConstructor
public class ThemeController {

    private final ThemeService themeService;

    @PostMapping
    public ResponseEntity<ThemeResponse> createTheme(@RequestBody ThemeRequest request) {
        return ResponseEntity.ok(themeService.createTheme(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ThemeResponse> updateTheme(@PathVariable Long id, @RequestBody ThemeRequest request) {
        return ResponseEntity.ok(themeService.updateTheme(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThemeResponse> getTheme(@PathVariable Long id) {
        return ResponseEntity.ok(themeService.getTheme(id));
    }

    @GetMapping
    public ResponseEntity<List<ThemeResponse>> getAllThemes() {
        return ResponseEntity.ok(themeService.getAllThemes());
    }

    @GetMapping("/active")
    public ResponseEntity<ThemeResponse> getActiveTheme() {
        return ResponseEntity.ok(themeService.getActiveTheme());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTheme(@PathVariable Long id) {
        themeService.deleteTheme(id);
        return ResponseEntity.ok().build();
    }
}
