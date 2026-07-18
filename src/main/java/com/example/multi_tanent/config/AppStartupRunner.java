package com.example.multi_tanent.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.net.InetAddress;

@Component
public class AppStartupRunner implements ApplicationRunner {

    private static final Logger LOG = LoggerFactory.getLogger(AppStartupRunner.class);

    private final Environment env;

    public AppStartupRunner(Environment env) {
        this.env = env;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        String port = env.getProperty("server.port", "8080");
        String hostAddress = "localhost";
        String protocol = env.getProperty("server.ssl.enabled", "false").equals("true") ? "https" : "http";
        try {
            hostAddress = InetAddress.getLocalHost().getHostAddress();
        } catch (Exception e) {
            LOG.warn("Could not determine host address, defaulting to localhost.");
        }
        LOG.info("\n----------------------------------------------------------\n\t" +
                "✅ Application '{}' is running! Access URLs:\n\t" +
                "Local: \t\t{}://localhost:{}\n\t" +
                "External: \t{}://{}:{}\n----------------------------------------------------------",
                env.getProperty("spring.application.name", "App"), protocol, port, protocol, hostAddress, port);

    }
}