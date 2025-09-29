package com.splitrackr.backend.household.controller;

import com.splitrackr.backend.household.dto.*;
import com.splitrackr.backend.household.service.HouseholdService;
import com.splitrackr.backend.household.repository.HouseholdMembershipRepository;
import com.splitrackr.backend.household.repository.HouseholdRepository;
import com.splitrackr.backend.user.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/v1/household")
@AllArgsConstructor
public class HouseholdController {

    private final HouseholdService service;

    @PostMapping
    public ResponseEntity<HouseholdResponse> createHousehold(
            @RequestBody CreateHouseholdRequest request
            ) {
        return ResponseEntity.ok(service.createHousehold(request));
    }

    @PostMapping("/join")
    public ResponseEntity<HouseholdResponse> joinHousehold(
            @RequestBody JoinHouseholdRequest request
    ) {
        return ResponseEntity.ok(service.joinHousehold(request));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<HouseholdResponse>> myHouseholds() {
        return ResponseEntity.ok(service.myHouseholds());
    }

    @PutMapping("/switch")
    public ResponseEntity<HouseholdResponse> switchHouseholds(
        @RequestBody SwitchHouseholdRequest request
        ) {
        return ResponseEntity.ok(service.switchHousehold(request));
    }

    @GetMapping("/active")
    public ResponseEntity<HouseholdResponse> activeHousehold() {
        return service.activeHousehold()
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(null, HttpStatus.NOT_FOUND));
    }

    @GetMapping("/houseUsers")
    public ResponseEntity<List<HouseholdMemberResponse>> houseUsers(
            @RequestParam Integer houseId
    ) {
        return ResponseEntity.ok(service.houseUsers(houseId));
    }
}
