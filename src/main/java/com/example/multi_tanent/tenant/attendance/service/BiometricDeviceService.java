package com.example.multi_tanent.tenant.attendance.service;

import com.example.multi_tanent.tenant.attendance.dto.BiometricDeviceRequest;
import com.example.multi_tanent.tenant.attendance.entity.BiometricCommand;
import com.example.multi_tanent.tenant.attendance.entity.BiometricDevice;
import com.example.multi_tanent.tenant.attendance.enums.BiometricCommandStatus;
import com.example.multi_tanent.tenant.attendance.enums.BiometricCommandType;
import com.example.multi_tanent.tenant.attendance.repository.BiometricCommandRepository;
import com.example.multi_tanent.tenant.attendance.repository.BiometricDeviceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(transactionManager = "tenantTx")
public class BiometricDeviceService {

    private final BiometricDeviceRepository deviceRepository;
    private final BiometricCommandRepository commandRepository;

    public BiometricDeviceService(BiometricDeviceRepository deviceRepository,
                                 BiometricCommandRepository commandRepository) {
        this.deviceRepository = deviceRepository;
        this.commandRepository = commandRepository;
    }

    public BiometricDevice createDevice(BiometricDeviceRequest request) {
        deviceRepository.findByDeviceIdentifier(request.getDeviceIdentifier()).ifPresent(d -> {
            throw new RuntimeException("Device with identifier '" + request.getDeviceIdentifier() + "' already exists.");
        });

        BiometricDevice device = new BiometricDevice();
        mapRequestToEntity(request, device);

        return deviceRepository.save(device);
    }

    @Transactional(readOnly = true)
    public List<BiometricDevice> getAllDevices() {
        return deviceRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<BiometricDevice> getDeviceById(Long id) {
        return deviceRepository.findById(id);
    }

    public BiometricDevice updateDevice(Long id, BiometricDeviceRequest request) {
        BiometricDevice device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Biometric device not found with id: " + id));

        if (!device.getDeviceIdentifier().equals(request.getDeviceIdentifier())) {
            deviceRepository.findByDeviceIdentifier(request.getDeviceIdentifier()).ifPresent(d -> {
                throw new RuntimeException("Device with identifier '" + request.getDeviceIdentifier() + "' already exists.");
            });
        }

        mapRequestToEntity(request, device);

        return deviceRepository.save(device);
    }

    public void deleteDevice(Long id) {
        if (!deviceRepository.existsById(id)) {
            throw new RuntimeException("Biometric device not found with id: " + id);
        }
        deviceRepository.deleteById(id);
    }

    /**
     * Queues a remote command for the biometric agent to execute on the physical device.
     */
    public BiometricCommand issueCommand(Long deviceId, String commandType, String payload) {
        BiometricDevice device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found: " + deviceId));

        BiometricCommand command = BiometricCommand.builder()
                .device(device)
                .commandType(BiometricCommandType.valueOf(commandType))
                .payload(payload)
                .status(BiometricCommandStatus.PENDING)
                .build();

        return commandRepository.save(command);
    }

    private void mapRequestToEntity(BiometricDeviceRequest request, BiometricDevice device) {
        device.setName(request.getName());
        device.setMachineNumber(request.getMachineNumber());
        device.setDeviceIdentifier(request.getDeviceIdentifier());
        device.setDeviceType(request.getDeviceType());
        device.setIpAddress(request.getIpAddress());
        device.setPort(request.getPort());
        device.setSiteLattitude(request.getSiteLattitude());
        device.setSiteLongitude(request.getSiteLongitude());
        device.setActive(request.getActive());
        device.setLocation(request.getLocation());
        device.setApiKey(request.getApiKey());
        device.setVendorFormat(request.getVendorFormat());
    }
}