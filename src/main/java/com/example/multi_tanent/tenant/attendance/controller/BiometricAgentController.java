package com.example.multi_tanent.tenant.attendance.controller;

import com.example.multi_tanent.tenant.attendance.entity.BiometricAgent;
import com.example.multi_tanent.tenant.attendance.entity.BiometricCommand;
import com.example.multi_tanent.tenant.attendance.entity.BiometricDevice;
import com.example.multi_tanent.tenant.attendance.enums.BiometricAgentStatus;
import com.example.multi_tanent.tenant.attendance.enums.BiometricCommandStatus;
import com.example.multi_tanent.tenant.attendance.repository.BiometricAgentRepository;
import com.example.multi_tanent.tenant.attendance.repository.BiometricCommandRepository;
import com.example.multi_tanent.tenant.attendance.repository.BiometricDeviceRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/biometric/agent")
@CrossOrigin(origins = "*")
public class BiometricAgentController {

    private final BiometricAgentRepository agentRepository;
    private final BiometricDeviceRepository deviceRepository;
    private final BiometricCommandRepository commandRepository;

    public BiometricAgentController(BiometricAgentRepository agentRepository,
                                   BiometricDeviceRepository deviceRepository,
                                   BiometricCommandRepository commandRepository) {
        this.agentRepository = agentRepository;
        this.deviceRepository = deviceRepository;
        this.commandRepository = commandRepository;
    }

    /**
     * Heartbeat endpoint for local sync agents.
     * Authentication handled by BiometricTenantFilter via X-API-KEY.
     */
    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        String agentName = payload.getOrDefault("agentName", "Unknown Agent");
        String version = payload.getOrDefault("version", "1.0.0");
        String ipAddress = request.getRemoteAddr();

        BiometricAgent agent = agentRepository.findByAgentName(agentName)
                .orElse(BiometricAgent.builder()
                        .agentName(agentName)
                        .build());

        agent.setLastSeen(LocalDateTime.now());
        agent.setVersion(version);
        agent.setIpAddress(ipAddress);
        agent.setStatus(BiometricAgentStatus.ONLINE);

        agentRepository.save(agent);

        // Fetch pending commands for all devices of this tenant
        List<BiometricDevice> devices = deviceRepository.findAll();
        List<BiometricCommand> pendingCommands = new ArrayList<>();
        for (BiometricDevice device : devices) {
            pendingCommands.addAll(commandRepository.findByDeviceAndStatus(device, BiometricCommandStatus.PENDING));
        }

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "serverTime", LocalDateTime.now(),
            "commands", pendingCommands
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getAllAgents() {
        return ResponseEntity.ok(agentRepository.findAll());
    }

    @PostMapping("/command/acknowledge")
    public ResponseEntity<?> acknowledgeCommand(@RequestBody Map<String, Object> payload) {
        Long commandId = Long.valueOf(payload.get("commandId").toString());
        BiometricCommandStatus status = BiometricCommandStatus.valueOf(payload.get("status").toString());
        String message = (String) payload.get("message");

        BiometricCommand command = commandRepository.findById(commandId)
                .orElseThrow(() -> new RuntimeException("Command not found: " + commandId));

        command.setStatus(status);
        command.setResponseMessage(message);
        command.setExecutedAt(LocalDateTime.now());

        commandRepository.save(command);

        return ResponseEntity.ok(Map.of("status", "success"));
    }
}
