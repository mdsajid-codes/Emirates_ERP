// com/example/multi_tanent/config/TenantBootstrap.java
package com.example.multi_tanent.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TenantBootstrap {

  @Bean
  public ApplicationRunner loadTenantsOnStartup(
      TenantRegistry registry,
      @Qualifier("tenantRoutingDataSource") TenantRoutingDataSource routing) {
    return args -> {
      registry.attachRouting(routing);
      registry.loadAllFromMaster();  // pulls master_tenant rows, builds Hikari pools, refreshes routing
      var targets = registry.asTargetMap();
      if (targets.isEmpty()) {
        System.out.println("⚠️  No tenants found in master_tenant. App started; add a tenant with the master API.");
      } else {
        System.out.println("✅ Tenants loaded: " + targets.keySet());
      }
    };
  }
}
