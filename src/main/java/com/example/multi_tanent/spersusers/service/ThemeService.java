package com.example.multi_tanent.spersusers.service;

import com.example.multi_tanent.spersusers.dto.ThemeRequest;
import com.example.multi_tanent.spersusers.dto.ThemeResponse;

import java.util.List;

public interface ThemeService {
    ThemeResponse createTheme(ThemeRequest request);

    ThemeResponse updateTheme(Long id, ThemeRequest request);

    ThemeResponse getTheme(Long id);

    List<ThemeResponse> getAllThemes();

    ThemeResponse getActiveTheme();

    void deleteTheme(Long id);
}
