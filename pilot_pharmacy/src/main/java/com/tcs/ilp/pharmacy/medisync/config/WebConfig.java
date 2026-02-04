package com.tcs.ilp.pharmacy.medisync.config;

import com.tcs.ilp.pharmacy.medisync.context.SessionContextInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final SessionContextInterceptor sessionContextInterceptor;

    public WebConfig(SessionContextInterceptor sessionContextInterceptor) {
        this.sessionContextInterceptor = sessionContextInterceptor;
    }

    // -----------------------------
    // Session → RequestContext
    // -----------------------------
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessionContextInterceptor)
                .addPathPatterns("/api/**");
    }

    // -----------------------------
    // CORS (Angular + Cookies)
    // -----------------------------
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:4200",
                        "http://127.0.0.1:4200"
                )
                .allowedMethods(
                        "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
                )
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
