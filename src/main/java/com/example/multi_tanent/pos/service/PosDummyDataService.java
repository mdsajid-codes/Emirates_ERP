package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.enums.CrmItemType;
import com.example.multi_tanent.pos.dto.StockMovementRequest;
import com.example.multi_tanent.pos.entity.*;
import com.example.multi_tanent.pos.repository.*;
import com.example.multi_tanent.production.entity.ProCategory;
import com.example.multi_tanent.production.entity.ProTax;
import com.example.multi_tanent.production.entity.ProUnit;
import com.example.multi_tanent.production.repository.ProCategoryRepository;
import com.example.multi_tanent.production.repository.ProTaxRepository;
import com.example.multi_tanent.production.repository.ProUnitRepository;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.spersusers.enitity.Store;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.PartyRepository;
import com.example.multi_tanent.spersusers.repository.CrmSalesProductRepository;
import com.example.multi_tanent.spersusers.repository.StoreRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PosDummyDataService {

    private final TenantRepository tenantRepository;
    private final TaxRateRepository taxRateRepository;
    private final StoreRepository storeRepository;
    private final StockMovementService stockMovementService;
    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryRepository inventoryRepository;
    private final ObjectMapper objectMapper;
    private final PartyRepository partyRepository;
    private final CrmSalesProductRepository crmSalesProductRepository;
    private final ProCategoryRepository proCategoryRepository;
    private final ProTaxRepository proTaxRepository;
    private final ProUnitRepository proUnitRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            tenantId = "star";
        }
        final String searchId = tenantId;
        return tenantRepository.findByTenantId(searchId)
                .orElseGet(() -> tenantRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalStateException("No Tenant found in system")));
    }

    public Map<String, Object> seedDummyData() {
        return seedDummyData(null);
    }

    public Map<String, Object> seedDummyData(Long targetStoreId) {
        Tenant tenant = getCurrentTenant();
        Map<String, Object> counts = new LinkedHashMap<>();

        try {
            ClassPathResource resource = new ClassPathResource("pos-seed-data.json");
            InputStream inputStream = resource.getInputStream();
            JsonNode root = objectMapper.readTree(inputStream);

            // 1. Seed Tax Rates
            TaxRate defaultTax = null;
            JsonNode taxRatesNode = root.get("taxRates");
            int taxCount = 0;
            if (taxRatesNode != null && taxRatesNode.isArray()) {
                for (JsonNode tNode : taxRatesNode) {
                    String name = tNode.get("name").asText();
                    double percent = tNode.get("percent").asDouble();
                    boolean compound = tNode.has("compound") && tNode.get("compound").asBoolean();

                    Optional<TaxRate> existing = taxRateRepository.findAll().stream()
                            .filter(t -> t.getName().equalsIgnoreCase(name)).findFirst();
                    if (existing.isPresent()) {
                        defaultTax = existing.get();
                    } else {
                        TaxRate taxRate = new TaxRate();
                        taxRate.setTenant(tenant);
                        taxRate.setName(name);
                        taxRate.setPercent(BigDecimal.valueOf(percent));
                        taxRate.setCompound(compound);
                        defaultTax = taxRateRepository.save(taxRate);
                        taxCount++;
                    }
                }
            }
            counts.put("taxRates", taxCount);

            // Seed ProTax (For CRM Sales Product)
            ProTax defaultProTax = null;
            if (taxRatesNode != null && taxRatesNode.isArray()) {
                for (JsonNode tNode : taxRatesNode) {
                    String name = tNode.get("name").asText();
                    String code = name.replace(" ", "").toUpperCase();
                    double percent = tNode.get("percent").asDouble();

                    Optional<ProTax> existingProTax = proTaxRepository.findAll().stream()
                            .filter(t -> t.getCode().equalsIgnoreCase(code)).findFirst();
                    if (existingProTax.isPresent()) {
                        defaultProTax = existingProTax.get();
                    } else {
                        ProTax proTax = new ProTax();
                        proTax.setTenant(tenant);
                        proTax.setCode(code);
                        proTax.setRate(BigDecimal.valueOf(percent));
                        proTax.setDescription(name);
                        defaultProTax = proTaxRepository.save(proTax);
                    }
                }
            }

            // Seed ProUnit
            ProUnit defaultUnit = null;
            Optional<ProUnit> existingUnit = proUnitRepository.findAll().stream()
                    .filter(u -> u.getName().equalsIgnoreCase("PCS")).findFirst();
            if (existingUnit.isPresent()) {
                defaultUnit = existingUnit.get();
            } else {
                ProUnit proUnit = new ProUnit();
                proUnit.setTenant(tenant);
                proUnit.setName("PCS");
                proUnit.setDescription("Pieces");
                defaultUnit = proUnitRepository.save(proUnit);
            }

            // 2. Seed Stores
            Store defaultStore = null;
            JsonNode storesNode = root.get("stores");
            int storeCount = 0;
            if (storesNode != null && storesNode.isArray()) {
                for (JsonNode sNode : storesNode) {
                    String name = sNode.get("name").asText();
                    Optional<Store> existing = storeRepository.findAll().stream()
                            .filter(s -> s.getName().equalsIgnoreCase(name)).findFirst();
                    if (existing.isPresent()) {
                        defaultStore = existing.get();
                    } else {
                        Store store = new Store();
                        store.setTenant(tenant);
                        store.setName(name);
                        store.setAddress(sNode.has("address") ? sNode.get("address").asText() : "Dubai, UAE");
                        store.setCurrency(sNode.has("currency") ? sNode.get("currency").asText() : "AED");
                        store.setTimezone(sNode.has("timezone") ? sNode.get("timezone").asText() : "Asia/Dubai");
                        store.setVatNumber(sNode.has("vatNumber") ? sNode.get("vatNumber").asText() : "100200300400003");
                        defaultStore = storeRepository.save(store);
                        storeCount++;
                    }
                }
            }
            if (defaultStore == null) {
                defaultStore = storeRepository.findAll().stream().findFirst().orElse(null);
            }
            counts.put("stores", storeCount);

            Store targetStore = null;
            if (targetStoreId != null) {
                targetStore = storeRepository.findById(targetStoreId).orElse(null);
            }
            if (targetStore == null) {
                targetStore = defaultStore;
            }

            // 3. Seed Categories
            Map<String, ProCategory> categoryMap = new HashMap<>();
            JsonNode categoriesNode = root.get("categories");
            int catCount = 0;
            if (categoriesNode != null && categoriesNode.isArray()) {
                for (JsonNode cNode : categoriesNode) {
                    String name = cNode.get("name").asText();

                    Optional<ProCategory> existing = proCategoryRepository.findAll().stream()
                            .filter(c -> c.getName().equalsIgnoreCase(name)).findFirst();
                    ProCategory cat;
                    if (existing.isPresent()) {
                        cat = existing.get();
                    } else {
                        cat = new ProCategory();
                        cat.setTenant(tenant);
                        cat.setName(name);
                        cat.setCode(name.substring(0, Math.min(name.length(), 4)).toUpperCase());
                        cat = proCategoryRepository.save(cat);
                        catCount++;
                    }
                    categoryMap.put(name, cat);
                }
            }
            counts.put("categories", catCount);

            // 4. Seed Customers
            List<BaseCustomer> seededCustomers = new ArrayList<>();
            JsonNode customersNode = root.get("customers");
            int custCount = 0;
            if (customersNode != null && customersNode.isArray()) {
                for (JsonNode custNode : customersNode) {
                    String name = custNode.get("name").asText();
                    String phone = custNode.has("phone") ? custNode.get("phone").asText() : "";
                    String email = custNode.has("email") ? custNode.get("email").asText() : "";

                    Optional<BaseCustomer> existing = partyRepository.findAll().stream()
                            .filter(p -> p instanceof BaseCustomer && ((BaseCustomer) p).getContactEmail() != null && ((BaseCustomer) p).getContactEmail().equalsIgnoreCase(email))
                            .map(p -> (BaseCustomer) p)
                            .findFirst();
                    BaseCustomer customer;
                    if (existing.isPresent()) {
                        customer = (BaseCustomer) existing.get();
                    } else {
                        customer = new BaseCustomer();
                        customer.setTenant(tenant);
                        customer.setCompanyName(name);
                        customer.setMobile(phone);
                        customer.setContactEmail(email);
                        customer.setPartyType(com.example.multi_tanent.spersusers.base.PartyBase.PartyType.CUSTOMER);
                        customer.setActive(true);
                        customer = partyRepository.save(customer);
                        custCount++;
                    }
                    seededCustomers.add(customer);
                }
            }
            counts.put("customers", custCount);

            // 5. Seed Products
            JsonNode productsNode = root.get("products");
            int prodCount = 0;

            if (productsNode != null && productsNode.isArray()) {
                for (JsonNode pNode : productsNode) {
                    String name = pNode.get("name").asText();
                    String sku = pNode.get("sku").asText();
                    String categoryName = pNode.get("categoryName").asText();
                    ProCategory cat = categoryMap.get(categoryName);
                    int initialStockQty = pNode.has("initialStock") ? pNode.get("initialStock").asInt() : 50;

                    Optional<CrmSalesProduct> existing = crmSalesProductRepository.findAll().stream()
                            .filter(p -> p.getItemCode() != null && p.getItemCode().equalsIgnoreCase(sku)).findFirst();
                    
                    CrmSalesProduct prod;
                    if (existing.isEmpty()) {
                        prod = new CrmSalesProduct();
                        prod.setTenant(tenant);
                        prod.setName(name);
                        prod.setItemCode(sku);
                        prod.setDescription(name + " - High Quality Dubai ERP Product");
                        if (cat != null) {
                            prod.setCategory(cat);
                        }
                        prod.setIsSales(true);
                        prod.setIsPurchase(true);
                        prod.setItemType(CrmItemType.PRODUCT);
                        
                        long priceCents = pNode.has("priceCents") ? pNode.get("priceCents").asLong() : 5000L;
                        long costCents = pNode.has("costCents") ? pNode.get("costCents").asLong() : 2500L;
                        prod.setSalesPrice(BigDecimal.valueOf(priceCents).divide(BigDecimal.valueOf(100)));
                        prod.setPurchasePrice(BigDecimal.valueOf(costCents).divide(BigDecimal.valueOf(100)));
                        
                        prod.setBarcode(pNode.has("barcode") ? pNode.get("barcode").asText() : "BAR-" + sku);
                        if (pNode.has("image")) {
                            prod.setImageUrl(pNode.get("image").asText());
                        }
                        if (defaultUnit != null) {
                            prod.setUnitOfMeasure(defaultUnit.getName());
                        }
                        if (defaultProTax != null) {
                            prod.setTax(defaultProTax.getCode());
                            prod.setTaxRate(defaultProTax.getRate().doubleValue());
                        } else if (defaultTax != null) {
                            prod.setTax(defaultTax.getName());
                            prod.setTaxRate(defaultTax.getPercent().doubleValue());
                        }
                        prod = crmSalesProductRepository.save(prod);
                        prodCount++;
                    } else {
                        prod = existing.get();
                    }

                    if (targetStore != null) {
                        Optional<Inventory> invOpt = inventoryRepository.findByStoreIdAndProductId(targetStore.getId(), prod.getId());
                        if (invOpt.isEmpty() || invOpt.get().getQuantity() == null || invOpt.get().getQuantity() <= 0) {
                            StockMovementRequest smReq = new StockMovementRequest();
                            smReq.setStoreId(targetStore.getId());
                            smReq.setProductId(prod.getId());
                            smReq.setChangeQuantity((long) initialStockQty);
                            smReq.setReason("Dummy Data Seeding Restock");
                            stockMovementService.createStockMovement(smReq);
                        }
                    }
                }
            }
            counts.put("products", prodCount);

            // 6. Seed Initial Sales Transactions for realistic analytics
            int saleCount = 0;
            List<CrmSalesProduct> masterProducts = crmSalesProductRepository.findByTenantId(tenant.getId());
            List<BaseCustomer> baseCustomers = partyRepository.findAll().stream()
                    .filter(p -> p instanceof BaseCustomer)
                    .map(p -> (BaseCustomer) p)
                    .toList();

            if (defaultStore != null && !masterProducts.isEmpty() && !baseCustomers.isEmpty()) {
                long timestamp = System.currentTimeMillis();
                Random random = new Random(42);
                for (int i = 1; i <= 15; i++) {
                    String orderId = "ORD-SEED-" + timestamp + "-" + String.format("%04d", i);
                    String invoiceNo = "INV-SEED-" + timestamp + "-" + String.format("%04d", i);
                    Optional<Sale> existingSale = saleRepository.findAll().stream()
                            .filter(s -> s.getOrderId() != null && s.getOrderId().equalsIgnoreCase(orderId)).findFirst();
                    if (existingSale.isEmpty()) {
                        BaseCustomer cust = baseCustomers.get(random.nextInt(baseCustomers.size()));
                        CrmSalesProduct masterProd = masterProducts.get(random.nextInt(masterProducts.size()));

                        long unitPriceCents = masterProd.getSalesPrice() != null ? masterProd.getSalesPrice().multiply(BigDecimal.valueOf(100)).longValue() : 5000L;

                        Sale sale = new Sale();
                        sale.setTenant(tenant);
                        sale.setStore(defaultStore);
                        sale.setCustomer(cust);
                        sale.setOrderId(orderId);
                        sale.setInvoiceNo(invoiceNo);
                        sale.setSubtotalCents(unitPriceCents * 2);
                        sale.setTaxCents((long) (sale.getSubtotalCents() * 0.05));
                        sale.setTotalCents(sale.getSubtotalCents() + sale.getTaxCents());
                        sale.setDiscountCents(0L);
                        sale.setStatus("completed");
                        sale.setPaymentStatus("paid");
                        sale.setOrderType(com.example.multi_tanent.pos.enums.OrderType.TAKEAWAY);

                        sale = saleRepository.save(sale);

                        // Item
                        SaleItem item = new SaleItem();
                        item.setSale(sale);
                        item.setProduct(masterProd);
                        item.setQuantity(2L);
                        item.setUnitPriceCents(unitPriceCents);
                        item.setLineTotalCents(unitPriceCents * 2);
                        saleItemRepository.save(item);

                        // Payment
                        Payment payment = new Payment();
                        payment.setSale(sale);
                        payment.setMethod("cash");
                        payment.setAmountCents(sale.getTotalCents());
                        payment.setReference("POS-CASH-REF");
                        paymentRepository.save(payment);

                        saleCount++;
                    }
                }
            }
            counts.put("sales", saleCount);
            counts.put("message", "POS dummy data seeded successfully!");

            return counts;
        } catch (Exception e) {
            throw new RuntimeException("Failed to seed POS dummy data: " + e.getMessage(), e);
        }
    }
}
