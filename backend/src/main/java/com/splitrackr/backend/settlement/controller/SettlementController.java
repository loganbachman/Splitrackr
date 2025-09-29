package com.splitrackr.backend.settlement.controller;
import com.splitrackr.backend.settlement.dto.SettlementResponse;
import com.splitrackr.backend.settlement.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/settlement")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService service;

    @GetMapping
    public ResponseEntity<SettlementResponse> computeBalance() {
        return ResponseEntity.ok(service.computeBalance());
    }

    @PostMapping("/open")
    public ResponseEntity<SettlementResponse> getOpenSettlement() {
        return ResponseEntity.ok(service.getOpenSettlement());
    }

    @GetMapping("/recent")
    public ResponseEntity<SettlementResponse> getRecentSettlement() {
        return ResponseEntity.ok(service.getRecentSettlement());
    }

    @GetMapping("/history")
    public ResponseEntity<List<SettlementResponse>> getSettlementHistory() {
        return ResponseEntity.ok(service.getSettlementHistory());
    }

    @PutMapping("/finalize")
    public ResponseEntity<SettlementResponse> finalizeSettlement(
            @RequestParam Integer settlementId
    ) {
        return ResponseEntity.ok(service.finalizeSettlement(settlementId));
    }
}
