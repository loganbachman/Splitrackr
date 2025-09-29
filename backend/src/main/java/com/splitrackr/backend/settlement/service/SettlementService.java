package com.splitrackr.backend.settlement.service;

import com.splitrackr.backend.household.repository.HouseholdRepository;
import com.splitrackr.backend.settlement.dto.SettlementResponse;
import com.splitrackr.backend.settlement.model.Settlement;
import com.splitrackr.backend.settlement.model.SettlementBalance;
import com.splitrackr.backend.settlement.model.SettlementStatus;
import com.splitrackr.backend.settlement.model.SettlementTransfer;
import com.splitrackr.backend.settlement.repository.SettlementBalanceRepository;
import com.splitrackr.backend.settlement.repository.SettlementRepository;
import com.splitrackr.backend.settlement.repository.SettlementTransferRepository;
import com.splitrackr.backend.user.User;
import com.splitrackr.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final SettlementTransferRepository settlementTransferRepository;
    private final SettlementBalanceRepository settlementBalanceRepository;
    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;
    private final BalanceCalculationService balanceCalculationService;
    private final TransferCalculationService transferCalculationService;


    @Transactional(readOnly = true)
    public SettlementResponse computeBalance() {
        var user = getAuthenticatedUser();
        Integer householdId = user.getUserHouseholdId();

        // calculate current balances
        Map<Integer, Integer> balances = balanceCalculationService.calculateBalances(householdId);
        var period = balanceCalculationService.determinePeriod(householdId);

        // get users and their balances for response
        List<Integer> userIds = balances.keySet().stream().toList();
        Map<Integer, User> users = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // calculate balances for each user
        List<SettlementResponse.UserBalanceDto> balanceDtos = balances.entrySet()
                .stream()
                .map(entry -> {
                    User u = users.get(entry.getKey());
                    return SettlementResponse.UserBalanceDto.builder()
                            .userId(entry.getKey())
                            .userName(u.getFirstname() + " " + u.getLastname())
                            .netCents(entry.getValue())
                            .build();
                })
                .toList();

        // calculate transfers
        var transfers = transferCalculationService.calculateMinimalTransfers(balances);
        List<SettlementResponse.TransferDto> transferDtos = transfers.stream()
                .map(t -> {
                    User fromUser = users.get(t.fromUserId());
                    User toUser = users.get(t.toUserId());
                    return SettlementResponse.TransferDto.builder()
                            .fromUserId(t.fromUserId())
                            .toUserId(t.toUserId())
                            .amountCents(t.amountCents())
                            .fromUserName(fromUser.getFirstname() + " " + fromUser.getLastname())
                            .toUserName(toUser.getFirstname() + " " + toUser.getLastname())
                            .build();
                })
                .toList();

        // final settlement response
        return SettlementResponse.builder()
                .householdId(householdId)
                .asOf(Instant.now())
                .periodStart(period.start())
                .periodEnd(period.end())
                .balances(balanceDtos)
                .transfers(transferDtos)
                .build();
    }

    @Transactional
    public SettlementResponse getOpenSettlement() {
        var user = getAuthenticatedUser();
        Integer householdId = user.getUserHouseholdId();

        // calculate balances
        Map<Integer, Integer> balances = balanceCalculationService.calculateBalances(householdId);

        boolean allZero = balances.values().stream().allMatch(balance -> balance == 0);
        if(allZero) {
            throw new IllegalStateException("All balances are zero - nothing to settle");
        }

        var open = settlementRepository.findOpenByHousehold(householdId);
        open.ifPresent(settlementRepository::delete);

        // get transfers
        var transfers = transferCalculationService.calculateMinimalTransfers(balances);
        var period = balanceCalculationService.determinePeriod(householdId);
        var household = householdRepository.findById(householdId).orElseThrow();

        // new open settlement
        var settlement = Settlement.builder()
                .householdId(household)
                .createdBy(user)
                .status(SettlementStatus.OPEN)
                .periodStart(period.start())
                .periodEnd(period.end())
                .build();

        settlement = settlementRepository.save(settlement);

        // create cache of user transfers
        Map<Integer, User> userCache = userRepository.findAllById(
                balances.keySet().stream().toList())
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // iterate through transfers and build and save them
        for(var transfer : transfers) {
            var transferEntity = SettlementTransfer.builder()
                    .settlement(settlement)
                    .fromUser(userCache.get(transfer.fromUserId()))
                    .toUser(userCache.get(transfer.toUserId()))
                    .amountCents(transfer.amountCents())
                    .build();
            settlementTransferRepository.save(transferEntity);
        }

        for(Map.Entry<Integer, Integer> entry : balances.entrySet()) {
            var balanceEntity = SettlementBalance.builder()
                    .settlement(settlement)
                    .user(userCache.get(entry.getKey()))
                    .netCents(entry.getValue())
                    .build();
            settlementBalanceRepository.save(balanceEntity);
        }

        return buildSettlementResponse(settlement, userCache);
    }

    @Transactional
    public SettlementResponse getRecentSettlement() {
        var user = getAuthenticatedUser();
        Integer householdId = user.getUserHouseholdId();

        var openSettlement = settlementRepository.findOpenByHousehold(householdId);
        if(openSettlement.isEmpty()) {
            throw new IllegalStateException("Open settlement not found");
        }
        return buildSettlementResponseFromEntity(openSettlement.get());
    }

    @Transactional
    public List<SettlementResponse> getSettlementHistory() {
        var user = getAuthenticatedUser();
        Integer householdId = user.getUserHouseholdId();

        // get 25 pages of history
        var settlements = settlementRepository.findByHouseholdOrderByCreatedAtDesc(
                householdId, PageRequest.of(0,25));

        return settlements.stream()
                .map(this::buildSettlementResponseFromEntity)
                .toList();
    }

    @Transactional
    public SettlementResponse finalizeSettlement(Integer settlementId) {
        var user = getAuthenticatedUser();
        Integer householdId = user.getUserHouseholdId();

        var settlement = settlementRepository.findById(settlementId).orElseThrow();

        // make sure settlement can be finalized
        if(settlement.getStatus() != SettlementStatus.OPEN) {
            throw new IllegalStateException("Settlement not open");
        }

        // finalize it and save
        settlement.setStatus(SettlementStatus.FINALIZED);
        settlement = settlementRepository.save(settlement);

        return buildSettlementResponseFromEntity(settlement);
    }

    private SettlementResponse buildSettlementResponse(Settlement settlement, Map<Integer, User> userCache) {
        // build transfer DTOs
        List<SettlementResponse.TransferDto> transferDtos = settlement.getTransfers()
                .stream()
                .map(t -> {
                    User fromUser = userCache.get(t.getFromUser().getId());
                    User toUser = userCache.get(t.getToUser().getId());
                    return SettlementResponse.TransferDto.builder()
                            .fromUserId(fromUser.getId())
                            .toUserId(toUser.getId())
                            .amountCents(t.getAmountCents())
                            .fromUserName(fromUser.getFirstname() + " " + fromUser.getLastname())
                            .toUserName(toUser.getFirstname() + " " + toUser.getLastname())
                            .build();
                })
                .toList();

        // build balance DTOs
        List<SettlementResponse.UserBalanceDto> balanceDtos = settlement.getBalances()
                .stream()
                .map(b -> {
                    User u = userCache.get(b.getUser().getId());
                    return SettlementResponse.UserBalanceDto.builder()
                            .userId(b.getUser().getId())
                            .userName(u.getFirstname() + " " + u.getLastname())
                            .netCents(b.getNetCents())
                            .build();
                })
                .toList();


        return SettlementResponse.builder()
                .settlementId(settlement.getSettlementId())
                .householdId(settlement.getHouseholdId().getHouseholdId())
                .status(settlement.getStatus().name())
                .periodStart(settlement.getPeriodStart())
                .periodEnd(settlement.getPeriodEnd())
                .createdAt(settlement.getCreatedAt())
                .createdBy(mapUserToDto(settlement.getCreatedBy()))
                .transfers(transferDtos)
                .balances(balanceDtos)
                .build();
    }

    private SettlementResponse buildSettlementResponseFromEntity(Settlement settlement) {
        // get user details for this settlement
        List<Integer> userIds = settlement.getBalances().stream()
                .map(b -> b.getUser().getId())
                .toList();
        Map<Integer, User> userCache = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return buildSettlementResponse(settlement, userCache);
    }


    private User getAuthenticatedUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    private SettlementResponse.UserDto mapUserToDto(User user) {
        return SettlementResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstname())
                .lastName(user.getLastname())
                .build();
    }


}
