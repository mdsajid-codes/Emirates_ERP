package com.example.multi_tanent.config;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;

@Service
public class TenantLiquibaseService {

    public void runUpdate(DataSource dataSource, String changeLogFile) {
        try (Connection connection = dataSource.getConnection()) {
            Database database = DatabaseFactory.getInstance()
                    .findCorrectDatabaseImplementation(new JdbcConnection(connection));
            
            java.util.Map<String, Object> scopeObjects = new java.util.HashMap<>();
            scopeObjects.put(liquibase.Scope.Attr.database.name(), database);
            
            liquibase.Scope.child(scopeObjects, () -> {
                Liquibase liquibase = new Liquibase(changeLogFile, new ClassLoaderResourceAccessor(), database);
                liquibase.update((Contexts) null, new LabelExpression());
            });
            
            System.out.println("✅ Liquibase update completed successfully for changelog: " + changeLogFile
                    + " (all contexts)");
        } catch (Exception e) {
            System.err.println("❌ Liquibase update failed: " + e.getMessage());
            throw new RuntimeException("Liquibase update failed", e);
        }
    }
}
