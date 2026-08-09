package com.example.multi_tanent.tenant.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
@RequiredArgsConstructor
public class SseService {

    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<Long, List<SseEmitter>> emitters =
        new ConcurrentHashMap<>();

    public SseEmitter createEmitter(Long userId) {
        SseEmitter emitter = new SseEmitter(0L);

        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>())
                .add(emitter);

        Runnable cleanup = () -> removeEmitter(userId, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        try {
            emitter.send(SseEmitter.event().comment("connected"));
        } catch (IOException e) {
            removeEmitter(userId, emitter);
        }

        log.debug("SSE emitter registered for userId={}, total emitters={}",
            userId, emitters.getOrDefault(userId, Collections.emptyList()).size());
        return emitter;
    }

    public void pushToUser(Long userId, Object payload) {
        List<SseEmitter> userEmitters =
            emitters.getOrDefault(userId, Collections.emptyList());

        if (userEmitters.isEmpty()) {
            log.debug("No active SSE emitters for userId={}", userId);
            return;
        }

        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.error("Failed to serialize notification payload", e);
            return;
        }

        List<SseEmitter> dead = new ArrayList<>();
        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(
                    SseEmitter.event()
                        .name("notification")
                        .data(json, MediaType.APPLICATION_JSON)
                );
            } catch (IOException e) {
                dead.add(emitter);
            }
        }

        if (!dead.isEmpty()) {
            userEmitters.removeAll(dead);
            log.debug("Removed {} dead SSE emitters for userId={}", dead.size(), userId);
        }
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(userId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) emitters.remove(userId);
        }
    }
}
