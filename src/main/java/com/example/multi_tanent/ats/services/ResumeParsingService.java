package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.ParsedResumeDTO;
import com.example.multi_tanent.ats.entity.AtsAiProvider;
import com.example.multi_tanent.ats.enums.AiProviderType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeParsingService {

    private final AtsAiProviderService aiProviderService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public ParsedResumeDTO parseResume(MultipartFile file) throws Exception {
        // 1. Extract raw text via Apache Tika
        String rawText = extractText(file);

        // 2. Fetch current active provider configured for the tenant
        AtsAiProvider activeProvider = aiProviderService.getActiveProvider();

        // 3. Construct structured prompt
        String prompt = buildPrompt(rawText);

        // 4. Send request to the selected provider
        String jsonResult = "";
        if (activeProvider.getProviderType() == AiProviderType.OPENAI) {
            jsonResult = callOpenAi(activeProvider, prompt);
        } else if (activeProvider.getProviderType() == AiProviderType.GEMINI) {
            jsonResult = callGemini(activeProvider, prompt);
        } else {
            throw new UnsupportedOperationException("AI Provider type: " + activeProvider.getProviderType() + " is not currently supported for parsing.");
        }

        // Clean JSON formatting wrapped by Markdown (```json ... ```)
        jsonResult = cleanJsonString(jsonResult);

        // 5. Parse returned JSON string into exact DTO mapping
        return objectMapper.readValue(jsonResult, ParsedResumeDTO.class);
    }

    private String extractText(MultipartFile file) throws Exception {
        Tika tika = new Tika();
        try (InputStream stream = file.getInputStream()) {
            return tika.parseToString(stream);
        }
    }

    private String callOpenAi(AtsAiProvider provider, String prompt) {
        String url = provider.getBaseUrl() != null && !provider.getBaseUrl().isBlank() 
                ? provider.getBaseUrl() 
                : "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(provider.getApiKey());
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "model", provider.getModel(),
                "messages", List.of(
                        Map.of("role", "system", "content", "You are an expert resume parsing bot. You must reply only with structured JSON."),
                        Map.of("role", "user", "content", prompt)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", provider.getTemperature(),
                "max_tokens", provider.getMaxTokens()
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }

    private String callGemini(AtsAiProvider provider, String prompt) {
        log.info("[Gemini] model='{}', baseUrl='{}', apiKeyPresent={}",
                provider.getModel(),
                provider.getBaseUrl(),
                provider.getApiKey() != null && !provider.getApiKey().isBlank());

        // Build the base URL — prefer DB value (e.g. custom proxy), but always fall back
        // to the standard v1beta endpoint where gemini-1.5-flash and newer models live.
        String baseUrl = (provider.getBaseUrl() != null && !provider.getBaseUrl().isBlank())
                ? provider.getBaseUrl()
                : "https://generativelanguage.googleapis.com/v1beta/models/" + provider.getModel() + ":generateContent";

        // Gemini authenticates via ?key= query param, not a Bearer header.
        // If the stored base_url does not already contain the key, append it now.
        String url;
        if (baseUrl.contains("key=")) {
            url = baseUrl;
            log.info("[Gemini] Using stored base_url (key already embedded)");
        } else {
            url = baseUrl + (baseUrl.contains("?") ? "&" : "?") + "key=" + provider.getApiKey();
            log.info("[Gemini] Constructed URL (key appended): {}", url.replaceAll("key=[^&]+", "key=***MASKED***"));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                ),
                "generation_config", Map.of(
                        "temperature", provider.getTemperature(),
                        "max_output_tokens", provider.getMaxTokens()
                )
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        return (String) parts.get(0).get("text");
    }

    private String cleanJsonString(String rawJson) {
        String clean = rawJson.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }

    private String buildPrompt(String resumeText) {
        return "Extract the complete details from the following resume text and format them strictly as a single JSON object. " +
                "Make sure all properties match this schema precisely. If any details are not found in the resume, set them to null. Do not hallucinate fields.\n\n" +
                "JSON Schema:\n" +
                "{\n" +
                "  \"firstName\": \"string\",\n" +
                "  \"middleName\": \"string or null\",\n" +
                "  \"lastName\": \"string\",\n" +
                "  \"email\": \"string\",\n" +
                "  \"mobileNumber\": \"string or null\",\n" +
                "  \"linkedinUrl\": \"string or null\",\n" +
                "  \"jobTitle\": \"string\",\n" +
                "  \"experienceYears\": number or null,\n" +
                "  \"primarySkills\": \"comma separated skills string or null\",\n" +
                "  \"nationality\": \"string or null\",\n" +
                "  \"address\": {\n" +
                "    \"street\": \"string or null\",\n" +
                "    \"city\": \"string or null\",\n" +
                "    \"state\": \"string or null\",\n" +
                "    \"zipCode\": \"string or null\",\n" +
                "    \"country\": \"string or null\"\n" +
                "  },\n" +
                "  \"educations\": [\n" +
                "    {\n" +
                "      \"schoolName\": \"string\",\n" +
                "      \"degree\": \"string\",\n" +
                "      \"majorStudy\": \"string or null\",\n" +
                "      \"yearCompleted\": number or null,\n" +
                "      \"gpa\": number or null,\n" +
                "      \"country\": \"string or null\",\n" +
                "      \"state\": \"string or null\",\n" +
                "      \"city\": \"string or null\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"workExperiences\": [\n" +
                "    {\n" +
                "      \"employerName\": \"string\",\n" +
                "      \"jobTitle\": \"string\",\n" +
                "      \"startDate\": \"YYYY-MM-DD or YYYY-MM or null\",\n" +
                "      \"endDate\": \"YYYY-MM-DD or YYYY-MM or null\",\n" +
                "      \"isCurrent\": boolean,\n" +
                "      \"location\": \"string or null\",\n" +
                "      \"description\": \"string or null\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"certifications\": [\n" +
                "    {\n" +
                "      \"certificationName\": \"string\",\n" +
                "      \"completedDate\": \"YYYY-MM-DD or YYYY-MM or null\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"languages\": [\n" +
                "    {\n" +
                "      \"languageName\": \"string\",\n" +
                "      \"canRead\": boolean,\n" +
                "      \"canSpeak\": boolean,\n" +
                "      \"canWrite\": boolean\n" +
                "    }\n" +
                "  ]\n" +
                "}\n\n" +
                "Resume raw text:\n" +
                "====================================\n" +
                resumeText + "\n" +
                "====================================\n";
    }
}
