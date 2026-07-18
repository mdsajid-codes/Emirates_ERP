package com.example.multi_tanent.accounts.service.coa;

import com.example.multi_tanent.accounts.dto.coa.ChartOfAccountRequest;
import com.example.multi_tanent.accounts.dto.coa.ChartOfAccountResponse;
import com.example.multi_tanent.accounts.entity.coa.AccountDimension;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.AccountSection;
import com.example.multi_tanent.accounts.entity.enums.DimensionType;
import com.example.multi_tanent.accounts.repository.coa.AccountDimensionRepository;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.accounts.repository.journal.JournalEntryLineRepository;
import com.example.multi_tanent.accounts.service.journal.AuditLogService;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class ChartOfAccountServiceImpl implements ChartOfAccountService {

    private final ChartOfAccountRepository coaRepository;
    private final AccountDimensionRepository dimensionRepository;
    private final JournalEntryLineRepository lineRepository;
    private final TenantRepository tenantRepository;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    private Tenant resolveCurrentTenant() {
        String tenantIdStr = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantIdStr)
                .orElseThrow(() -> new IllegalStateException("Tenant context not initialized properly."));
    }

    @SneakyThrows
    private String toJson(Object obj) {
        return objectMapper.writeValueAsString(obj);
    }

    @Override
    public ChartOfAccountResponse createAccount(ChartOfAccountRequest request, String createdBy) {
        Tenant tenant = resolveCurrentTenant();

        if (coaRepository.existsByAccountCodeAndTenant(request.getAccountCode(), tenant.getId())) {
            throw new IllegalArgumentException("Account code already exists: " + request.getAccountCode());
        }

        ChartOfAccount parent = null;
        Integer calculatedLevel = 1;
        if (request.getParentId() != null) {
            parent = coaRepository.findById(request.getParentId())
                    .orElseThrow(() -> new NoSuchElementException("Parent account not found with ID: " + request.getParentId()));
            calculatedLevel = parent.getLevel() + 1;
        }

        ChartOfAccount coa = ChartOfAccount.builder()
                .accountCode(request.getAccountCode())
                .description(request.getDescription())
                .accountType(request.getAccountType())
                .section(request.getSection())
                .parentGroup(request.getParentGroup())
                .parent(parent)
                .level(calculatedLevel)
                .isOffBalance(request.getIsOffBalance() != null ? request.getIsOffBalance() : false)
                .isQuantitative(request.getIsQuantitative() != null ? request.getIsQuantitative() : false)
                .currency(request.getCurrency() != null ? request.getCurrency() : "AED")
                .isActive(true)
                .details(request.getDetails())
                .tenant(tenant)
                .createdBy(createdBy)
                .build();

        if (request.getDimensions() != null) {
            for (var dimReq : request.getDimensions()) {
                AccountDimension dim = AccountDimension.builder()
                        .dimensionType(dimReq.getDimensionType())
                        .trackAmount(dimReq.getTrackAmount() != null ? dimReq.getTrackAmount() : true)
                        .trackQuantitative(dimReq.getTrackQuantitative() != null ? dimReq.getTrackQuantitative() : false)
                        .turnoversOnly(dimReq.getTurnoversOnly() != null ? dimReq.getTurnoversOnly() : false)
                        .build();
                coa.addDimension(dim);
            }
        }

        ChartOfAccount saved = coaRepository.save(coa);
        auditLogService.log("CREATE", "ChartOfAccount", saved.getAccountId(), createdBy, null, toJson(toResponse(saved)));

        return toResponse(saved);
    }

    @Override
    @SneakyThrows
    public ChartOfAccountResponse updateAccount(Long id, ChartOfAccountRequest request, String updatedBy) {
        Tenant tenant = resolveCurrentTenant();
        ChartOfAccount coa = coaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Account not found with ID: " + id));

        ChartOfAccountResponse oldState = toResponse(coa);

        coa.setDescription(request.getDescription());
        coa.setParentGroup(request.getParentGroup());

        ChartOfAccount parent = null;
        Integer calculatedLevel = 1;
        if (request.getParentId() != null) {
            parent = coaRepository.findById(request.getParentId())
                    .orElseThrow(() -> new NoSuchElementException("Parent account not found with ID: " + request.getParentId()));
            calculatedLevel = parent.getLevel() + 1;
        }
        coa.setParent(parent);
        coa.setLevel(calculatedLevel);

        coa.setIsOffBalance(request.getIsOffBalance() != null ? request.getIsOffBalance() : false);
        coa.setIsQuantitative(request.getIsQuantitative() != null ? request.getIsQuantitative() : false);
        coa.setCurrency(request.getCurrency() != null ? request.getCurrency() : "AED");
        coa.setDetails(request.getDetails());

        // Replace dimensions
        dimensionRepository.deleteByAccountId(id);
        coa.getDimensions().clear();

        if (request.getDimensions() != null) {
            for (var dimReq : request.getDimensions()) {
                AccountDimension dim = AccountDimension.builder()
                        .dimensionType(dimReq.getDimensionType())
                        .trackAmount(dimReq.getTrackAmount() != null ? dimReq.getTrackAmount() : true)
                        .trackQuantitative(dimReq.getTrackQuantitative() != null ? dimReq.getTrackQuantitative() : false)
                        .turnoversOnly(dimReq.getTurnoversOnly() != null ? dimReq.getTurnoversOnly() : false)
                        .build();
                coa.addDimension(dim);
            }
        }

        ChartOfAccount saved = coaRepository.save(coa);
        auditLogService.log("UPDATE", "ChartOfAccount", saved.getAccountId(), updatedBy, toJson(oldState), toJson(toResponse(saved)));

        return toResponse(saved);
    }

    @Override
    public ChartOfAccountResponse getById(Long id) {
        ChartOfAccount coa = coaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Account not found with ID: " + id));
        return toResponse(coa);
    }

    @Override
    public ChartOfAccountResponse getByCode(String code) {
        Tenant tenant = resolveCurrentTenant();
        ChartOfAccount coa = coaRepository.findByAccountCodeAndTenant(code, tenant.getId())
                .orElseThrow(() -> new NoSuchElementException("Account not found with code: " + code));
        return toResponse(coa);
    }

    @Override
    public List<ChartOfAccountResponse> getAll() {
        Tenant tenant = resolveCurrentTenant();
        return coaRepository.findAllByTenant(tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getTree() {
        Tenant tenant = resolveCurrentTenant();
        List<ChartOfAccount> allAccounts = coaRepository.findAllByTenant(tenant.getId());

        // Find root nodes (accounts that have parent == null)
        List<ChartOfAccount> rootAccounts = allAccounts.stream()
                .filter(coa -> coa.getParent() == null)
                .collect(Collectors.toList());

        List<Map<String, Object>> tree = new ArrayList<>();
        for (ChartOfAccount root : rootAccounts) {
            tree.add(buildNodeMap(root));
        }

        // Keep legacy grouping support if root level is empty but parentGroups exist
        if (tree.isEmpty() && !allAccounts.isEmpty()) {
            Map<String, List<ChartOfAccount>> grouped = allAccounts.stream()
                    .collect(Collectors.groupingBy(c -> c.getParentGroup() != null ? c.getParentGroup() : "Uncategorized"));

            for (var entry : grouped.entrySet()) {
                Map<String, Object> node = new LinkedHashMap<>();
                node.put("parentGroup", entry.getKey());
                node.put("description", entry.getKey());
                if (!entry.getValue().isEmpty()) {
                    node.put("section", entry.getValue().get(0).getSection().name());
                } else {
                    node.put("section", "ACCOUNTS_GROUP");
                }
                List<ChartOfAccountResponse> mappedAccounts = entry.getValue().stream().map(this::toResponse).collect(Collectors.toList());
                node.put("accounts", mappedAccounts);
                node.put("children", mappedAccounts);
                tree.add(node);
            }
        }

        return tree;
    }

    private Map<String, Object> buildNodeMap(ChartOfAccount coa) {
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("accountId", coa.getAccountId());
        node.put("accountCode", coa.getAccountCode());
        node.put("description", coa.getDescription());
        node.put("accountType", coa.getAccountType().name());
        node.put("section", coa.getSection().name());
        node.put("parentGroup", coa.getParentGroup());
        node.put("parentId", coa.getParent() != null ? coa.getParent().getAccountId() : null);
        node.put("level", coa.getLevel());
        node.put("isActive", coa.getIsActive());
        node.put("isQuantitative", coa.getIsQuantitative());
        node.put("isOffBalance", coa.getIsOffBalance());
        node.put("currency", coa.getCurrency());

        List<Map<String, Object>> dimsList = new ArrayList<>();
        if (coa.getDimensions() != null) {
            for (var dim : coa.getDimensions()) {
                Map<String, Object> dimMap = new HashMap<>();
                dimMap.put("dimensionId", dim.getDimensionId());
                dimMap.put("dimensionType", dim.getDimensionType().name());
                dimMap.put("trackAmount", dim.getTrackAmount());
                dimMap.put("trackQuantitative", dim.getTrackQuantitative());
                dimMap.put("turnoversOnly", dim.getTurnoversOnly());
                dimsList.add(dimMap);
            }
        }
        node.put("dimensions", dimsList);
        
        List<Map<String, Object>> childrenNodes = new ArrayList<>();
        if (coa.getChildren() != null) {
            for (ChartOfAccount child : coa.getChildren()) {
                childrenNodes.add(buildNodeMap(child));
            }
        }
        node.put("children", childrenNodes);
        node.put("accounts", childrenNodes); // frontend list compatibility
        return node;
    }

    @Override
    public List<ChartOfAccountResponse> getBySection(AccountSection section) {
        Tenant tenant = resolveCurrentTenant();
        return coaRepository.findBySectionAndTenant(section, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChartOfAccountResponse> getByParentGroup(String parentGroup) {
        Tenant tenant = resolveCurrentTenant();
        return coaRepository.findByParentGroupAndTenant(parentGroup, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @SneakyThrows
    public ChartOfAccountResponse activate(Long id, String updatedBy) {
        ChartOfAccount coa = coaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + id));

        ChartOfAccountResponse oldState = toResponse(coa);
        coa.setIsActive(true);
        ChartOfAccount saved = coaRepository.save(coa);

        auditLogService.log("ACTIVATE", "ChartOfAccount", saved.getAccountId(), updatedBy, toJson(oldState), toJson(toResponse(saved)));
        return toResponse(saved);
    }

    @Override
    @SneakyThrows
    public ChartOfAccountResponse deactivate(Long id, String updatedBy) {
        ChartOfAccount coa = coaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + id));

        if (lineRepository.existsPostedLinesByAccountId(id)) {
            throw new IllegalStateException("Cannot deactivate an account that has POSTED journal entry lines.");
        }

        ChartOfAccountResponse oldState = toResponse(coa);
        coa.setIsActive(false);
        ChartOfAccount saved = coaRepository.save(coa);

        auditLogService.log("DEACTIVATE", "ChartOfAccount", saved.getAccountId(), updatedBy, toJson(oldState), toJson(toResponse(saved)));
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        ChartOfAccount coa = coaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + id));

        if (lineRepository.existsAnyLinesByAccountId(id)) {
            throw new IllegalStateException("Cannot delete an account that has any journal entry lines associated with it.");
        }

        coaRepository.delete(coa);
    }

    @Override
    public List<String> getSectionDropdown() {
        return Arrays.stream(AccountSection.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getParentGroupDropdown() {
        Tenant tenant = resolveCurrentTenant();
        return coaRepository.findDistinctParentGroupsByTenant(tenant.getId());
    }

    @Override
    public List<ChartOfAccountResponse> getAccountsForDimension(DimensionType dimensionType) {
        Tenant tenant = resolveCurrentTenant();
        // Return accounts that have a mapping for this dimension
        return coaRepository.findAllByTenant(tenant.getId()).stream()
                .filter(coa -> coa.getDimensions().stream().anyMatch(d -> d.getDimensionType() == dimensionType))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ChartOfAccountResponse toResponse(ChartOfAccount coa) {
        ChartOfAccountResponse resp = new ChartOfAccountResponse();
        resp.setAccountId(coa.getAccountId());
        resp.setAccountCode(coa.getAccountCode());
        resp.setDescription(coa.getDescription());
        resp.setAccountType(coa.getAccountType());
        resp.setSection(coa.getSection());
        resp.setParentGroup(coa.getParentGroup());
        resp.setParentId(coa.getParent() != null ? coa.getParent().getAccountId() : null);
        resp.setLevel(coa.getLevel());
        resp.setIsOffBalance(coa.getIsOffBalance());
        resp.setIsQuantitative(coa.getIsQuantitative());
        resp.setCurrency(coa.getCurrency());
        resp.setIsActive(coa.getIsActive());
        resp.setDetails(coa.getDetails());

        if (coa.getDimensions() != null) {
            resp.setDimensions(coa.getDimensions().stream().map(dim -> {
                ChartOfAccountResponse.DimensionResponse d = new ChartOfAccountResponse.DimensionResponse();
                d.setDimensionId(dim.getDimensionId());
                d.setDimensionType(dim.getDimensionType());
                d.setTrackAmount(dim.getTrackAmount());
                d.setTrackQuantitative(dim.getTrackQuantitative());
                d.setTurnoversOnly(dim.getTurnoversOnly());
                return d;
            }).collect(Collectors.toList()));
        }

        if (coa.getChildren() != null && !coa.getChildren().isEmpty()) {
            resp.setChildren(coa.getChildren().stream().map(this::toResponse).collect(Collectors.toList()));
        }

        return resp;
    }
}
