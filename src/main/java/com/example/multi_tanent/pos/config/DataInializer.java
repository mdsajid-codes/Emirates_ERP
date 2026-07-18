// package com.example.multi_tanent.pos.config;

// import com.example.multi_tanent.master.entity.MasterTenant;
// import com.example.multi_tanent.pos.entity.PosUser;
// import com.example.multi_tanent.pos.entity.Tenant;
// import com.example.multi_tanent.pos.enums.PosRole;
// import com.example.multi_tanent.pos.repository.PosUserRepository;
// import com.example.multi_tanent.pos.repository.TenantRepository;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;
// import org.springframework.transaction.annotation.Transactional;

// import java.util.Optional;

// @Component
// public class DataInializer { // Note: Typo in class name as per user's file

//     private static final Logger logger = LoggerFactory.getLogger(DataInializer.class);

//     private final PosUserRepository posUserRepository;
//     private final TenantRepository tenantRepository;
//     private final PasswordEncoder passwordEncoder;

//     public DataInializer(PosUserRepository posUserRepository,
//                            TenantRepository tenantRepository,
//                            PasswordEncoder passwordEncoder) {
//         this.posUserRepository = posUserRepository;
//         this.tenantRepository = tenantRepository;
//         this.passwordEncoder = passwordEncoder;
//     }

//     /**
//      * Initializes default data for a new tenant. This method should be called
//      * during the tenant provisioning process, after the tenant's database and
//      * schema have been created. It assumes the TenantContext is already set.
//      *
//      * @param masterTenant The master record for the tenant being provisioned.
//      * @param adminEmail The email for the default admin user.
//      * @param adminPassword The password for the default admin user.
//      */
//     @Transactional("tenantTx")
//     public void initializeTenantData(MasterTenant masterTenant, String adminEmail, String adminPassword) {
//         // Step 1: Create the Tenant record within its own database.
//         // This is crucial as other entities in this DB will link to it.
//         Tenant tenant = createTenantRecord(masterTenant);
//         if (tenant == null) {
//             logger.error("Failed to create or find tenant record in its own DB for tenantId: {}. Aborting data initialization.", masterTenant.getTenantId());
//             return;
//         }

//         // Step 2: Create the default POS Admin user.
//         createDefaultPosAdmin(tenant, adminEmail, adminPassword);

//         // Future initializers for other entities (e.g., default store) can be called here.
//         logger.info("Successfully initialized default data for tenant: {}", masterTenant.getTenantId());
//     }

//     private Tenant createTenantRecord(MasterTenant masterTenant) {
//         // In a tenant-specific DB for POS, there should be only one Tenant record.
//         // Let's check if it already exists.
//         Optional<Tenant> existingTenant = tenantRepository.findFirstByOrderByIdAsc();
//         if (existingTenant.isPresent()) {
//             logger.warn("Tenant record already exists in this database for tenantId: {}. Skipping creation.", masterTenant.getTenantId());
//             return existingTenant.get();
//         }

//         Tenant tenant = new Tenant();
//         // We assume the ID is auto-generated and don't set it manually.
//         // The previous implementation tried to parse masterTenant.getTenantId() as a Long,
//         // which is unsafe as the ID can be a string like 'my_company'.
//         tenant.setName(masterTenant.getCompanyName());
//         return tenantRepository.save(tenant);
//     }

    

//     private void createDefaultPosAdmin(Tenant tenant, String adminEmail, String adminPassword) {
//         // Use the tenant admin's email as the username for the POS admin.
//         String adminUsername = adminEmail;
//         if (posUserRepository.findByEmailAndTenantId(adminUsername, tenant.getId()).isEmpty()) {
//             PosUser adminUser = PosUser.builder()
//                     .tenant(tenant)
//                     .email(adminUsername) // The user entity uses 'email' as the unique identifier, not 'username'
//                     .displayName("POS Administrator")
//                     .passwordHash(passwordEncoder.encode(adminPassword))
//                     .role(PosRole.POS_ADMIN) // Using POS_ADMIN to align with @PreAuthorize annotations
//                     .build();

//             posUserRepository.save(adminUser);
//             logger.info("Created default POS admin user '{}' for tenant: {}", adminUsername, tenant.getId());
//         } else {
//             logger.warn("Default POS admin user '{}' already exists for tenant: {}. Skipping creation.", adminUsername, tenant.getId());
//         }
//     }
// }
