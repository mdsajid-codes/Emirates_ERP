package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.entity.AtsCountry;
import com.example.multi_tanent.ats.entity.AtsState;
import com.example.multi_tanent.ats.repository.AtsCountryRepository;
import com.example.multi_tanent.ats.repository.AtsStateRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AtsGeoService {

    private final AtsCountryRepository countryRepository;
    private final AtsStateRepository stateRepository;
    private final TenantRepository tenantRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Data
    public static class CountryDto {
        private Long id;
        private String name;
        private String isoCode;

        public CountryDto(Long id, String name, String isoCode) {
            this.id = id;
            this.name = name;
            this.isoCode = isoCode;
        }
    }

    @Data
    public static class StateDto {
        private Long id;
        private String name;
        private String stateCode;

        public StateDto(Long id, String name, String stateCode) {
            this.id = id;
            this.name = name;
            this.stateCode = stateCode;
        }
    }

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Cacheable(value = "ats-geo-countries", key = "#root.target.getTenantId()")
    public List<CountryDto> getCountries() {
        Tenant tenant = currentTenant();
        Long tenantId = tenant.getId();
        log.info("Fetching countries from CountriesNow API for tenant: {}", tenantId);

        String url = "https://countriesnow.space/api/v0.1/countries/positions";
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && Boolean.FALSE.equals(response.get("error"))) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
                List<CountryDto> result = new ArrayList<>();
                for (Map<String, Object> c : data) {
                    String name = (String) c.get("name");
                    String isoCode = (String) c.get("iso2");
                    if (name == null)
                        continue;

                    // Sync to DB
                    AtsCountry country = countryRepository.findByNameAndTenantId(name, tenantId)
                            .orElseGet(() -> {
                                AtsCountry newCountry = AtsCountry.builder()
                                        .tenant(tenant)
                                        .name(name)
                                        .isoCode(isoCode)
                                        .build();
                                return countryRepository.save(newCountry);
                            });
                    result.add(new CountryDto(country.getId(), country.getName(), country.getIsoCode()));
                }
                return result;
            }
        } catch (Exception e) {
            log.error("Error fetching countries from CountriesNow API", e);
        }

        // Fallback to DB
        List<AtsCountry> dbCountries = countryRepository.findByTenantId(tenantId);
        List<CountryDto> fallback = new ArrayList<>();
        for (AtsCountry c : dbCountries) {
            fallback.add(new CountryDto(c.getId(), c.getName(), c.getIsoCode()));
        }
        return fallback;
    }

    @Cacheable(value = "ats-geo-states", key = "#root.target.getTenantId() + '_' + #countryName")
    public List<StateDto> getStates(String countryName) {
        Tenant tenant = currentTenant();
        Long tenantId = tenant.getId();
        log.info("Fetching states from CountriesNow API for country: {}, tenant: {}", countryName, tenantId);

        AtsCountry country = countryRepository.findByNameAndTenantId(countryName, tenantId)
                .orElseGet(() -> {
                    AtsCountry newCountry = AtsCountry.builder()
                            .tenant(tenant)
                            .name(countryName)
                            .build();
                    return countryRepository.save(newCountry);
                });

        String url = "https://countriesnow.space/api/v0.1/countries/states/q?country=" + countryName;
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && Boolean.FALSE.equals(response.get("error"))) {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                List<Map<String, Object>> states = (List<Map<String, Object>>) data.get("states");
                List<StateDto> result = new ArrayList<>();
                for (Map<String, Object> s : states) {
                    String name = (String) s.get("name");
                    String stateCode = (String) s.get("state_code");
                    if (name == null)
                        continue;

                    // Sync to DB
                    AtsState state = stateRepository.findByNameAndCountryIdAndTenantId(name, country.getId(), tenantId)
                            .orElseGet(() -> {
                                AtsState newState = AtsState.builder()
                                        .tenant(tenant)
                                        .country(country)
                                        .name(name)
                                        .stateCode(stateCode)
                                        .build();
                                return stateRepository.save(newState);
                            });
                    result.add(new StateDto(state.getId(), state.getName(), state.getStateCode()));
                }
                return result;
            }
        } catch (Exception e) {
            log.error("Error fetching states from CountriesNow API for country: " + countryName, e);
        }

        return Collections.emptyList();
    }

    public String getTenantId() {
        return TenantContext.getTenantId();
    }
}
