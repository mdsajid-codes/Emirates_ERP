package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.pos.dto.ProductRequest;
import com.example.multi_tanent.pos.dto.ProductVariantRequest;
import com.example.multi_tanent.pos.dto.StockMovementRequest;
import com.example.multi_tanent.pos.entity.*;
import com.example.multi_tanent.pos.repository.*;
import com.example.multi_tanent.spersusers.enitity.Store;
import com.example.multi_tanent.spersusers.enitity.Tenant;
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
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PosDummyDataService {

    private final TenantRepository tenantRepository;
    private final TaxRateRepository taxRateRepository;
    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;
    private final CustomerRepository customerRepository;
    private final ProductService productService;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final StockMovementService stockMovementService;
    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryRepository inventoryRepository;
    private final ObjectMapper objectMapper;

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
            Map<String, Category> categoryMap = new HashMap<>();
            JsonNode categoriesNode = root.get("categories");
            int catCount = 0;
            if (categoriesNode != null && categoriesNode.isArray()) {
                for (JsonNode cNode : categoriesNode) {
                    String name = cNode.get("name").asText();
                    String description = cNode.has("description") ? cNode.get("description").asText() : "";

                    Optional<Category> existing = categoryRepository.findAll().stream()
                            .filter(c -> c.getName().equalsIgnoreCase(name)).findFirst();
                    Category cat;
                    if (existing.isPresent()) {
                        cat = existing.get();
                    } else {
                        cat = new Category();
                        cat.setTenant(tenant);
                        cat.setName(name);
                        cat.setDescription(description);
                        cat = categoryRepository.save(cat);
                        catCount++;
                    }
                    categoryMap.put(name, cat);
                }
            }
            counts.put("categories", catCount);

            // 4. Seed Customers
            List<Customer> seededCustomers = new ArrayList<>();
            JsonNode customersNode = root.get("customers");
            int custCount = 0;
            if (customersNode != null && customersNode.isArray()) {
                for (JsonNode custNode : customersNode) {
                    String name = custNode.get("name").asText();
                    String phone = custNode.has("phone") ? custNode.get("phone").asText() : "";
                    String email = custNode.has("email") ? custNode.get("email").asText() : "";

                    Optional<Customer> existing = customerRepository.findAll().stream()
                            .filter(c -> c.getEmail() != null && c.getEmail().equalsIgnoreCase(email)).findFirst();
                    Customer customer;
                    if (existing.isPresent()) {
                        customer = existing.get();
                    } else {
                        customer = new Customer();
                        customer.setTenant(tenant);
                        customer.setName(name);
                        customer.setPhone(phone);
                        customer.setEmail(email);
                        customer = customerRepository.save(customer);
                        custCount++;
                    }
                    seededCustomers.add(customer);
                }
            }
            counts.put("customers", custCount);

            // 5. Seed Products & Variants
            JsonNode productsNode = root.get("products");
            int prodCount = 0;
            List<ProductVariant> createdVariants = new ArrayList<>();

            if (productsNode != null && productsNode.isArray()) {
                for (JsonNode pNode : productsNode) {
                    String name = pNode.get("name").asText();
                    String sku = pNode.get("sku").asText();
                    String categoryName = pNode.get("categoryName").asText();
                    Category cat = categoryMap.get(categoryName);
                    int initialStockQty = pNode.has("initialStock") ? pNode.get("initialStock").asInt() : 50;
                    List<ProductVariant> variantsToStock = new ArrayList<>();

                    Optional<Product> existing = productRepository.findAll().stream()
                            .filter(p -> p.getSku() != null && p.getSku().equalsIgnoreCase(sku)).findFirst();
                    if (existing.isEmpty()) {
                        ProductRequest req = new ProductRequest();
                        req.setName(name);
                        req.setSku(sku);
                        req.setDescription(name + " - High Quality Dubai ERP Product");
                        req.setActive(true);
                        if (cat != null) {
                            req.setCategoryId(cat.getId());
                        }

                        ProductVariantRequest variantReq = new ProductVariantRequest();
                        variantReq.setSku(sku + "-V1");
                        variantReq.setBarcode(pNode.has("barcode") ? pNode.get("barcode").asText() : "BAR-" + sku);
                        variantReq.setPriceCents(pNode.get("priceCents").asLong());
                        variantReq.setCostCents(pNode.get("costCents").asLong());
                        variantReq.setActive(true);
                        if (defaultTax != null) {
                            variantReq.setTaxRateId(defaultTax.getId());
                        }

                        req.setVariants(Collections.singletonList(variantReq));

                        productService.createProduct(req);
                        prodCount++;

                        Optional<ProductVariant> pvOpt = productVariantRepository.findAll().stream()
                                .filter(pv -> pv.getSku() != null && pv.getSku().equalsIgnoreCase(sku + "-V1")).findFirst();
                        if (pvOpt.isPresent()) {
                            ProductVariant pv = pvOpt.get();
                            if (pNode.has("image")) {
                                pv.setImageUrl(pNode.get("image").asText());
                                productVariantRepository.save(pv);
                            }
                            variantsToStock.add(pv);
                        }
                    } else {
                        variantsToStock.addAll(existing.get().getVariants());
                    }

                    if (targetStore != null) {
                        for (ProductVariant pv : variantsToStock) {
                            Optional<Inventory> invOpt = inventoryRepository.findByStoreIdAndProductVariantId(targetStore.getId(), pv.getId());
                            if (invOpt.isEmpty() || invOpt.get().getQuantity() == null || invOpt.get().getQuantity() <= 0) {
                                StockMovementRequest smReq = new StockMovementRequest();
                                smReq.setStoreId(targetStore.getId());
                                smReq.setProductVariantId(pv.getId());
                                smReq.setChangeQuantity((long) initialStockQty);
                                smReq.setReason("Dummy Data Seeding Restock");
                                stockMovementService.createStockMovement(smReq);
                            }
                            createdVariants.add(pv);
                        }
                    }
                }
            }
            counts.put("products", prodCount);

            // 6. Seed Initial Sales Transactions for realistic analytics
            int saleCount = 0;
            if (defaultStore != null && !createdVariants.isEmpty() && !seededCustomers.isEmpty()) {
                long timestamp = System.currentTimeMillis();
                Random random = new Random(42);
                for (int i = 1; i <= 15; i++) {
                    String orderId = "ORD-SEED-" + timestamp + "-" + String.format("%04d", i);
                    String invoiceNo = "INV-SEED-" + timestamp + "-" + String.format("%04d", i);
                    Optional<Sale> existingSale = saleRepository.findAll().stream()
                            .filter(s -> s.getOrderId() != null && s.getOrderId().equalsIgnoreCase(orderId)).findFirst();
                    if (existingSale.isEmpty()) {
                        Customer cust = seededCustomers.get(random.nextInt(seededCustomers.size()));
                        ProductVariant variant = createdVariants.get(random.nextInt(createdVariants.size()));

                        Sale sale = new Sale();
                        sale.setTenant(tenant);
                        sale.setStore(defaultStore);
                        sale.setCustomer(cust);
                        sale.setOrderId(orderId);
                        sale.setInvoiceNo(invoiceNo);
                        sale.setSubtotalCents(variant.getPriceCents() * 2);
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
                        item.setProductVariant(variant);
                        item.setQuantity(2L);
                        item.setUnitPriceCents(variant.getPriceCents());
                        item.setLineTotalCents(variant.getPriceCents() * 2);
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
