package com.tcs.ilp.pharmacy.medisync.context;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class SessionContextInterceptor implements HandlerInterceptor {

    private final RequestContext requestContext;

    public SessionContextInterceptor(RequestContext requestContext) {
        this.requestContext = requestContext;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {

        String path = request.getRequestURI();

        // ✅ allow preflight requests through
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // ✅ auth endpoints don’t need an existing session
        if (path.startsWith("/api/v1/auth/")) {
            return true;
        }

        HttpSession session = request.getSession(false);

        // --- Debug logs (keep for now) ---
        System.out.println("PATH: " + path);
        System.out.println("Cookie header: " + request.getHeader("Cookie"));

        // ✅ No session => block protected endpoints
        if (session == null) {
            System.out.println("No session found.");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        // --- More debug ---
        System.out.println("SessionID: " + session.getId());
        System.out.println("ROLE: " + session.getAttribute("ROLE"));
        System.out.println("USER_ID: " + session.getAttribute("USER_ID"));
        System.out.println("STORE_ID: " + session.getAttribute("STORE_ID"));
        System.out.println("VENDOR_ID: " + session.getAttribute("VENDOR_ID"));

        // ✅ Extract attributes from session
        String role = (String) session.getAttribute("ROLE");

        // If role missing -> not authenticated
        if (role == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        if ("VENDOR".equalsIgnoreCase(role)) {
            Integer vendorId = (Integer) session.getAttribute("VENDOR_ID");
            if (vendorId == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return false;
            }
            requestContext.setVendor(vendorId);
        } else {
            Integer userId = (Integer) session.getAttribute("USER_ID");
            Integer storeId = (Integer) session.getAttribute("STORE_ID");

            if (userId == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return false;
            }

            requestContext.setUser(userId, storeId, role);
        }

        return true;
    }
}