package com.example.multi_tanent.accounts.service.coa;

import com.example.multi_tanent.accounts.dto.coa.ItemGLAccountRequest;
import com.example.multi_tanent.accounts.dto.coa.ItemGLAccountResponse;
import com.example.multi_tanent.accounts.entity.ItemGLAccount;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.repository.ItemGLAccountRepository;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class ItemGLAccountServiceImpl implements ItemGLAccountService {

    private final ItemGLAccountRepository itemGLAccountRepository;
    private final ChartOfAccountRepository coaRepository;
    private final TenantRepository tenantRepository;

    private Tenant resolveCurrentTenant() {
        String tenantIdStr = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantIdStr)
                .orElseThrow(() -> new IllegalStateException("Tenant context not initialized properly."));
    }

    private ChartOfAccount getAccount(Long id) {
        if (id == null) return null;
        return coaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Chart of Account not found with ID: " + id));
    }

    @Override
    public ItemGLAccountResponse save(ItemGLAccountRequest request) {
        Tenant tenant = resolveCurrentTenant();

        ItemGLAccount entity = itemGLAccountRepository.findByItemIdAndTenant(request.getItemId(), tenant.getId())
                .orElse(null);

        if (entity == null) {
            entity = new ItemGLAccount();
            entity.setItemId(request.getItemId());
            entity.setTenant(tenant);
        }

        entity.setGlAccount(getAccount(request.getGlAccountId()));
        entity.setGoodsOnConsignmentAccount(getAccount(request.getGoodsOnConsignmentAccountId()));
        entity.setSalesRevenueAccount(getAccount(request.getSalesRevenueAccountId()));
        entity.setTradeDiscountsAccount(getAccount(request.getTradeDiscountsAccountId()));
        entity.setCostOfGoodsSoldAccount(getAccount(request.getCostOfGoodsSoldAccountId()));
        entity.setDeferredExpensesAccount(getAccount(request.getDeferredExpensesAccountId()));
        entity.setOutputVatAccount(getAccount(request.getOutputVatAccountId()));
        entity.setInputVatAccount(getAccount(request.getInputVatAccountId()));

        ItemGLAccount saved = itemGLAccountRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public ItemGLAccountResponse getByItemId(Long itemId) {
        Tenant tenant = resolveCurrentTenant();
        ItemGLAccount entity = itemGLAccountRepository.findByItemIdAndTenant(itemId, tenant.getId())
                .orElseThrow(() -> new NoSuchElementException("Item GL Account mapping not found for item ID: " + itemId));
        return toResponse(entity);
    }

    @Override
    public List<ItemGLAccountResponse> getAll() {
        Tenant tenant = resolveCurrentTenant();
        return itemGLAccountRepository.findAllByTenant(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        ItemGLAccount entity = itemGLAccountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Item GL Account mapping not found with ID: " + id));
        itemGLAccountRepository.delete(entity);
    }

    private ItemGLAccountResponse toResponse(ItemGLAccount entity) {
        ItemGLAccountResponse response = new ItemGLAccountResponse();
        response.setId(entity.getId());
        response.setItemId(entity.getItemId());

        if (entity.getGlAccount() != null) {
            response.setGlAccountId(entity.getGlAccount().getAccountId());
            response.setGlAccountCode(entity.getGlAccount().getAccountCode());
        }
        if (entity.getGoodsOnConsignmentAccount() != null) {
            response.setGoodsOnConsignmentAccountId(entity.getGoodsOnConsignmentAccount().getAccountId());
            response.setGoodsOnConsignmentAccountCode(entity.getGoodsOnConsignmentAccount().getAccountCode());
        }
        if (entity.getSalesRevenueAccount() != null) {
            response.setSalesRevenueAccountId(entity.getSalesRevenueAccount().getAccountId());
            response.setSalesRevenueAccountCode(entity.getSalesRevenueAccount().getAccountCode());
        }
        if (entity.getTradeDiscountsAccount() != null) {
            response.setTradeDiscountsAccountId(entity.getTradeDiscountsAccount().getAccountId());
            response.setTradeDiscountsAccountCode(entity.getTradeDiscountsAccount().getAccountCode());
        }
        if (entity.getCostOfGoodsSoldAccount() != null) {
            response.setCostOfGoodsSoldAccountId(entity.getCostOfGoodsSoldAccount().getAccountId());
            response.setCostOfGoodsSoldAccountCode(entity.getCostOfGoodsSoldAccount().getAccountCode());
        }
        if (entity.getDeferredExpensesAccount() != null) {
            response.setDeferredExpensesAccountId(entity.getDeferredExpensesAccount().getAccountId());
            response.setDeferredExpensesAccountCode(entity.getDeferredExpensesAccount().getAccountCode());
        }
        if (entity.getOutputVatAccount() != null) {
            response.setOutputVatAccountId(entity.getOutputVatAccount().getAccountId());
            response.setOutputVatAccountCode(entity.getOutputVatAccount().getAccountCode());
        }
        if (entity.getInputVatAccount() != null) {
            response.setInputVatAccountId(entity.getInputVatAccount().getAccountId());
            response.setInputVatAccountCode(entity.getInputVatAccount().getAccountCode());
        }

        return response;
    }
}
