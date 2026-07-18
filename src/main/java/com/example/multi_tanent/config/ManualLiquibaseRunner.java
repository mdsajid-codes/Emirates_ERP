package com.example.multi_tanent.config;

import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component("manualLiquibaseRunner")
public class ManualLiquibaseRunner implements InitializingBean {

    private final DataSource dataSource;

    @Value("${spring.liquibase.change-log}")
    private String changeLog;

    public ManualLiquibaseRunner(@Qualifier("masterDataSource") DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("DEBUG: ManualLiquibaseRunner starting migration...");
        String path = changeLog;
        if (path.startsWith("classpath:")) {
            path = path.substring("classpath:".length());
        }
        try (Connection connection = dataSource.getConnection()) {
            Database database = DatabaseFactory.getInstance()
                    .findCorrectDatabaseImplementation(new JdbcConnection(connection));
            Liquibase liquibase = new Liquibase(path, new ClassLoaderResourceAccessor(), database);
            liquibase.update("");
            System.out.println("DEBUG: ManualLiquibaseRunner migration completed successfully.");
        } catch (Exception e) {
            System.err.println("ERROR: ManualLiquibaseRunner migration failed!");
            e.printStackTrace();
            throw e;
        }
    }
}
