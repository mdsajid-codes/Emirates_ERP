package com.example.multi_tanent.accounts.service.coa;

import com.example.multi_tanent.accounts.dto.coa.PartyGLAccountRequest;
import com.example.multi_tanent.accounts.dto.coa.PartyGLAccountResponse;
import com.example.multi_tanent.accounts.entity.PartyGLAccount;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.PartyType;
import com.example.multi_tanent.accounts.repository.PartyGLAccountRepository;
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
public class PartyGLAccountServiceImpl implements PartyGLAccountService {

    private final PartyGLAccountRepository partyGLAccountRepository;
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
    public PartyGLAccountResponse save(PartyGLAccountRequest request) {
        Tenant tenant = resolveCurrentTenant();

        PartyGLAccount entity = partyGLAccountRepository.findByPartyTypeAndPartyIdAndTenant(
                request.getPartyType(),
                request.getPartyId(),
                tenant.getId()
        ).orElse(null);

        if (entity == null) {
            entity = new PartyGLAccount();
            entity.setPartyType(request.getPartyType());
            entity.setPartyId(request.getPartyId());
            entity.setTenant(tenant);
        }

        entity.setAccountsReceivable(getAccount(request.getAccountsReceivableId()));
        entity.setAccountsPayable(getAccount(request.getAccountsPayableId()));
        entity.setAdvancesReceived(getAccount(request.getAdvancesReceivedId()));
        entity.setAdvancesPaid(getAccount(request.getAdvancesPaidId()));
        entity.setPdcsReceived(getAccount(request.getPdcsReceivedId()));
        entity.setPdcsIssued(getAccount(request.getPdcsIssuedId()));
        entity.setContractAssets(getAccount(request.getContractAssetsId()));
        entity.setRetentionReceivables(getAccount(request.getRetentionReceivablesId()));
        entity.setRetentionPayables(getAccount(request.getRetentionPayablesId()));
        entity.setRetentionOutputVat(getAccount(request.getRetentionOutputVatId()));
        entity.setRetentionInputVat(getAccount(request.getRetentionInputVatId()));
        entity.setUnbilledPurchases(getAccount(request.getUnbilledPurchasesId()));
        entity.setAdvanceToReceive(getAccount(request.getAdvanceToReceiveId()));

        PartyGLAccount saved = partyGLAccountRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public PartyGLAccountResponse getByTypeAndId(PartyType partyType, Long partyId) {
        Tenant tenant = resolveCurrentTenant();
        PartyGLAccount entity = partyGLAccountRepository.findByPartyTypeAndPartyIdAndTenant(
                partyType,
                partyId,
                tenant.getId()
        ).orElseThrow(() -> new NoSuchElementException(
                "Party GL Account mapping not found for party: " + partyType + " ID: " + partyId
        ));
        return toResponse(entity);
    }

    @Override
    public List<PartyGLAccountResponse> getAll() {
        Tenant tenant = resolveCurrentTenant();
        return partyGLAccountRepository.findAllByTenant(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        PartyGLAccount entity = partyGLAccountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Party GL Account mapping not found with ID: " + id));
        partyGLAccountRepository.delete(entity);
    }

    private PartyGLAccountResponse toResponse(PartyGLAccount entity) {
        PartyGLAccountResponse response = new PartyGLAccountResponse();
        response.setId(entity.getId());
        response.setPartyType(entity.getPartyType());
        response.setPartyId(entity.getPartyId());

        if (entity.getAccountsReceivable() != null) {
            response.setAccountsReceivableId(entity.getAccountsReceivable().getAccountId());
            response.setAccountsReceivableCode(entity.getAccountsReceivable().getAccountCode());
            response.setAccountsReceivableDescription(entity.getAccountsReceivable().getDescription());
        }
        if (entity.getAccountsPayable() != null) {
            response.setAccountsPayableId(entity.getAccountsPayable().getAccountId());
            response.setAccountsPayableCode(entity.getAccountsPayable().getAccountCode());
            response.setAccountsPayableDescription(entity.getAccountsPayable().getDescription());
        }
        if (entity.getAdvancesReceived() != null) {
            response.setAdvancesReceivedId(entity.getAdvancesReceived().getAccountId());
            response.setAdvancesReceivedCode(entity.getAdvancesReceived().getAccountCode());
            response.setAdvancesReceivedDescription(entity.getAdvancesReceived().getDescription());
        }
        if (entity.getAdvancesPaid() != null) {
            response.setAdvancesPaidId(entity.getAdvancesPaid().getAccountId());
            response.setAdvancesPaidCode(entity.getAdvancesPaid().getAccountCode());
            response.setAdvancesPaidDescription(entity.getAdvancesPaid().getDescription());
        }
        if (entity.getPdcsReceived() != null) {
            response.setPdcsReceivedId(entity.getPdcsReceived().getAccountId());
            response.setPdcsReceivedCode(entity.getPdcsReceived().getAccountCode());
            response.setPdcsReceivedDescription(entity.getPdcsReceived().getDescription());
        }
        if (entity.getPdcsIssued() != null) {
            response.setPdcsIssuedId(entity.getPdcsIssued().getAccountId());
            response.setPdcsIssuedCode(entity.getPdcsIssued().getAccountCode());
            response.setPdcsIssuedDescription(entity.getPdcsIssued().getDescription());
        }
        if (entity.getContractAssets() != null) {
            response.setContractAssetsId(entity.getContractAssets().getAccountId());
            response.setContractAssetsCode(entity.getContractAssets().getAccountCode());
            response.setContractAssetsDescription(entity.getContractAssets().getDescription());
        }
        if (entity.getRetentionReceivables() != null) {
            response.setRetentionReceivablesId(entity.getRetentionReceivables().getAccountId());
            response.setRetentionReceivablesCode(entity.getRetentionReceivables().getAccountCode());
            response.setRetentionReceivablesDescription(entity.getRetentionReceivables().getDescription());
        }
        if (entity.getRetentionPayables() != null) {
            response.setRetentionPayablesId(entity.getRetentionPayables().getAccountId());
            response.setRetentionPayablesCode(entity.getRetentionPayables().getAccountCode());
            response.setRetentionPayablesDescription(entity.getRetentionPayables().getDescription());
        }
        if (entity.getRetentionOutputVat() != null) {
            response.setRetentionOutputVatId(entity.getRetentionOutputVat().getAccountId());
            response.setRetentionOutputVatCode(entity.getRetentionOutputVat().getAccountCode());
            response.setRetentionOutputVatDescription(entity.getRetentionOutputVat().getDescription());
        }
        if (entity.getRetentionInputVat() != null) {
            response.setRetentionInputVatId(entity.getRetentionInputVat().getAccountId());
            response.setRetentionInputVatCode(entity.getRetentionInputVat().getAccountCode());
            response.setRetentionInputVatDescription(entity.getRetentionInputVat().getDescription());
        }
        if (entity.getUnbilledPurchases() != null) {
            response.setUnbilledPurchasesId(entity.getUnbilledPurchases().getAccountId());
            response.setUnbilledPurchasesCode(entity.getUnbilledPurchases().getAccountCode());
            response.setUnbilledPurchasesDescription(entity.getUnbilledPurchases().getDescription());
        }
        if (entity.getAdvanceToReceive() != null) {
            response.setAdvanceToReceiveId(entity.getAdvanceToReceive().getAccountId());
            response.setAdvanceToReceiveCode(entity.getAdvanceToReceive().getAccountCode());
            response.setAdvanceToReceiveDescription(entity.getAdvanceToReceive().getDescription());
        }

        return response;
    }
}
