package com.example.digitalclassroombackend.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve files from uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + Paths.get("uploads").toAbsolutePath() + "/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                    "http://localhost:3000",
                    "http://localhost:8080",
                    "https://digital-classroom-chk9-2mghun07f-sams-projects-7d6e29fb.vercel.app",
                    "https://digital-classroom-chk9-hrgrk087y-sams-projects-7d6e29fb.vercel.app",
                    "https://*.vercel.app"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
