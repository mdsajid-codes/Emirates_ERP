package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.services.AtsConsentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/ats/consent")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsPublicConsentController {

    private final AtsConsentService consentService;

    @GetMapping(value = "/respond", produces = MediaType.TEXT_HTML_VALUE)
    public String respond(
            @RequestParam String token,
            @RequestParam String action,
            @RequestParam(required = false, defaultValue = "") String reason) {
        
        try {
            String status = consentService.respondToConsent(token, action, reason);
            
            String iconClass;
            String iconHtml;
            String title;
            String description;

            if ("ACCEPTED".equalsIgnoreCase(status)) {
                iconClass = "success";
                iconHtml = "✓";
                title = "Consent Approved Successfully";
                description = "Thank you for granting consent. Your request has been recorded. We will continue processing your application and verify any uploaded documents.";
            } else if ("REJECTED".equalsIgnoreCase(status)) {
                iconClass = "reject";
                iconHtml = "✗";
                title = "Consent Request Declined";
                description = "You have rejected the data privacy consent. In compliance with privacy regulations, we will not process your personal data for job applications.";
            } else {
                iconClass = "expired";
                iconHtml = "⚠";
                title = "Link Expired";
                description = "This privacy consent link has expired. Please contact the recruitment team to request a new verification link.";
            }

            return getHtmlTemplate(iconClass, iconHtml, title, description);
        } catch (Exception e) {
            return getHtmlTemplate("reject", "✗", "Invalid Token", "The verification link is invalid, expired, or has already been used. If you think this is a mistake, please reach out to our team.");
        }
    }

    private String getHtmlTemplate(String iconClass, String iconHtml, String title, String description) {
        String color = "#10b981"; // success
        if ("reject".equals(iconClass)) {
            color = "#ef4444";
        } else if ("expired".equals(iconClass)) {
            color = "#f59e0b";
        }

        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <title>Data Privacy Response</title>\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
                "    <style>\n" +
                "        body { font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; background-color: #f3f4f6; color: #1f2937; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }\n" +
                "        .card { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); max-width: 480px; width: 100%; text-align: center; border-top: 5px solid " + color + "; }\n" +
                "        .icon-circle { width: 70px; height: 70px; border-radius: 50%; background-color: " + color + "1a; color: " + color + "; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; margin: 0 auto 1.5rem auto; }\n" +
                "        .title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; color: #111827; }\n" +
                "        .desc { font-size: 0.95rem; color: #4b5563; line-height: 1.6; margin-bottom: 0px; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"card\">\n" +
                "        <div class=\"icon-circle\">" + iconHtml + "</div>\n" +
                "        <div class=\"title\">" + title + "</div>\n" +
                "        <p class=\"desc\">" + description + "</p>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
