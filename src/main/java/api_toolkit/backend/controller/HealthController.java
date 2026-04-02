package api_toolkit.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import api_toolkit.backend.dto.ApiResponse;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * 
 * Provides endpoints for monitoring application health
 */
@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("service", "API Toolkit Backend");
        healthData.put("timestamp", System.currentTimeMillis());
        
        return ApiResponse.success("Service is healthy", healthData);
    }

    @GetMapping("/ready")
    public ApiResponse<String> ready() {
        return ApiResponse.success("Ready to receive traffic", "READY");
    }
}
