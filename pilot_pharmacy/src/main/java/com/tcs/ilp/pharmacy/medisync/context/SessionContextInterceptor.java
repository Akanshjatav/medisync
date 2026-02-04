package com.tcs.ilp.pharmacy.medisync.context;

import jakarta.servlet.http.HttpServletRequest;
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
                             jakarta.servlet.http.HttpServletResponse response,
                             Object handler) {

        HttpSession session = request.getSession(false);
        if (session == null) return true;

        String role = (String) session.getAttribute("ROLE");

        if ("VENDOR".equals(role)) {
            requestContext.setVendor(
                    (Integer) session.getAttribute("VENDOR_ID")
            );
        } else if (role != null) {
            requestContext.setUser(
                    (Integer) session.getAttribute("USER_ID"),
                    (Integer) session.getAttribute("STORE_ID"),
                    role
            );
        }

        return true;
    }
}
