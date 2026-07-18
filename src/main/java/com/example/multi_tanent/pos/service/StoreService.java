package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.spersusers.dto.StoreRequest;
import com.example.multi_tanent.spersusers.enitity.Store;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.StoreRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class StoreService {

    private final StoreRepository storeRepository;
    private final TenantRepository tenantRepository;

    public StoreService(StoreRepository storeRepository, TenantRepository tenantRepository) {
        this.storeRepository = storeRepository;
        this.tenantRepository = tenantRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found. Cannot perform store operations."));
    }

    public Store createStore(StoreRequest storeRequest) {
        Tenant currentTenant = getCurrentTenant();

        Store store = new Store();
        store.setTenant(currentTenant);
        store.setName(storeRequest.getName());
        store.setAddress(storeRequest.getAddress());
        if (storeRequest.getCurrency() != null) {
            store.setCurrency(storeRequest.getCurrency());
        }
        if (storeRequest.getTimezone() != null) {
            store.setTimezone(storeRequest.getTimezone());
        }
        store.setVatNumber(storeRequest.getVatNumber());

        return storeRepository.save(store);
    }

    @Transactional(readOnly = true)
    public List<Store> getAllStoresForCurrentTenant() {
        Tenant currentTenant = getCurrentTenant();
        return storeRepository.findByTenantId(currentTenant.getId());
    }

    @Transactional(readOnly = true)
    public Optional<Store> getStoreById(Long id) {
        Tenant currentTenant = getCurrentTenant();
        return storeRepository.findByIdAndTenantId(id, currentTenant.getId());
    }

    public Store updateStore(Long id, StoreRequest storeRequest) {
        Store store = getStoreById(id)
                .orElseThrow(() -> new RuntimeException("Store not found with id: " + id));

        store.setName(storeRequest.getName());
        store.setAddress(storeRequest.getAddress());
        store.setCurrency(storeRequest.getCurrency());
        store.setTimezone(storeRequest.getTimezone());
        store.setVatNumber(storeRequest.getVatNumber());

        return storeRepository.save(store);
    }

    public void deleteStore(Long id) {
        Store store = getStoreById(id)
                .orElseThrow(() -> new RuntimeException("Store not found with id: " + id));
        storeRepository.delete(store);
    }
}